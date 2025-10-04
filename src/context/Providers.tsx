import React, { ReactNode } from 'react'
import AuthProvider from './AuthProvider'
import ThemeProvider from './ThemeProvider'
import AxiosInterceptor from './AxiosInterceptor'
import { BrowserRouter } from 'react-router-dom'

const Providers = ({ children }: { children: ReactNode }) => {
    return (
        <>
            <AuthProvider>
                <AxiosInterceptor>
                    <ThemeProvider>
                        <BrowserRouter
                            future={{
                                v7_startTransition: true,
                                v7_relativeSplatPath: true
                            }}
                        >
                            {children}
                        </BrowserRouter>
                    </ThemeProvider>
                </AxiosInterceptor>
            </AuthProvider>
        </>
    )
}

export default Providers