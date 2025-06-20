import * as THREE from 'three';
import { Canvas } from '@react-three/fiber'
import './App.css'
import { Card } from './components/card/Card'
import { useEffect, useRef, useState } from 'react';
import { GizmoHelper, GizmoViewport } from '@react-three/drei';
import { getRandomCardFromCache, initializeCardCache, type PokemonCard } from './services/pokemonAPI';
import { MagneticPlane } from './components/board/MagneticPlane';

type card = {
  position: [number, number, number],
  rotation: [number, number, number],
  pokemonCard?: PokemonCard,
  id: string
}

function App() {
  const [isFirstBuy, setIsFirstBuy] = useState(true);
  const [cardDeck, setCardDeck] = useState<card[]>([]);
  const [cardHand, setCardHand] = useState<card[]>([]);
  const [focusedCardId, setFocusedCardId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingStatus, setLoadingStatus] = useState<string>('Initializing...');
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const initializeDeck = async () => {
      try {
        setIsLoading(true);
        setLoadingStatus('Loading card database...');

        await initializeCardCache();

        setLoadingStatus('Creating deck...');

        const initialCards: card[] = [];
        for (let i = 0; i < 60; i++) {
          const pokemonCard = getRandomCardFromCache();
          initialCards.push({
            position: [-12, -i * 0.02, 1],
            rotation: [Math.PI / 2, 0, 0],
            pokemonCard,
            id: `card-${i}`
          });
        }

        setLoadingStatus('Finalizing...');
        setCardDeck(initialCards);

        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error initializing deck:', error);
        setLoadingStatus('Error loading cards. Please refresh.');
      }
    };

    initializeDeck();
  }, []);

  const handleClickDeck = () => {
    if (isFirstBuy && cardDeck.length > 0) {
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

          handArray.push(({
            ...card,
            position: [xPosition, 0, 8],
            rotation: [-Math.PI / 4, 0, 0]
          }))
        } else {
          deckArray.push(card);
        }
      })

      setCardDeck(deckArray);
      setCardHand(handArray);
      setIsFirstBuy(false);
    }
  }

  const handleCardFocusChange = (cardId: string) => {
    if (focusedCardId === cardId) {
      setFocusedCardId(null);
    } else {
      setFocusedCardId(cardId);
    }
  }

  if (isLoading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'black',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        fontSize: '18px',
        zIndex: 9999
      }}>
        <div style={{
          marginBottom: '20px',
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          Pokemon TCG
        </div>
        <div style={{
          padding: '20px',
          background: 'rgba(0, 0, 0, 0.1)',
          borderRadius: '10px',
          backdropFilter: 'blur(10px)',
          textAlign: 'center',
        }}>
          {loadingStatus}
        </div>
      </div>
    );
  }

  return (
    <>
      <Canvas camera={{ position: [0, 7, 11], fov: 90 }}>
        <ambientLight />

        <MagneticPlane />

        <group ref={groupRef} onClick={handleClickDeck}>
          {cardDeck.map((card) => {
            return <Card 
                      key={card.id} 
                      cardId={card.id}
                      position={card.position} 
                      rotation={card.rotation} 
                      isInHand={false} 
                      pokemonCard={card.pokemonCard}
                      isFocused={false}
                      onFocusChange={handleCardFocusChange}
                    />
          })}
          {cardHand.map((card) => {
            return <Card 
                      key={card.id} 
                      cardId={card.id}
                      position={card.position} 
                      rotation={card.rotation} 
                      isInHand={true} 
                      pokemonCard={card.pokemonCard} 
                      xPosition={card.position[0]}
                      isFocused={focusedCardId === card.id}
                      onFocusChange={handleCardFocusChange}
                    /> 
          })}
        </group>

        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2, 2, 2]} />
          <meshBasicMaterial color={"orange"} />
        </mesh>
        {/* <OrbitControls /> */}
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
