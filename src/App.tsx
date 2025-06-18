import * as THREE from 'three';
import { Canvas } from '@react-three/fiber'
import './App.css'
import { Card } from './components/card/Card'
import { useRef, useState } from 'react';
import { GizmoHelper, GizmoViewport, OrbitControls } from '@react-three/drei';

type card = {
  position: [number, number, number],
  rotation: [number, number, number],
}

const cards: card[] = [];
for (let i = 0; i < 60; i++) {
  cards.push({ position: [-12, -i * 0.02, 1], rotation: [Math.PI / 2, 0, 0] });
}

function App() {
  const [isFirstBuy, setIsFirstBuy] = useState(true);
  const [cardDeck, setCardDeck] = useState<card[]>(cards);
  const [cardHand, setCardHand] = useState<card[]>([]);
  const groupRef = useRef<THREE.Group>(null);

  const handleClickDeck = () => {
    if (isFirstBuy) {
      const topCard = cardDeck.length - 5;
      const cardSpacing = 3;
      const totalWidth = (5 - 1) * cardSpacing; 
      const startX = -(totalWidth / 2); 
      const handArray: card[] = [];


      const deckArray: card[] = [];
      cardDeck.forEach((card, index) => {
        if (index >= topCard) {
          const handIndex = index - topCard; 
          const xPosition = startX + (handIndex * cardSpacing); 

          card.position = [xPosition, 0, 8];
          card.rotation = [-Math.PI / 4, 0, 0];
          handArray.push(card)
        } else {
          deckArray.push(card);
        }
      })

      setCardDeck(deckArray);
      setCardHand(handArray);
      setIsFirstBuy(false);
    }
  }

  return (
    <>
      <Canvas camera={{ position: [0, 7, 10], fov: 90 }}>
        <ambientLight />

        <group ref={groupRef} onClick={handleClickDeck}>
          {cardDeck.map((card, index) => {
            return <Card key={index} position={card.position} rotation={card.rotation} isInHand={false} />
          })}
          {cardHand.map((card, index) => {
            return <Card key={index} position={card.position} rotation={card.rotation} isInHand={true}/> 
          })}
        </group>

        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2, 2, 2]} />
          <meshBasicMaterial color={"orange"} />
        </mesh>
        <OrbitControls />
        <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
          <GizmoViewport
            axisColors={["#9d4b4b", "#2f7f4f", "#3b5b9d"]}
            labelColor="white"
          />
        </GizmoHelper>
      </Canvas>
    </>
  )
}

export default App
