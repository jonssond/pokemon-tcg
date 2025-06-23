import * as THREE from 'three';

export const Gameboard = () => {
    return (
        <mesh name="board" position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[200, 200]}/>
            <meshBasicMaterial 
                color="blue"
                transparent
                opacity={0.3}
                side={THREE.DoubleSide}
            />
        </mesh>
    )
}