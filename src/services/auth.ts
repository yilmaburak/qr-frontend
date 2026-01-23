import api from './api';

export interface User {
    id?: string | number;
    username: string;
    email: string;
    role: string | string[];
    firstName?: string;
    lastName?: string;
}



export async function login(credentials: any): Promise<any> {
    try {
        const response = await api.post('/auth/login', credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    } catch (error) {
        console.error('Login failed', error);
        throw error;
    }
}


export async function register(userData: {
    username: string;
    email: string;
    password: string;
    captchaToken: string;
    countryId: number | string;
}): Promise<any> {
    try {
        const response = await api.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        console.error('Register failed', error);
        throw error;
    }
}


export async function getCountries(): Promise<any[]> {
    const response = await api.get('/countries');
    return response.data;
}

export async function getUsageStats(): Promise<any> {
    try {
        const response = await api.get('/users/usage');
        return response.data;
    } catch (error) {
        console.warn('Failed to fetch usage stats, using mock');
        return {
            dynamicQrCreated: 0,
            staticQrCreated: 0,
            dynamicQrLimit: 0,
            tier: 'FREE'
        };
    }
}

export async function forgotPassword(email: string): Promise<any> {
    try {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || error.response?.data || 'İstek başarısız');
    }
}

export async function resetPassword(token: string, newPassword: string): Promise<any> {
    try {
        const response = await api.post('/auth/reset-password', { token, newPassword });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || error.response?.data || 'İstek başarısız');
    }
}

export async function googleLogin(token: string): Promise<any> {
    try {
        const response = await api.post('/auth/google-login', { token });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Google login failed');
    }
}

export function getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch (e) {
        return null;
    }
}

export function logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}
