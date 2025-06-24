import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

export const Gameboard = () => {
    const texture = useTexture('board_texture.jpg');

    return (
        <mesh name="board" position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[50, 50]}/>
            <meshBasicMaterial 
                map={texture}
                side={THREE.DoubleSide}
            />
        </mesh>
    )
}