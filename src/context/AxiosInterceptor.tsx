import React, { ReactNode, useContext, useEffect } from 'react'
import useAuth from '../hooks/useAuth';
import api from '../utils/axiosInstance';
import { AuthContext } from './AuthProvider';

const AxiosInterceptor = ({ children }: { children: ReactNode }) => {
    const authConext: any = useContext(AuthContext)

    useEffect(() => {
        const reqInterceptor = api.interceptors.request.use(
            (config) => {
                if (authConext?.auth?.accessToken) {
                    config.headers.Authorization = `Bearer ${authConext.auth?.accessToken}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        return () => {
            api.interceptors.request.eject(reqInterceptor);
        };
    }, [authConext?.auth]);

    return children;
}

export default AxiosInterceptor