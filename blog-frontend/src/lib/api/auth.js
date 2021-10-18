import client from './client';

//login
export const login = ({ username, password }) =>
    client.post('/api/auth/login', { username, password });

//logout
export const logout = () => client.post('/api/auth/logout');

//sign up
export const register = ({ username, password }) =>
    client.post('/api/auth/register', { username, password });

//check login status
export const check = () => client.get('/api/auth/check');