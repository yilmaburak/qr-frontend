import api from './api';
import { Recipe } from '../types/restaurant';

const recipeService = {
    getRecipesByMenuItem: async (menuItemId: number): Promise<Recipe[]> => {
        const response = await api.get(`/menu-items/${menuItemId}/recipes`);
        return response.data;
    },

    addIngredientToRecipe: async (recipe: { menuItemId: number; inventoryItemId: number; quantityRequired: number }): Promise<Recipe> => {
        const response = await api.post('/recipes', recipe);
        return response.data;
    },

    removeIngredientFromRecipe: async (recipeId: number): Promise<void> => {
        await api.delete(`/recipes/${recipeId}`);
    }
};

export default recipeService;
