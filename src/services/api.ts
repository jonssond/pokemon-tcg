import axios from 'axios';

const api = axios.create({
    baseURL: 'https://api.pokemontcg.io/v2',
    headers: {
        'X-Api-Key': import.meta.env.VITE_API_KEY
    },
});

export default api;