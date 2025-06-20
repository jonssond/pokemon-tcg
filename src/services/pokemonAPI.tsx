import api from "./api";

export interface PokemonCard {
  id: string;
  name: string;
  images: {
    small: string;
    large: string;
  };
}

export interface PokemonCardResponse {
  data: PokemonCard;
}

export interface PokemonCardsResponse {
  data: PokemonCard[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}

let cardCache: PokemonCard[] = [];
let isInitialized = false;


export const initializeCardCache = async (): Promise<PokemonCard[]> => {
  if (isInitialized && cardCache.length > 0) return cardCache;

  try {
    const pageSize = 50;
    const pagesToFetch = 3;
    const requests = [];

    for (let page = 1; page <= pagesToFetch; page++) {
      requests.push(
        api.get<PokemonCardsResponse>('/cards', {
          params: {
            q: 'supertype:Pokémon',
            page,
            pageSize
          }
        })
      );
    }

    const response = await Promise.all(requests);
    cardCache = response.flatMap(response => response.data.data);
    isInitialized = true;

    console.log(`Loaded ${cardCache.length} cards into cache`);
    return cardCache;
  } catch(error) {
    console.error('Error initializing card cache: ', error);
    throw error;
  }
}

export const getRandomCardFromCache = (): PokemonCard => {
  if (cardCache.length === 0) {
    throw new Error('Card cache not initialized');
  }

  const randomIndex = Math.floor(Math.random() * cardCache.length);
  return cardCache[randomIndex];
}

export const getRandomCard = async (): Promise<PokemonCard> => {
  try {
    await initializeCardCache();
    return getRandomCardFromCache();
  } catch (error) {
    console.error('Error fetching random Pokemon card:', error);
    throw error;
  }
}