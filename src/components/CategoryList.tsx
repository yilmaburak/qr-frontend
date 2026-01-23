import React, { useState } from 'react';
import { FaTrash, FaPlus, FaTimes } from 'react-icons/fa';
import type { Category } from '../types/menu';
import { useTranslation } from 'react-i18next';

interface CategoryListProps {
    categories: Category[];
    onSelectCategory: (category: Category) => void;
    onDeleteCategory: (id: string | number) => void;
    onCreateCategory: (name: string) => void;
    selectedCategoryId: string | number | null;
    mode?: 'list' | 'tabs';
}

const CategoryList: React.FC<CategoryListProps> = ({
    categories,
    onSelectCategory,
    onDeleteCategory,
    onCreateCategory,
    selectedCategoryId,
    mode = 'list'
}) => {
    const { t } = useTranslation('restaurant');
    const [newCategoryName, setNewCategoryName] = useState<string>('');
    const [isCreating, setIsCreating] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCategoryName.trim()) {
            onCreateCategory(newCategoryName);
            setNewCategoryName('');
            setIsCreating(false);
        }
    };

    if (mode === 'tabs') {
        return (
            <div className="bg-white p-2 border-b flex items-center gap-2 overflow-x-auto no-scrollbar">
                {categories.map((category) => (
                    <div
                        key={category.id}
                        className={`
                            whitespace-nowrap px-4 py-2 rounded-full border cursor-pointer flex items-center gap-2 transition-colors
                            ${selectedCategoryId === category.id
                                ? 'bg-orange-600 text-white border-orange-600'
                                : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'}
                        `}
                        onClick={() => onSelectCategory(category)}
                    >
                        <span className="font-medium text-sm">{category.name}</span>
                        {selectedCategoryId === category.id && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteCategory(category.id);
                                }}
                                className="text-white hover:text-red-200 ml-1"
                                title={t('categories.delete')}
                            >
                                <FaTimes size={12} />
                            </button>
                        )}
                    </div>
                ))}

                {isCreating ? (
                    <form onSubmit={handleSubmit} className="flex gap-1 items-center animate-fadeIn ml-2">
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder={t('categories.name_placeholder')}
                            className="p-1 px-2 border rounded-full text-sm w-32 focus:outline-none focus:border-blue-500"
                            autoFocus
                            onBlur={() => !newCategoryName && setIsCreating(false)}
                        />
                        <button type="submit" className="bg-green-500 text-white p-1 rounded-full hover:bg-green-600">
                            <FaPlus size={12} />
                        </button>
                    </form>
                ) : (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full hover:bg-gray-200 flex items-center gap-1 border border-dashed border-gray-300 ml-2"
                    >
                        <FaPlus size={12} />
                        <span className="text-sm">{t('categories.add')}</span>
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow h-full">
            <h2 className="text-xl font-bold mb-4">{t('categories.title')}</h2>

            <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
                <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder={t('categories.new_placeholder')}
                    className="flex-1 p-2 border rounded"
                />
                <button
                    type="submit"
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                    <FaPlus />
                </button>
            </form>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
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
                    <p className="text-gray-500 text-center py-4">{t('categories.no_categories')}</p>
                )}
            </div>
        </div>
    );
};

export default CategoryList;
