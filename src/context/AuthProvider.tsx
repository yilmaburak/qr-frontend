import React, { createContext, ReactNode, useCallback, useEffect, useState } from 'react'
import { AuthContextType } from '../Models/Auth';
import api from '../utils/axiosInstance';
import { parseJwt } from '../utils/helpers';

export const AuthContext = createContext({});

const AuthProvider: any = ({ children }: { children: ReactNode }) => {
    const [auth, setAuth] = useState<AuthContextType>({} as AuthContextType);
    const [loading, setLoading] = useState(true);

    const tryRefresh = useCallback(async () => {
        try {
            const res: any = await api.post("/auth/refresh", {}, { withCredentials: true });
            setAuth({
                user: res.data.user || parseJwt(res.data.token).sub,
                accessToken: res.data.token,
                roles: res.data.roles || [5150]
            });
        } catch (err) {
            setAuth({} as AuthContextType);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        tryRefresh();
    }, []);

    return (
        <AuthContext.Provider value={{ auth, setAuth }}>
            {!loading ? (children) : (<div className='flex items-center justify-center h-screen'>Loading...</div>)}
        </AuthContext.Provider>
    )
}

export default AuthProvider