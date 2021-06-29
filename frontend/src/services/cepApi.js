import axios from 'axios';

const cepApi = axios.create({
    baseURL: 'https://viacep.com.br/ws/'
});

cepApi.interceptors.request.use((config) => {
    console.log(config);
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default cepApi;