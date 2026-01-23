import React, { useState } from 'react';
import { FaPlus, FaTrash, FaQrcode } from 'react-icons/fa';
import type { Menu } from '../types/menu';
import { useTranslation } from 'react-i18next';

interface MenuSelectorProps {
    menus: Menu[];
    selectedMenuId: number | null;
    onSelectMenu: (menu: Menu) => void;
    onCreateMenu: (name: string) => void;
    onDeleteMenu: (id: number) => void;
    onGenerateQR?: (menu: Menu) => void;
}

const MenuSelector: React.FC<MenuSelectorProps> = ({
    menus,
    selectedMenuId,
    onSelectMenu,
    onCreateMenu,
    onDeleteMenu,
    onGenerateQR }) => {
    const { t } = useTranslation('restaurant');
    const [isCreating, setIsCreating] = useState(false);
    const [newMenuName, setNewMenuName] = useState('');

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMenuName.trim()) {
            onCreateMenu(newMenuName);
            setNewMenuName('');
            setIsCreating(false);
        }
    };

    const handleDelete = () => {
        if (!selectedMenuId) return;
        onDeleteMenu(selectedMenuId);
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
                <label className="font-semibold text-gray-700 whitespace-nowrap">{t('menu.active_label')}</label>
                <select
                    className="flex-1 p-2 border rounded max-w-md"
                    value={selectedMenuId || ''}
                    onChange={(e) => {
                        const menu = menus.find(m => m.id === Number(e.target.value));
                        if (menu) onSelectMenu(menu);
                    }}
                >
                    <option value="" disabled>{t('menu.select_placeholder')}</option>
                    {menus.map(menu => (
                        <option key={menu.id} value={menu.id}>
                            {menu.name} {menu.active ? `(${t('common.active')})` : ''}
                        </option>
                    ))}
                </select>

                {selectedMenuId && (
                    <div className="flex gap-2">
                        {onGenerateQR && (
                            <button
                                onClick={() => {
                                    const menu = menus.find(m => m.id === selectedMenuId);
                                    if (menu) onGenerateQR(menu);
                                }}
                                className="text-blue-500 hover:text-blue-700 p-2 border border-blue-100 rounded hover:bg-blue-50 transition-colors"
                                title="Generate QR for this Menu"
                            >
                                <FaQrcode />
                            </button>
                        )}
                        <button
                            onClick={handleDelete}
                            className="text-red-500 hover:text-red-700 p-2 border border-red-100 rounded hover:bg-red-50 transition-colors"
                            title="Delete this Menu"
                        >
                            <FaTrash />
                        </button>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2">
                {isCreating ? (
                    <form onSubmit={handleCreate} className="flex gap-2 animate-fadeIn">
                        <input
                            type="text"
                            value={newMenuName}
                            onChange={(e) => setNewMenuName(e.target.value)}
                            placeholder={t('menu.new_placeholder')}
                            className="p-2 border rounded"
                            autoFocus
                        />
                        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                            {t('common.save')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsCreating(false)}
                            className="text-gray-500 hover:text-gray-700 px-2"
                        >
                            {t('common.cancel')}
                        </button>
                    </form>
                ) : (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                    >
                        <FaPlus /> {t('menu.new_menu')}
                    </button>
                )}
            </div>
        </div>
    );
};

export default MenuSelector;
