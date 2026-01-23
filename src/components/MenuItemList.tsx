import React, { useState } from 'react';
import { FaTrash, FaPlus, FaImage } from 'react-icons/fa';
import type { MenuItem } from '../types/menu';
import { useTranslation } from 'react-i18next';

interface MenuItemListProps {
    items: MenuItem[];
    categoryName: string;
    onDeleteItem: (id: string | number) => void;
    onCreateItem: (item: Partial<MenuItem>) => void;
}

const MenuItemList: React.FC<MenuItemListProps> = ({ items, categoryName, onDeleteItem, onCreateItem }) => {
    const { t } = useTranslation('restaurant');
    const [newItem, setNewItem] = useState({
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        ingredients: ''
    });

    const [ingredientInput, setIngredientInput] = useState('');
    const [ingredientList, setIngredientList] = useState<string[]>([]);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleAddIngredient = (e: React.FormEvent) => {
        e.preventDefault();
        if (ingredientInput.trim()) {
            setIngredientList([...ingredientList, ingredientInput.trim()]);
            setIngredientInput('');
        }
    };

    const removeIngredient = (index: number) => {
        setIngredientList(ingredientList.filter((_, i) => i !== index));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setNewItem({ ...newItem, imageUrl: base64String });
                setImagePreview(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const price = parseFloat(newItem.price);
        if (newItem.name && !isNaN(price) && price >= 0) {
            onCreateItem({
                ...newItem,
                price: price,
                ingredients: ingredientList.join(', ')
            });
            // Reset Form
            setNewItem({ name: '', description: '', price: '', imageUrl: '', ingredients: '' });
            setIngredientList([]);
            setImagePreview(null);
            setIngredientInput('');
        } else {
            alert(t('items.validation_error'));
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">{t('items.title', { category: categoryName })}</h2>

            <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 p-4 rounded border">
                <h3 className="font-semibold mb-3">{t('items.add_new')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                        type="text"
                        placeholder={t('items.name_placeholder')}
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        className="p-2 border rounded"
                        required
                    />
                    <input
                        type="number"
                        placeholder={t('items.price_placeholder')}
                        value={newItem.price}
                        onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                        className="p-2 border rounded"
                        step="0.01"
                        required
                    />
                    <input
                        type="text"
                        placeholder={t('items.desc_placeholder')}
                        value={newItem.description}
                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                        className="p-2 border rounded md:col-span-2"
                    />

                    {/* Ingredient Tag Input */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('items.ingredients')}</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder={t('items.ingredient_placeholder')}
                                value={ingredientInput}
                                onChange={(e) => setIngredientInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddIngredient(e);
                                    }
                                }}
                                className="p-2 border rounded flex-1"
                            />
                            <button
                                type="button"
                                onClick={handleAddIngredient}
                                className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
                            >
                                {t('common.add')}
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {ingredientList.map((ing, idx) => (
                                <span key={idx} className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full flex items-center gap-1">
                                    {ing}
                                    <button type="button" onClick={() => removeIngredient(idx)} className="text-blue-500 hover:text-red-500 font-bold">&times;</button>
                                </span>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{t('items.ingredients_hint')}</p>
                    </div>

                    {/* Image Upload */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('items.image')}</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {imagePreview && (
                                <img src={imagePreview} alt="Preview" className="h-12 w-12 object-cover rounded shadow" />
                            )}
                        </div>
                    </div>

                </div>
                <button
                    type="submit"
                    className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2 w-full justify-center font-bold"
                >
                    <FaPlus /> {t('items.create_btn')}
                </button>
            </form>

            <div className="grid grid-cols-1 gap-4">
                {items.map((item) => (
                    <div key={item.id} className="border rounded p-3 flex justify-between items-start hover:bg-gray-50">
                        <div className="flex gap-3">
                            {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded" />
                            ) : (
                                <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                                    <FaImage />
                                </div>
                            )}
                            <div>
                                <h3 className="font-bold">{item.name}</h3>
                                <p className="text-sm text-gray-600">{item.description}</p>
                                {item.ingredients && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {item.ingredients.split(',').map((ing, i) => (
                                            <span key={i} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">{ing.trim()}</span>
                                        ))}
                                    </div>
                                )}
                                <p className="text-blue-600 font-semibold mt-1">${item.price.toFixed(2)}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => onDeleteItem(item.id)}
                            className="text-red-500 hover:text-red-700 p-2"
                        >
                            <FaTrash />
                        </button>
                    </div>
                ))}
                {items.length === 0 && (
                    <p className="text-gray-500 text-center py-8">{t('items.no_items')}</p>
                )}
            </div>
        </div>
    );
};

export default MenuItemList;
