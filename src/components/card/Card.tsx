import * as THREE from 'three';
import { useMemo, useRef, useState } from "react"
import { useTexture } from '@react-three/drei';
import { type PokemonCard } from '../../services/pokemonAPI';


type cardProps = {
    position: [number, number, number],
    rotation: [number, number, number],
    isInHand: boolean,
    pokemonCard?: PokemonCard
}

export const Card = (props: cardProps) => {
    const ref = useRef<THREE.Mesh>(null);
    const [positions, setPositions] = useState(props.position);
    const [rotation, setRotations] = useState(props.rotation);

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

    const handleClickCard = () => {
        if (isInHand) {
            //
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
            scale={isHovered && isInHand ? 1.5 : 1}
        >
            <boxGeometry args={[3, 4.5, 0.03]} />
        </mesh>
    )
}