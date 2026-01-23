import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CategoryList from '../../components/CategoryList';
import MenuItemList from '../../components/MenuItemList';
import MenuSelector from '../../components/MenuSelector';
import MenuQRModal from '../../components/restaurant/MenuQRModal';
import menuService from '../../services/menuService';
import { getCurrentUser } from '../../services/auth';
import type { Category, MenuItem, Menu } from '../../types/menu';
import { useTranslation } from 'react-i18next';

const MenuManagement: React.FC = () => {
    const { t } = useTranslation('restaurant');
    const [menus, setMenus] = useState<Menu[]>([]);
    const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [qrMenu, setQrMenu] = useState<{ id: number; uid: string; name: string } | null>(null);

    const navigate = useNavigate();
    const user = getCurrentUser();

    // Admin Override
    const queryParams = new URLSearchParams(window.location.search);
    const overrideUserId = queryParams.get('userId');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        loadMenus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, navigate]);

    // When Menu changes, load its Categories
    useEffect(() => {
        if (selectedMenu) {
            loadCategories(selectedMenu.id);
        } else {
            setCategories([]);
            setSelectedCategory(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedMenu?.id]);

    // When Category changes, load its Items
    useEffect(() => {
        if (selectedCategory) {
            loadMenuItems(selectedCategory.id);
        } else {
            setMenuItems([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategory?.id]);

    const loadMenus = async () => {
        if (!user) return;
        try {
            const targetId = overrideUserId ? parseInt(overrideUserId) : user.id;
            const data = await menuService.getMenus(targetId);
            setMenus(data);
            if (data.length > 0 && !selectedMenu) {
                // Determine active menu or default to first
                const active = data.find(m => m.active) || data[0];
                setSelectedMenu(active);
            }
        } catch (error) {
            console.error(error);
            toast.error(t('menu_management.load_menu_fail'));
        }
    };

    const loadCategories = async (menuId: number) => {
        try {
            // Updated service call to support menuId
            const data = await menuService.getCategories(undefined, menuId);
            setCategories(data);
            if (data.length > 0) {
                setSelectedCategory(data[0]);
            } else {
                setSelectedCategory(null);
            }
        } catch (error) {
            console.error(error);
            toast.error(t('menu_management.load_category_fail'));
        }
    };

    const loadMenuItems = async (categoryId: number) => {
        setLoading(true);
        try {
            const data = await menuService.getMenuItems(categoryId);
            setMenuItems(data);
        } catch (error) {
            console.error(error);
            toast.error(t('menu_management.load_item_fail'));
        } finally {
            setLoading(false);
        }
    };

    // --- Menu Actions ---

    const handleCreateMenu = async (name: string) => {
        if (!user) return;
        try {
            const newMenu = await menuService.createMenu({ name, userId: user.id, active: menus.length === 0 });
            setMenus([...menus, newMenu]);
            setSelectedMenu(newMenu);
            toast.success(t('messages.menu_created'));
        } catch (error) {
            console.error(error);
            toast.error(t('menu_management.create_menu_fail'));
        }
    };

    const handleDeleteMenu = async (id: number) => {
        if (!window.confirm(t('branch.delete_confirm'))) return;
        try {
            await menuService.deleteMenu(id); // Ensure this is added to service
            const updated = menus.filter(m => m.id !== id);
            setMenus(updated);
            if (selectedMenu?.id === id) {
                setSelectedMenu(updated.length > 0 ? updated[0] : null);
            }
            toast.success(t('messages.menu_deleted'));
        } catch (error) {
            console.error(error);
            toast.error(t('menu_management.delete_menu_fail'));
        }
    };

    // --- Category Actions ---

    const handleCreateCategory = async (name: string) => {
        if (!user || !selectedMenu) return;
        try {
            const newCategory = await menuService.createCategory({
                name,
                userId: user.id,
                menuId: selectedMenu.id // Helper to link to menu
            });
            setCategories([...categories, newCategory]);
            toast.success(t('messages.category_created'));
            setSelectedCategory(newCategory);
        } catch (error) {
            console.error(error);
            toast.error(t('menu_management.create_category_fail'));
        }
    };

    const handleDeleteCategory = async (id: number) => {
        if (!window.confirm(t('branch.delete_confirm'))) return;
        try {
            await menuService.deleteCategory(id);
            const remaining = categories.filter(c => c.id !== id);
            setCategories(remaining);
            if (selectedCategory && selectedCategory.id === id) {
                setSelectedCategory(remaining.length > 0 ? remaining[0] : null);
            }
            toast.success(t('messages.category_deleted'));
        } catch (error) {
            console.error(error);
            toast.error(t('menu_management.delete_category_fail'));
        }
    };

    // --- Item Actions ---

    const handleCreateItem = async (itemData: Omit<MenuItem, 'id'>) => {
        if (!selectedCategory) return;
        try {
            const payload = { ...itemData, categoryId: selectedCategory.id };
            const newItem = await menuService.createMenuItem(payload);
            setMenuItems([...menuItems, newItem]);
            toast.success(t('messages.item_created'));
        } catch (error) {
            console.error(error);
            toast.error(t('menu_management.create_item_fail'));
        }
    };

    const handleDeleteItem = async (id: number) => {
        if (!window.confirm(t('branch.delete_confirm'))) return;
        try {
            await menuService.deleteMenuItem(id);
            setMenuItems(menuItems.filter(i => i.id !== id));
            toast.success(t('messages.item_deleted'));
        } catch (error) {
            console.error(error);
            toast.error(t('menu_management.delete_item_fail'));
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">{t('menu_management.title')}</h1>

            <MenuSelector
                menus={menus}
                selectedMenuId={selectedMenu?.id || null}
                onSelectMenu={setSelectedMenu}
                onCreateMenu={handleCreateMenu}

                onDeleteMenu={handleDeleteMenu}
                onGenerateQR={(m) => {
                    setQrMenu({ id: typeof m.id === 'string' ? parseInt(m.id) : m.id, uid: m.uid, name: m.name });
                    setShowQRModal(true);
                }}
            />

            {qrMenu && (
                <MenuQRModal
                    isOpen={showQRModal}
                    onClose={() => setShowQRModal(false)}
                    menuId={qrMenu.id}
                    menuUid={qrMenu.uid}
                    menuName={qrMenu.name}
                />
            )}

            {selectedMenu ? (
                <>
                    <div className="mb-6">
                        <CategoryList
                            categories={categories}
                            selectedCategoryId={selectedCategory?.id || null}
                            onSelectCategory={setSelectedCategory}
                            onCreateCategory={handleCreateCategory}
                            onDeleteCategory={handleDeleteCategory}
                            mode="tabs" // Use new horizontal mode
                        />
                    </div>

                    <div className="bg-white p-6 rounded shadow min-h-[400px]">
                        {selectedCategory ? (
                            <MenuItemList
                                items={menuItems}
                                categoryName={selectedCategory.name}
                                onCreateItem={handleCreateItem}
                                onDeleteItem={handleDeleteItem}
                            />
                        ) : (
                            <div className="text-center text-gray-500 py-20">
                                {categories.length === 0
                                    ? t('menu_management.start_instruction')
                                    : t('menu_management.select_instruction')}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="bg-white p-12 rounded shadow text-center text-gray-500">
                    <div>{t('menu_management.no_menu_selected')}</div>
                </div>
            )}
        </div>
    );
};

export default MenuManagement;
