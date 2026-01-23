import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export type ModuleType = 'QR_GENERATOR' | 'RESTAURANT' | 'ACCESS_CONTROL';

interface ModuleAccess {
    module: ModuleType;
    active: boolean;
    expiresAt: string | null;
}

interface ModuleContextType {
    currentModule: ModuleType | 'DASHBOARD' | null;
    availableModules: ModuleAccess[];
    isLoading: boolean;
    switchModule: (module: ModuleType | 'DASHBOARD') => void;
    hasAccess: (module: ModuleType) => boolean;
}

const ModuleContext = createContext<ModuleContextType | undefined>(undefined);

export const ModuleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentModule, setCurrentModule] = useState<ModuleType | 'DASHBOARD' | null>(null);
    const [availableModules, setAvailableModules] = useState<ModuleAccess[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    // Mock data for development
    const MOCK_MODULES: ModuleAccess[] = [
        { module: 'QR_GENERATOR', active: true, expiresAt: null },
        { module: 'RESTAURANT', active: true, expiresAt: null }, // Enable for testing
        { module: 'ACCESS_CONTROL', active: false, expiresAt: null },
    ];

    useEffect(() => {
        const fetchModules = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setIsLoading(false);
                    return;
                }

                const response = await fetch('http://localhost:8080/api/modules/available', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setAvailableModules(data.modules || []);
                } else {
                    console.error('Failed to fetch modules');
                    // If failed, maybe fallback or empty
                    setAvailableModules([]);
                }
            } catch (error) {
                console.error('Error fetching modules:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchModules();
    }, []);

    // Determine current module based on URL
    useEffect(() => {
        const path = location.pathname;
        if (path.startsWith('/qr')) {
            setCurrentModule('QR_GENERATOR');
        } else if (path.startsWith('/restaurant')) {
            setCurrentModule('RESTAURANT');
        } else if (path.startsWith('/access')) {
            setCurrentModule('ACCESS_CONTROL');
        } else if (path === '/modules') {
            setCurrentModule('DASHBOARD');
        }
    }, [location.pathname]);

    const switchModule = (module: ModuleType | 'DASHBOARD') => {
        if (module === 'DASHBOARD') {
            navigate('/modules');
            return;
        }

        if (!hasAccess(module)) {
            alert(`You do not have access to the ${module} module.`);
            return;
        }

        switch (module) {
            case 'QR_GENERATOR':
                navigate('/qr/dashboard');
                break;
            case 'RESTAURANT':
                navigate('/restaurant/orders'); // Default restaurant page
                break;
            case 'ACCESS_CONTROL':
                navigate('/access/dashboard');
                break;
        }
    };

    const hasAccess = (module: ModuleType) => {
        return availableModules.some(m => m.module === module && m.active);
    };

    return (
        <ModuleContext.Provider value={{ currentModule, availableModules, isLoading, switchModule, hasAccess }}>
            {children}
        </ModuleContext.Provider>
    );
};

export const useModule = () => {
    const context = useContext(ModuleContext);
    if (context === undefined) {
        throw new Error('useModule must be used within a ModuleProvider');
    }
    return context;
};
