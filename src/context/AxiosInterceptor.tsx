import React, { ReactNode, useContext, useEffect } from 'react'
import useAuth from '../hooks/useAuth';
import api from '../utils/axiosInstance';
import { AuthContext } from './AuthProvider';

const AxiosInterceptor = ({ children }: { children: ReactNode }) => {
    const { auth }: any = useContext(AuthContext);
    const [isLoading, setIsLoading] = React.useState(true);

    useEffect(() => {
        if (auth.isLoading) return;
        const reqInterceptor = api.interceptors.request.use(
            (config) => {
                const token = auth?.accessToken;
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );
        setIsLoading(false);
        return () => {
            console.log('Ejecting Axios interceptor');
            api.interceptors.request.eject(reqInterceptor);
        };
    }, [auth.isLoading, auth?.accessToken]);

    if (auth.isLoading || isLoading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return children;
};



export default AxiosInterceptor