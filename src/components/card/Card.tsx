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
    cardId: string
}

export const Card = (props: cardProps) => {
    const ref = useRef<THREE.Mesh>(null);
    const [positions, setPositions] = useState(props.position);
    const [rotation, setRotation] = useState(props.rotation);
    const [xPosition, setXPosition] = useState<number>(props.xPosition || 0);
    
    const [mouseRotation, setMouseRotation] = useState<number>(0);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [lastMouseX, setLastMouseX] = useState<number>(0);
    const [hasDragged, setHasDragged] = useState<boolean>(false);

    const isFocused = props.isFocused || false;
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const [isInHand, setIsInHand] = useState<boolean>(props.isInHand);

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
        const frontTextureClone = frontTexture.clone();
        const backTextureClone = frontTexture.clone();
        
        frontTextureClone.needsUpdate = true;
        backTextureClone.needsUpdate = true;
        
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
        if (isFocused && isInHand) {
            setPositions([0, 6, 8]);
            setRotation([-Math.PI / 5, 0, 0]);
            setMouseRotation(0);
        } else if (!isFocused && isInHand) {
            setPositions([xPosition, 0, 8]);
            setRotation([-Math.PI / 4, 0, 0]);
            setMouseRotation(0);
        }
    }, [isFocused, isInHand, xPosition]);

    useEffect(() => {
        setXPosition(props.xPosition || 0);
    }, [props.xPosition]);
    
    useFrame((state, delta) => {
        if (isFocused) {
            const clampedRotation = Math.max(-Math.PI / 6, Math.min(Math.PI / 6, mouseRotation));
            ref.current!.rotation.y = clampedRotation;
        }
    });

    const handlePointerDown = (event: any) => {
        if (isFocused) {
            setIsDragging(true);
            setHasDragged(false);
            setLastMouseX(event.clientX);
            event.stopPropagation();
        }
    };

    const handlePointerMove = (event: any) => {
        if (isDragging && isFocused) {
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
        }   
    }

    const handlePointerUp = () => {
        setIsDragging(false);
    }

    const handleClickCard = () => {
        if (hasDragged) {
            setHasDragged(false);
            return;
        }

        if (isInHand) {
            props.onFocusChange?.(props.cardId);
        } 
    };

    return (
        <mesh 
            ref={ref} 
            material={materials} 
            position={positions} 
            rotation={rotation} 
            onPointerEnter={(event) => (event.stopPropagation(), setIsHovered(true))}
            onPointerLeave={() => setIsHovered(false)}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            scale={isHovered && isInHand && !isFocused ? 1.5 : 1}
            onClick={handleClickCard}
        >
            <boxGeometry args={[3, 4.5, 0.03]} />
        </mesh>
    )
}