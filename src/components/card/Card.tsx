import * as THREE from 'three';
import { useEffect, useMemo, useRef, useState } from "react"
import { useTexture } from '@react-three/drei';
import { type PokemonCard } from '../../services/pokemonAPI';
import { useFrame } from '@react-three/fiber';

type cardProps = {
    position: [number, number, number],
    rotation: [number, number, number],
    isInHand: boolean,
    pokemonCard?: PokemonCard,
    xPosition?: number,
    isFocused?: boolean,
    onFocusChange?: (cardId: string) => void,
    cardId: string,
    onDragStart?: (cardId: string) => void,
    onDragEnd?: (cardId: string, position: THREE.Vector3) => void,
    mouseWorldPosition: THREE.Vector3,
    isDragging: boolean,
    isOnBoard: boolean
}

export const Card = (props: cardProps) => {
    const ref = useRef<THREE.Mesh>(null);
    const [positions, setPositions] = useState(props.position);
    const [rotation, setRotation] = useState(props.rotation);
    const [xPosition, setXPosition] = useState<number>(props.xPosition || 0);
    
    const [mouseRotation, setMouseRotation] = useState<number>(0);
    const [isRotating, setIsRotating] = useState<boolean>(false);
    const [lastMouseX, setLastMouseX] = useState<number>(0);
    const [hasDragged, setHasDragged] = useState<boolean>(false);
    const [isDraggingThis, setIsDraggingThis] = useState<boolean>(false);
    const [isPointerDown, setIsPointerDown] = useState<boolean>(false);

    

    const isFocused = props.isFocused || false;
    const isInHand = props.isInHand || false;
    const [isHovered, setIsHovered] = useState<boolean>(false);

    const frontImageUrl = props.pokemonCard?.images.large || '/card_backside.png';
    const [frontTexture, backTexture] = useTexture([frontImageUrl, '/card_backside.png'], (textures) => {
        textures.forEach(texture => {
            texture.generateMipmaps = false;
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.flipY = true;
        })
    });
    
    const materials = useMemo(() => {        
        return [
            new THREE.MeshStandardMaterial({ color: '#333333' }),
            new THREE.MeshStandardMaterial({ color: '#333333' }),
            new THREE.MeshStandardMaterial({ color: '#333333' }),
            new THREE.MeshStandardMaterial({ color: '#333333' }),
            new THREE.MeshStandardMaterial({ map: frontTexture }),
            new THREE.MeshStandardMaterial({ map: backTexture }),
        ];
    }, [frontTexture, backTexture, props.pokemonCard?.id]);

    useEffect(() => {
        if (isFocused && (isInHand || props.isOnBoard)) {
            setPositions([0, 6, 8]);
            setRotation([-Math.PI / 5, 0, 0]);
            setMouseRotation(0);
        } else if (!isFocused && isInHand) {
            setPositions([xPosition, 2, 9]);
            setRotation([-Math.PI / 4, 0, 0]);
            setMouseRotation(0);
        } else if (!isFocused && props.isOnBoard) {
            setPositions(props.position);
            setRotation(props.rotation);
            setMouseRotation(0);
        }
    }, [isFocused, isInHand, xPosition, props.isOnBoard, props.position, props.rotation]);

    useEffect(() => {
        setXPosition(props.xPosition || 0);
    }, [props.xPosition]);
    
    useEffect(() => {
        if (!isDraggingThis) {
            setPositions(props.position);
            setRotation(props.rotation);
        }
    }, [props.position, props.rotation, isDraggingThis]);

    useFrame((state, delta) => {
        if (isDraggingThis && props.mouseWorldPosition && ref.current) {
            const newPosition = props.mouseWorldPosition.clone();
            newPosition.y = 0.1;
            ref.current.position.copy(newPosition);
            ref.current.rotation.set(-Math.PI / 2, 0, 0);
        } else if (ref.current) {
            ref.current.position.set(positions[0], positions[1], positions[2]);
            ref.current.rotation.set(rotation[0], rotation[1], rotation[2]);
        }
        
        if (isFocused && ref.current) {
            const clampedRotation = Math.max(-Math.PI / 6, Math.min(Math.PI / 6, mouseRotation));
            ref.current.rotation.y = clampedRotation;
        }

        
    });

    const handlePointerDown = (event: any) => {
        if (isFocused) {
            setIsRotating(true);
            setIsPointerDown(true);
            setHasDragged(false);
            setLastMouseX(event.clientX);
            event.stopPropagation();
        } else if (isInHand && !isFocused) {
            setIsPointerDown(true);
            setHasDragged(false);
            setLastMouseX(event.clientX);
            event.stopPropagation();
        }
    };

    const handlePointerMove = (event: any) => {
        if (isRotating && isFocused && isPointerDown) {
            const deltaX = event.clientX - lastMouseX;

            if (Math.abs(deltaX) > 2) {
                setHasDragged(true);
            }
            const rotationSensivity = 0.01;
            const newRotation = mouseRotation + deltaX * rotationSensivity;

            const clampedRotation = Math.max(-Math.PI / 6, Math.min(Math.PI / 6, newRotation));
            setMouseRotation(clampedRotation);
            setLastMouseX(event.clientX);
            event.stopPropagation();
        } else if (isInHand && !isFocused && !isDraggingThis && isPointerDown) {
            const deltaX = event.clientX - lastMouseX;

            if (Math.abs(deltaX) > 5) {
                setIsDraggingThis(true);
                setHasDragged(true);
                props.onDragStart?.(props.cardId);
            }

            event.stopPropagation();
        } else if (isDraggingThis) {
            setHasDragged(true);
            event.stopPropagation();
        }
    };

    const handlePointerUp = (event: any) => {
        setIsPointerDown(false);
        
        if (isRotating) {
            setIsRotating(false);
        }

        if (isDraggingThis) {
            setIsDraggingThis(false);

            if (ref.current) {
                props.onDragEnd?.(props.cardId, ref.current.position);
            }

            setHasDragged(false);
        }
        
        event?.stopPropagation();
    };

    const handleClickCard = () => {
        if (hasDragged) {
            setHasDragged(false);
            return;
        }

        if (isInHand || props.isOnBoard) {
            props.onFocusChange?.(props.cardId);
        } 
    };

    const getCardScale = () => {
        if (isHovered && isInHand && !isFocused && !props.isDragging) {
            return 1.5; 
        }
        if (props.isOnBoard && !isInHand && !isFocused) {
            return 2;
        }
        return 1; 
    };

    return (
        <mesh 
            name="card"
            ref={ref} 
            material={materials} 
            position={positions} 
            rotation={rotation} 
            onPointerEnter={(event) => (event.stopPropagation(), setIsHovered(true))}
            onPointerLeave={() => setIsHovered(false)}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            scale={getCardScale()}
            onClick={handleClickCard}
        >
            <boxGeometry args={[3, 4.5, 0.03]} />
        </mesh>
    )
}