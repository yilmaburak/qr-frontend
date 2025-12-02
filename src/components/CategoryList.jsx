import React, { useState } from 'react';
import { FaTrash, FaPlus } from 'react-icons/fa';

const CategoryList = ({ categories, onSelectCategory, onDeleteCategory, onCreateCategory, selectedCategoryId }) => {
    const [newCategoryName, setNewCategoryName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newCategoryName.trim()) {
            onCreateCategory(newCategoryName);
            setNewCategoryName('');
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Categories</h2>

            <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
                <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="New Category Name"
                    className="flex-1 p-2 border rounded"
                />
                <button
                    type="submit"
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                    <FaPlus />
                </button>
            </form>

            <div className="space-y-2">
                {categories.map((category) => (
                    <div
                        key={category.id}
                        className={`flex justify-between items-center p-3 rounded cursor-pointer ${selectedCategoryId === category.id ? 'bg-blue-50 border-blue-200 border' : 'bg-gray-50 hover:bg-gray-100'
                            }`}
                        onClick={() => onSelectCategory(category)}
                    >
                        <span className="font-medium">{category.name}</span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteCategory(category.id);
                            }}
                            className="text-red-500 hover:text-red-700 p-1"
                        >
                            <FaTrash />
                        </button>
                    </div>
                ))}
                {categories.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No categories yet.</p>
                )}
            </div>
        </div>
    );
};

export default CategoryList;
