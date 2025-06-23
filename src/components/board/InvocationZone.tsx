import * as THREE from 'three';

export const InvocationZone = () => {
    return (
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[3, 4.5]}/>
            <meshBasicMaterial 
                color="#2a4d3a"
                transparent
                opacity={0.3}
                side={THREE.DoubleSide}
            />
        </mesh>
    )
}