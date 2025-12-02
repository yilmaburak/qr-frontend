import React from 'react';
import { FaStar } from 'react-icons/fa';

const MenuFilter = ({ filters, onFilterChange }) => {
    const categories = ['All', 'Chicken', 'Beef', 'Noodles', 'Rice', 'Seafood', 'Pizza', 'Pasta', 'Burgers', 'Salad', 'Desserts', 'Beverages', 'Others'];
    const mealTimes = ['All', 'Breakfast', 'Lunch', 'Snack', 'Dinner'];
    const priceRanges = [
        { label: '$5 - $10', min: 5, max: 10 },
        { label: '$10 - $20', min: 10, max: 20 },
        { label: '$20 - $30', min: 20, max: 30 },
        { label: 'Above $30', min: 30, max: null }
    ];

    const handleCheckboxChange = (type, value) => {
        // Simple implementation for now, can be expanded for multi-select
        onFilterChange({ ...filters, [type]: value });
    };

    return (
        <div className="w-64 bg-white p-6 rounded-xl shadow-sm h-fit">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">Filter</h3>
                <button className="text-gray-400">...</button>
            </div>

            {/* Categories */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold">Category</h4>
                    <span className="text-gray-400 text-sm">^</span>
                </div>
                <div className="space-y-2">
                    {categories.slice(0, 8).map(cat => (
                        <label key={cat} className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                                checked={filters.category === cat}
                                onChange={() => handleCheckboxChange('category', cat === 'All' ? null : cat)}
                            />
                            <span className="text-gray-600 text-sm">{cat}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Meal Times */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold">Meal Times</h4>
                    <span className="text-gray-400 text-sm">^</span>
                </div>
                <div className="space-y-2">
                    {mealTimes.map(time => (
                        <label key={time} className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                                checked={filters.mealTime === time}
                                onChange={() => handleCheckboxChange('mealTime', time === 'All' ? null : time)}
                            />
                            <span className="text-gray-600 text-sm">{time}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold">Price Range</h4>
                    <span className="text-gray-400 text-sm">^</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {priceRanges.map(range => (
                        <button
                            key={range.label}
                            className={`text-xs py-2 px-3 rounded border ${filters.minPrice === range.min
                                    ? 'bg-orange-500 text-white border-orange-500'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                }`}
                            onClick={() => onFilterChange({ ...filters, minPrice: range.min, maxPrice: range.max })}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Rating */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold">Rating</h4>
                    <span className="text-gray-400 text-sm">^</span>
                </div>
                <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map(star => (
                        <label key={star} className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                                checked={filters.minRating === star}
                                onChange={() => handleCheckboxChange('minRating', star)}
                            />
                            <div className="flex text-yellow-400 text-sm">
                                {[...Array(5)].map((_, i) => (
                                    <FaStar key={i} className={i < star ? "text-yellow-400" : "text-gray-300"} />
                                ))}
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            <button
                className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600"
                onClick={() => onFilterChange({ category: null, mealTime: null, minPrice: null, maxPrice: null, minRating: null })}
            >
                Reset Filters
            </button>
        </div>
    );
};

export default MenuFilter;
