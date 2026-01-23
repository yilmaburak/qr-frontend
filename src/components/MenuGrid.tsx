import React from 'react';
import MenuCard from './MenuCard';
import type { MenuItem } from '../types/menu';
import { useTranslation } from 'react-i18next';

interface MenuGridProps {
    items: MenuItem[] | null;
    loading: boolean;
}

const MenuGrid: React.FC<MenuGridProps> = ({ items, loading }) => {
    const { t } = useTranslation('restaurant');
    if (loading) {
        return <div className="p-8 text-center">{t('menu.loading')}</div>;
    }

    if (!items || items.length === 0) {
        return (
            <div className="p-8 text-center bg-white rounded-xl">
                <p className="text-gray-500">{t('menu.no_items')}</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => (
                <MenuCard key={item.id} item={item} />
            ))}
        </div>
    );
};

export default MenuGrid;
