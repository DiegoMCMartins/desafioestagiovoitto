import axios from 'axios';

const cepApi = axios.create({
    baseURL: 'https://viacep.com.br/ws/'
});

cepApi.interceptors.request.use((config) => {
    const newConfig = {...config, url: `${config.url}/json`};
    return newConfig;
}, (error) => {
    return Promise.reject(error);
});

export default cepApi;