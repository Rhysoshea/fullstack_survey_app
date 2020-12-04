import axios from 'axios';


export const validateFields = (fieldsToValidate) => {
    return fieldsToValidate.every((field) => Object.values(field)[0] !== '');
};

export const setAuthHeader = () => {
    const token = localStorage.getItem('user_token');
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
};

export const removeAuthHeader = () => {
    delete axios.defaults.headers.common['Authorization'];
};