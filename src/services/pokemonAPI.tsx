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

export const getRandomCard = async () => {
  try {
      const randomPage = Math.floor(Math.random() * 10) + 1;
      const pageSize = 50;

      const response = await api.get<PokemonCardsResponse>('/cards', {
          params: {
              q: 'supertype:Pokémon',
              page: randomPage,
              pageSize,
          }
      });

      const cards = response.data.data;

      if (cards.length === 0) {
          throw new Error('No cards found');
      }

      const randomIndex = Math.floor(Math.random() * cards.length);
      return cards[randomIndex];
  } catch (error) {
      console.error('Error fetching random Pokemon card:', error);
      throw error;
  }
};