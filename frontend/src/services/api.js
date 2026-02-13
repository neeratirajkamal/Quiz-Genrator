import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

export const generateQuiz = (data) => api.post('/generate', data, {
    headers: {
        'Content-Type': 'multipart/form-data',
    },
});
export const getQuizzes = () => api.get('/quizzes');
export const getQuiz = (id) => api.get(`/quizzes/${id}`);

export default api;
