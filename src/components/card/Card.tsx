import * as THREE from 'three';
import { useEffect, useMemo, useRef, useState } from "react"
import { useTexture } from '@react-three/drei';
import { getRandomCard } from '../../services/pokemonAPI';

type cardProps = {
    position: [number, number, number],
    rotation: [number, number, number],
    isInHand: boolean
}

export const Card = (props: cardProps) => {
    const ref = useRef<THREE.Mesh>(null);
    const hasFetchedCard = useRef<boolean>(false);
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const [frontImageUrl, setFrontImageUrl] = useState<string>('/card_backside.png');

    useEffect(() => {
        if (hasFetchedCard.current) return;

        const fetchCard = async () => {
            try {
                hasFetchedCard.current = true;
                const card = await getRandomCard();
                setFrontImageUrl(card.images.large);
            } catch (error) {
                console.error('Failed to fetch card', error);
                setFrontImageUrl('/venusaur_front.png');
            }
        }

        fetchCard();
    }, []);

    const [frontTexture, backTexture] = useTexture([frontImageUrl, '/card_backside.png']);

    const materials = useMemo(() => [
        new THREE.MeshStandardMaterial({ color: '#333333' }),
        new THREE.MeshStandardMaterial({ color: '#333333' }),
        new THREE.MeshStandardMaterial({ color: '#333333' }),
        new THREE.MeshStandardMaterial({ color: '#333333' }),
        new THREE.MeshStandardMaterial({ map: frontTexture }),
        new THREE.MeshStandardMaterial({ map: backTexture }),
    ], [frontTexture, backTexture]);

    return (
        <mesh 
            ref={ref} 
            material={materials} 
            position={props.position} 
            rotation={props.rotation} 
            onPointerEnter={(event) => (event.stopPropagation(), setIsHovered(true))}
            onPointerLeave={() => setIsHovered(false)}
            scale={isHovered && props.isInHand ? 1.5 : 1}
        >
            <boxGeometry args={[3, 4.5, 0.03]} />
        </mesh>
    )
}