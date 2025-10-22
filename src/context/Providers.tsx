import React, { ReactNode } from 'react'
import AuthProvider from './AuthProvider'
import ThemeProvider from './ThemeProvider'
import AxiosInterceptor from './AxiosInterceptor'
import { BrowserRouter } from 'react-router-dom'
import ReduxProvider from './ReduxProvider'

const Providers = ({ children }: { children: ReactNode }) => {
    return (
        <>
            <ReduxProvider>
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
            </ReduxProvider>
        </>
    )
}

export default Providers