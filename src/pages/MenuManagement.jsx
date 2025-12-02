import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CategoryList from '../components/CategoryList';
import MenuItemList from '../components/MenuItemList';
import menuService from '../services/menuService';
import { getCurrentUser } from '../services/auth';

const MenuManagement = () => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const user = getCurrentUser();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        loadCategories();
    }, [user, navigate]);

    useEffect(() => {
        if (selectedCategory) {
            loadMenuItems(selectedCategory.id);
        } else {
            setMenuItems([]);
        }
    }, [selectedCategory]);

    const loadCategories = async () => {
        try {
            const data = await menuService.getCategories(user.id);
            setCategories(data);
            if (data.length > 0 && !selectedCategory) {
                setSelectedCategory(data[0]);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load categories');
        }
    };

    const loadMenuItems = async (categoryId) => {
        setLoading(true);
        try {
            const data = await menuService.getMenuItems(categoryId);
            setMenuItems(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load menu items');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCategory = async (name) => {
        try {
            const newCategory = await menuService.createCategory({ name, userId: user.id });
            setCategories([...categories, newCategory]);
            toast.success('Category created');
            if (!selectedCategory) setSelectedCategory(newCategory);
        } catch (error) {
            console.error(error);
            toast.error('Failed to create category');
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Are you sure? All items in this category will be deleted.')) return;
        try {
            await menuService.deleteCategory(id);
            setCategories(categories.filter(c => c.id !== id));
            if (selectedCategory && selectedCategory.id === id) {
                setSelectedCategory(null);
                setMenuItems([]);
            }
            toast.success('Category deleted');
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete category');
        }
    };

    const handleCreateItem = async (itemData) => {
        if (!selectedCategory) {
            console.error("No category selected");
            return;
        }
        console.log("Creating item with data:", itemData);
        console.log("Selected Category:", selectedCategory);

        try {
            const payload = {
                ...itemData,
                categoryId: selectedCategory.id
            };
            console.log("Payload:", payload);

            const newItem = await menuService.createMenuItem(payload);
            setMenuItems([...menuItems, newItem]);
            toast.success('Item created');
        } catch (error) {
            console.error(error);
            toast.error('Failed to create item');
        }
    };

    const handleDeleteItem = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await menuService.deleteMenuItem(id);
            setMenuItems(menuItems.filter(i => i.id !== id));
            toast.success('Item deleted');
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete item');
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Menu Management</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <CategoryList
                        categories={categories}
                        selectedCategoryId={selectedCategory?.id}
                        onSelectCategory={setSelectedCategory}
                        onCreateCategory={handleCreateCategory}
                        onDeleteCategory={handleDeleteCategory}
                    />
                </div>

                <div className="md:col-span-2">
                    {selectedCategory ? (
                        <MenuItemList
                            items={menuItems}
                            categoryName={selectedCategory.name}
                            onCreateItem={handleCreateItem}
                            onDeleteItem={handleDeleteItem}
                        />
                    ) : (
                        <div className="bg-white p-8 rounded shadow text-center text-gray-500">
                            Select or create a category to manage items.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MenuManagement;
