import * as THREE from 'three';
import { Canvas, type ThreeEvent } from '@react-three/fiber'
import './App.css'
import { Card } from './components/card/Card'
import { useEffect, useRef, useState } from 'react';
import { GizmoHelper, GizmoViewport } from '@react-three/drei';
import { getRandomCardFromCache, initializeCardCache, type PokemonCard } from './services/pokemonAPI';
import { InvocationZone } from './components/board/InvocationZone';
import { Gameboard } from './components/board/Gameboard';
import { CardDetails } from './components/cardDetails/CardDetails';

type card = {
  position: [number, number, number],
  rotation: [number, number, number],
  pokemonCard?: PokemonCard,
  id: string
}

function App() {
  const [cardDeck, setCardDeck] = useState<card[]>([]);
  const [cardHand, setCardHand] = useState<card[]>([]);
  const [boardCards, setBoardCards] = useState<card[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingStatus, setLoadingStatus] = useState<string>('Initializing...');

  const [isFirstBuy, setIsFirstBuy] = useState(true);
  const [focusedCard, setFocusedCard] = useState<PokemonCard | null>(null);
  const [isDraggingCard, setIsDraggingCard] = useState<boolean>(false);
  const [mouseWorldPosition, setMouseWorldPosition] = useState<THREE.Vector3>(new THREE.Vector3());

  const groupRef = useRef<THREE.Group>(null);

  const invocationZoneBounds = {
    x: { min: -1.5, max: 1.5 },
    z: { min: -2.25, max: 2.25}
  }

  const isInInvocationZone = (position: THREE.Vector3): boolean => {
    return position.x >= invocationZoneBounds.x.min &&
           position.x <= invocationZoneBounds.x.max &&
           position.z >= invocationZoneBounds.z.min &&
           position.z <= invocationZoneBounds.z.max;
  };

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
            position: [20, i * 0.02, 8],
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
      const topCardsCount = 5;
      const cardSpacing = 3;
      const totalWidth = (5 - 1) * cardSpacing;
      const startX = -(totalWidth / 2);
      const handArray: card[] = [];
      const deckArray: card[] = [];

      const topCards = cardDeck.slice(-topCardsCount);
      const remainingCards = cardDeck.slice(0, -topCardsCount);
      deckArray.push(...remainingCards);

      topCards.forEach((card, index) => {
        const xPosition = startX + (index * cardSpacing);
        handArray.push({
          ...card,
          position: [xPosition, 8, 21],
          rotation: [-Math.PI / 3, 0, 0]
        })
      });

      setCardDeck(deckArray);
      setCardHand(handArray);
      setIsFirstBuy(false);
    }
  }

  const handleCardFocusChange = (card: PokemonCard | undefined) => {
    if (card) {
      console.log(card);
      if (focusedCard?.id === card.id) {
        setFocusedCard(null);
      } else {
        setFocusedCard(card);
      }
    }
  }

  const handleDragStart = () => {
    setIsDraggingCard(true);
    setFocusedCard(null);
  }

  const handleDragEnd = (cardId: string, position: THREE.Vector3) => {
    setIsDraggingCard(false);
    if (isInInvocationZone(position)) {
      const draggedCard = cardHand.find(card => card.id === cardId);
      if (draggedCard) {
        const newBoardCard: card = {
          ...draggedCard,
          position: [0, 0.02, 0],
          rotation: [-Math.PI / 2, 0, 0]
        }

        const filteredHand = cardHand.filter(card => card.id !== cardId);
        const newHand: card[] = [];
        const cardSpacing = 3;
        const totalWidth = (filteredHand.length - 1) * cardSpacing;
        const startX = -(totalWidth / 2);

        filteredHand.forEach((card, index) => {
          const originalX = startX + (index * cardSpacing);
          newHand.push({
            ...card,
            position: [originalX, 8, 21],
            rotation: [-Math.PI / 3, 0, 0]
          })
        })
        setCardHand(newHand);
        setBoardCards(prevBoard => [...prevBoard, newBoardCard]);
      }
    } else {
      const cardIndex = cardHand.findIndex(card => card.id === cardId);
      if (cardIndex !== -1) {
        const cardSpacing = 3;
        const totalWidth = (cardHand.length - 1) * cardSpacing;
        const startX = -(totalWidth / 2);
        const originalX = startX + (cardIndex * cardSpacing);

        setCardHand(prevHand => 
          prevHand.map(card => {
            if (card.id === cardId) {
              return {
                ...card,
                position: [originalX, 8, 21],
                rotation: [-Math.PI / 3, 0, 0]
              };
            }
            return card;
          })
        );
      }
    }
  };

  const handleMousePosition = (event: ThreeEvent<PointerEvent>) => {
    if (isDraggingCard) {
      const boardIntersection = event.intersections.find(e => e.object.name === "board");
  
      if (boardIntersection && boardIntersection.point) {
        setMouseWorldPosition(boardIntersection.point.clone());
      }
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
      <Canvas camera={{ position: [0, 17, 20], fov: 90, rotation: [-Math.PI / 3, 0, 0 ]}}>
        <ambientLight />
        <group ref={groupRef}  onPointerMove={(event) => handleMousePosition(event)}>
          <Gameboard />
          <InvocationZone />

          <group onClick={handleClickDeck}>
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
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                mouseWorldPosition={mouseWorldPosition}
                isDragging={isDraggingCard}
                isOnBoard={false}
              />
            })}
          </group>

          {cardHand.map((card) => {
            return <Card
              key={card.id}
              cardId={card.id}
              position={card.position}
              rotation={card.rotation}
              isInHand={true}
              pokemonCard={card.pokemonCard}
              xPosition={card.position[0]}
              isFocused={focusedCard?.id === card.pokemonCard!.id}
              onFocusChange={handleCardFocusChange}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              mouseWorldPosition={mouseWorldPosition}
              isDragging={isDraggingCard}
              isOnBoard={false}
            />
          })}

          {boardCards.map((card) => {
            return <Card
              key={card.id}
              cardId={card.id}
              position={card.position}
              rotation={card.rotation}
              isInHand={false}
              pokemonCard={card.pokemonCard}
              isFocused={focusedCard?.id === card.pokemonCard!.id}
              onFocusChange={handleCardFocusChange}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              mouseWorldPosition={mouseWorldPosition}
              isDragging={isDraggingCard}
              isOnBoard={true}
            />
          })}
        </group>
        <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
          <GizmoViewport
            axisColors={["#9d4b4b", "#2f7f4f", "#3b5b9d"]}
            labelColor="white"
          />
        </GizmoHelper>
      </Canvas>
      {!!focusedCard && <CardDetails pokemonName={focusedCard.name} pokemonType={focusedCard.types}/>}
    </>
  )
}

export default App
