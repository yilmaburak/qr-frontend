import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from '../../services/api';
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import type { InventoryItem } from '../../types/restaurant';
import { useTranslation } from 'react-i18next';

const Inventory: React.FC = () => {
    const { t } = useTranslation('restaurant');
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [newItem, setNewItem] = useState<{ name: string; quantity: string; unit: string; threshold: string }>({ name: '', quantity: '', unit: '', threshold: '' });
    const [editingId, setEditingId] = useState<string | number | null>(null);
    const [editForm, setEditForm] = useState<Partial<InventoryItem>>({});

    useEffect(() => {
        loadInventory();
    }, []);

    const loadInventory = async () => {
        try {
            const res = await axios.get<InventoryItem[]>('/restaurant/inventory');
            setItems(res.data);
        } catch (error) {
            console.error("Failed to load inventory", error);
            // toast.error("Failed to load inventory");
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...newItem,
                quantity: parseFloat(newItem.quantity),
                threshold: parseFloat(newItem.threshold)
            };
            const res = await axios.post<InventoryItem>('/restaurant/inventory', payload);
            setItems([...items, res.data]);
            setNewItem({ name: '', quantity: '', unit: '', threshold: '' });
            toast.success(t('inventory.added'));
        } catch (error) {
            toast.error(t('inventory.add_fail'));
        }
    };

    const handleDelete = async (id: number | string) => {
        if (!window.confirm(t('inventory.delete_confirm'))) return;
        try {
            await axios.delete(`/restaurant/inventory/${id}`);
            setItems(items.filter(i => i.id !== id));
            toast.success(t('inventory.deleted'));
        } catch (error) {
            toast.error(t('inventory.delete_fail'));
        }
    };

    const startEdit = (item: InventoryItem) => {
        setEditingId(item.id);
        setEditForm({ ...item });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    const saveEdit = async () => {
        if (!editingId) return;
        try {
            const qty = parseFloat(String(editForm.quantity));
            const res = await axios.put<InventoryItem>(`/restaurant/inventory/${editingId}/stock`, { quantity: qty });

            // If the endpoint returns the full item, use it. Otherwise update local state optimistically or re-fetch.
            // Assuming it returns updated item or we trust local update for now.
            // If backend only returns { success: true }, we construct.
            // Let's assume standard REST returning item.
            setItems(items.map(i => i.id === editingId ? { ...i, quantity: qty } : i));

            setEditingId(null);
            toast.success(t('inventory.stock_updated'));
        } catch (error) {
            toast.error(t('inventory.stock_update_fail'));
        }
    };

    if (loading) return <div>{t('inventory.loading')}</div>;

    return (
        <div className="container mx-auto">
            <h1 className="text-2xl font-bold mb-6">{t('inventory.title')}</h1>

            {/* Add New Item Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
                <h2 className="font-bold text-lg mb-4">{t('inventory.add_item')}</h2>
                <form onSubmit={handleAddItem} className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium mb-1">{t('inventory.item_name')}</label>
                        <input
                            type="text"
                            value={newItem.name}
                            onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div className="w-32">
                        <label className="block text-sm font-medium mb-1">{t('inventory.quantity')}</label>
                        <input
                            type="number"
                            value={newItem.quantity}
                            onChange={e => setNewItem({ ...newItem, quantity: e.target.value })}
                            className="w-full p-2 border rounded"
                            step="0.1"
                            required
                        />
                    </div>
                    <div className="w-24">
                        <label className="block text-sm font-medium mb-1">{t('inventory.unit')}</label>
                        <input
                            type="text"
                            value={newItem.unit}
                            onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
                            className="w-full p-2 border rounded"
                            placeholder={t('inventory.unit_placeholder')}
                            required
                        />
                    </div>
                    <div className="w-32">
                        <label className="block text-sm font-medium mb-1">{t('inventory.threshold')}</label>
                        <input
                            type="number"
                            value={newItem.threshold}
                            onChange={e => setNewItem({ ...newItem, threshold: e.target.value })}
                            className="w-full p-2 border rounded"
                            step="0.1"
                        />
                    </div>
                    <button type="submit" className="bg-orange-500 text-white px-6 py-2 rounded font-bold hover:bg-orange-600">
                        <FaPlus /> {t('inventory.add')}
                    </button>
                </form>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600">{t('inventory.item_name')}</th>
                            <th className="p-4 font-semibold text-gray-600">{t('inventory.quantity')}</th>
                            <th className="p-4 font-semibold text-gray-600">{t('inventory.unit')}</th>
                            <th className="p-4 font-semibold text-gray-600">{t('inventory.threshold')}</th>
                            <th className="p-4 font-semibold text-gray-600 text-right">{t('inventory.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id} className="border-b hover:bg-gray-50">
                                <td className="p-4 font-medium">{item.name}</td>
                                <td className="p-4">
                                    {editingId === item.id ? (
                                        <input
                                            type="number"
                                            value={editForm.quantity}
                                            onChange={e => setEditForm({ ...editForm, quantity: parseFloat(e.target.value) || 0 })}
                                            className="w-24 p-1 border rounded"
                                        />
                                    ) : (
                                        <span className={item.quantity <= item.threshold ? 'text-red-500 font-bold' : 'text-green-600 font-bold'}>
                                            {item.quantity}
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 text-gray-500">{item.unit}</td>
                                <td className="p-4 text-gray-500">{item.threshold}</td>
                                <td className="p-4 text-right space-x-2">
                                    {editingId === item.id ? (
                                        <>
                                            <button onClick={saveEdit} className="text-green-500 hover:text-green-700"><FaSave /></button>
                                            <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-700"><FaTimes /></button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => startEdit(item)} className="text-blue-500 hover:text-blue-700"><FaEdit /></button>
                                            <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700"><FaTrash /></button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-400">{t('inventory.no_items')}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Inventory;
