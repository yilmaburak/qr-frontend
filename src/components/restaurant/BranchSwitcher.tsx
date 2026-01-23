import React from 'react';
import { useBranch } from '../../contexts/BranchContext';
import { Store, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const BranchSwitcher: React.FC = () => {
    const { t } = useTranslation('restaurant');
    const { branches, activeBranch, setActiveBranch, isLoading } = useBranch();
    const navigate = useNavigate();

    if (isLoading) return <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />;

    if (branches.length === 0) {
        return (
            <button
                onClick={() => navigate('/restaurant/branches')}
                className="flex items-center gap-2 text-sm text-orange-600 font-medium hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200"
            >
                <Store size={16} />
                Create Branch
            </button>
        );
    }

    return (
        <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Store size={16} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                    {activeBranch ? activeBranch.name : 'Select Branch'}
                </span>
                <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
            </button>

            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 hidden group-hover:block z-50">
                {branches.map(branch => (
                    <button
                        key={branch.id}
                        onClick={() => setActiveBranch(branch)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${activeBranch?.id === branch.id ? 'text-orange-600 font-medium bg-orange-50/50' : 'text-gray-700'
                            }`}
                    >
                        {branch.name}
                        {activeBranch?.id === branch.id && <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                    </button>
                ))}
                <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                        onClick={() => navigate('/restaurant/branches')}
                        className="w-full text-left px-4 py-2 text-xs text-gray-500 hover:text-orange-600 hover:bg-gray-50"
                    >
                        + Manage Branches
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BranchSwitcher;
