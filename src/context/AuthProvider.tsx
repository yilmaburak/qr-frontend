import React, { createContext, ReactNode, useEffect, useState } from 'react'
import { AuthContextType } from '../Models/Auth';
import { parseJwt } from '../utils/helpers';
import api from '../utils/axiosInstance';

export const AuthContext = createContext({});

const AuthProvider: any = ({ children }: { children: ReactNode }) => {
    const [auth, setAuth] = useState<AuthContextType>({
        user: null,
        accessToken: null,
        roles: [],
        isLoading: true
    } as AuthContextType);

    const tryRefresh = async () => {
        try {
            const res: any = await api.post("http://localhost:8080/api/auth/refresh", {}, { withCredentials: true });
            setAuth({
                user: res.data.user || parseJwt(res.data.token).sub,
                accessToken: res.data.token,
                roles: res.data.roles || [5150],
                isLoading: false
            });
        } catch (err) {
            console.log('err: ', err);
            setAuth({ isLoading: false } as AuthContextType);
        }
    };

    useEffect(() => {
        tryRefresh();
    }, []);

    return (
        <AuthContext.Provider value={{ auth, setAuth }}>
            {!auth.isLoading ? (children) : (<div className='flex items-center justify-center h-screen'>Loading...</div>)}
        </AuthContext.Provider>
    )
}

export default AuthProvider