import React, { useEffect, useState } from 'react';
import { FaUtensils, FaPlus, FaTrash, FaSave } from 'react-icons/fa';
import { toast } from 'react-toastify';
import menuService from '../services/menuService';
import inventoryService from '../services/inventoryService';
import recipeService from '../services/recipeService';
import { MenuItemDto } from '../types/menu'; // Ensure this type exists or use any
import { InventoryItem, Recipe } from '../types/restaurant';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { useTranslation } from 'react-i18next';

const RecipeBuilder: React.FC = () => {
    const { t } = useTranslation('restaurant');
    const [menuItems, setMenuItems] = useState<any[]>([]); // Using any for simplicity if types vary
    const [selectedMenuItem, setSelectedMenuItem] = useState<number | null>(null);
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [currentRecipe, setCurrentRecipe] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);

    // Form
    const [selectedIngredient, setSelectedIngredient] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(0);

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (selectedMenuItem) {
            loadRecipe(selectedMenuItem);
        } else {
            setCurrentRecipe([]);
        }
    }, [selectedMenuItem]);

    const loadInitialData = async () => {
        try {
            // Fetch categories first to get items? Or just get all items?
            // Real usage: fetch categories, then flattened items. 
            // For mock/simple UI: Let's assume we can fetch popular items or just first category items.
            // Simplified: Fetch categories, then fetch items for first category.
            const categories = await menuService.getCategories();
            if (categories.length > 0) {
                const items = await menuService.getMenuItems(categories[0].id);
                setMenuItems(items);
                if (items.length > 0) setSelectedMenuItem(items[0].id);
            }

            const inv = await inventoryService.getInventory();
            setInventoryItems(inv);
        } catch (error) {
            console.error(error);
            toast.error(t('recipe.load_fail', { defaultValue: 'Failed to load initial data' }));
        } finally {
            setLoading(false);
        }
    };

    const loadRecipe = async (menuItemId: number) => {
        const recipes = await recipeService.getRecipesByMenuItem(menuItemId);
        setCurrentRecipe(recipes);
    };

    const handleAddIngredient = async () => {
        if (!selectedMenuItem || !selectedIngredient || quantity <= 0) return;

        try {
            const invItemId = parseInt(selectedIngredient);
            await recipeService.addIngredientToRecipe({
                menuItemId: selectedMenuItem,
                inventoryItemId: invItemId,
                quantityRequired: quantity
            });
            toast.success(t('recipe.added'));
            loadRecipe(selectedMenuItem);
            setQuantity(0);
            setSelectedIngredient('');
        } catch (error) {
            toast.error(t('recipe.add_fail'));
        }
    };

    const handleRemoveIngredient = async (id: number) => {
        try {
            await recipeService.removeIngredientFromRecipe(id);
            if (selectedMenuItem) loadRecipe(selectedMenuItem);
        } catch (error) {
            toast.error(t('recipe.remove_fail'));
        }
    };

    if (loading) return <SkeletonLoader height={400} />;

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <FaUtensils className="text-orange-500" /> {t('recipe.title')}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Menu Item Selection */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
                    <h2 className="font-semibold mb-4 text-gray-700">{t('recipe.select_item')}</h2>
                    <select
                        className="w-full p-2 border border-gray-300 rounded-lg mb-4"
                        value={selectedMenuItem || ''}
                        onChange={(e) => setSelectedMenuItem(parseInt(e.target.value))}
                    >
                        {menuItems.map(item => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                    </select>

                    {selectedMenuItem && (
                        <div className="text-sm text-gray-500">
                            {t('recipe.editing_for')} <span className="font-bold text-gray-800">{menuItems.find(i => i.id === selectedMenuItem)?.name}</span>
                        </div>
                    )}
                </div>

                {/* Recipe Editor */}
                <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="font-semibold mb-4 text-gray-700">{t('recipe.ingredients')}</h2>

                    <div className="flex gap-4 mb-6 items-end bg-gray-50 p-4 rounded-lg">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-500 mb-1">{t('recipe.ingredient')}</label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                value={selectedIngredient}
                                onChange={(e) => setSelectedIngredient(e.target.value)}
                            >
                                <option value="">{t('recipe.select_ingredient')}</option>
                                {inventoryItems.map(inv => (
                                    <option key={inv.id} value={inv.id}>{inv.name} ({inv.unit})</option>
                                ))}
                            </select>
                        </div>
                        <div className="w-32">
                            <label className="block text-xs font-bold text-gray-500 mb-1">{t('recipe.quantity')}</label>
                            <input
                                type="number"
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                placeholder="0.00"
                                value={quantity}
                                onChange={(e) => setQuantity(parseFloat(e.target.value))}
                            />
                        </div>
                        <button
                            onClick={handleAddIngredient}
                            disabled={!selectedIngredient || quantity <= 0}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            <FaPlus />
                        </button>
                    </div>

                    <div className="space-y-2">
                        {currentRecipe.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">{t('recipe.no_ingredients')}</p>
                        ) : (
                            currentRecipe.map(recipe => {
                                const invItem = inventoryItems.find(i => i.id === recipe.inventoryItemId);
                                return (
                                    <div key={recipe.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                                        <div>
                                            <span className="font-medium text-gray-800">{invItem?.name || t('recipe.unknown_item')}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-bold text-gray-600">{recipe.quantityRequired} {invItem?.unit}</span>
                                            <button
                                                onClick={() => handleRemoveIngredient(recipe.id)}
                                                className="text-red-500 hover:text-red-700 p-2"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecipeBuilder;
