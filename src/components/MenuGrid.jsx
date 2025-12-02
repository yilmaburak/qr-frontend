import React from 'react';
import MenuCard from './MenuCard';

const MenuGrid = ({ items, loading }) => {
    if (loading) {
        return <div className="p-8 text-center">Loading menu items...</div>;
    }

    if (!items || items.length === 0) {
        return (
            <div className="p-8 text-center bg-white rounded-xl">
                <p className="text-gray-500">No menu items found.</p>
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
