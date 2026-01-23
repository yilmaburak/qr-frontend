import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from '../services/api';

interface Branch {
    id: number;
    name: string;
}

interface BranchContextType {
    branches: Branch[];
    activeBranch: Branch | null;
    setActiveBranch: (branch: Branch) => void;
    isLoading: boolean;
    refreshBranches: () => Promise<void>;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export const BranchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [activeBranch, setActiveBranch] = useState<Branch | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshBranches = async () => {
        try {
            // Only fetch if user is logged in (handled by interceptors usually, but good to be safe)
            // We'll rely on the API call failing gracefully if not auth'd or catching
            const res = await axios.get('/restaurant/branches');
            setBranches(res.data);

            // Restore active branch from localStorage or default to first
            const savedBranchId = localStorage.getItem('activeBranchId');
            if (savedBranchId) {
                const found = res.data.find((b: Branch) => b.id.toString() === savedBranchId);
                if (found) {
                    setActiveBranch(found);
                } else if (res.data.length > 0) {
                    setActiveBranch(res.data[0]);
                }
            } else if (res.data.length > 0) {
                setActiveBranch(res.data[0]);
            }
        } catch (error) {
            console.error('Failed to fetch branches', error);
            // setBranches([]); // Optional: clear branches on error or keep previous
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshBranches();
    }, []);

    const handleSetActiveBranch = (branch: Branch) => {
        setActiveBranch(branch);
        localStorage.setItem('activeBranchId', branch.id.toString());
    };

    return (
        <BranchContext.Provider value={{
            branches,
            activeBranch,
            setActiveBranch: handleSetActiveBranch,
            isLoading,
            refreshBranches
        }}>
            {children}
        </BranchContext.Provider>
    );
};

export const useBranch = () => {
    const context = useContext(BranchContext);
    if (!context) {
        throw new Error('useBranch must be used within a BranchProvider');
    }
    return context;
};
