import { InventoryItem } from '../types/restaurant';

// Mock Data
let mockInventory: InventoryItem[] = [
    { id: 1, restaurantId: 1, name: 'Tomatoes', quantity: 50, unit: 'KG', reorderLevel: 10, costPerUnit: 2.5, updatedAt: new Date().toISOString() },
    { id: 2, restaurantId: 1, name: 'Burger Buns', quantity: 100, unit: 'PCS', reorderLevel: 20, costPerUnit: 0.5, updatedAt: new Date().toISOString() },
    { id: 3, restaurantId: 1, name: 'Cheddar Cheese', quantity: 5, unit: 'KG', reorderLevel: 2, costPerUnit: 15.0, updatedAt: new Date().toISOString() },
    { id: 4, restaurantId: 1, name: 'Beef Patties', quantity: 0, unit: 'PCS', reorderLevel: 50, costPerUnit: 3.0, updatedAt: new Date().toISOString() } // Low stock
];

const inventoryService = {
    getInventory: async (): Promise<InventoryItem[]> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return [...mockInventory];
    },

    createInventoryItem: async (item: Partial<InventoryItem>): Promise<InventoryItem> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const newItem: InventoryItem = {
            id: Math.floor(Math.random() * 10000),
            restaurantId: 1,
            name: item.name || 'New Item',
            quantity: item.quantity || 0,
            unit: item.unit || 'PCS',
            reorderLevel: item.reorderLevel || 5,
            costPerUnit: item.costPerUnit || 0,
            updatedAt: new Date().toISOString(),
            ...item
        };
        mockInventory.push(newItem);
        return newItem;
    },

    updateInventoryItem: async (id: number, item: Partial<InventoryItem>): Promise<InventoryItem> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const index = mockInventory.findIndex(i => i.id === id);
        if (index !== -1) {
            mockInventory[index] = { ...mockInventory[index], ...item, updatedAt: new Date().toISOString() };
            return mockInventory[index];
        }
        throw new Error('Item not found');
    },

    deleteInventoryItem: async (id: number): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        mockInventory = mockInventory.filter(i => i.id !== id);
    }
};

export default inventoryService;
