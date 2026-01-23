import React, { useEffect, useState } from 'react';
import { FaPlus, FaBoxOpen, FaEdit, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import inventoryService from '../services/inventoryService';
import { InventoryItem } from '../types/restaurant';
import SkeletonLoader from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';
import { useTranslation } from 'react-i18next';

const InventoryDashboard: React.FC = () => {
    const { t } = useTranslation(['restaurant', 'common']);
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<InventoryItem>>({
        name: '',
        quantity: 0,
        unit: 'PCS',
        reorderLevel: 5,
        costPerUnit: 0
    });

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            const data = await inventoryService.getInventory();
            setItems(data);
        } catch (error) {
            console.error('Failed to fetch inventory', error);
            toast.error(t('inventory.fetch_error'));
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (item?: InventoryItem) => {
        if (item) {
            setEditingItem(item);
            setFormData(item);
        } else {
            setEditingItem(null);
            setFormData({
                name: '',
                quantity: 0,
                unit: 'PCS',
                reorderLevel: 5,
                costPerUnit: 0
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await inventoryService.updateInventoryItem(editingItem.id, formData);
                toast.success(t('inventory.update_success'));
            } else {
                await inventoryService.createInventoryItem(formData);
                toast.success(t('inventory.create_success'));
            }
            setIsModalOpen(false);
            fetchInventory();
        } catch (error) {
            toast.error(t('inventory.save_error'));
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm(t('inventory.delete_confirm'))) {
            try {
                await inventoryService.deleteInventoryItem(id);
                toast.success(t('inventory.item_deleted'));
                fetchInventory();
            } catch (error) {
                toast.error(t('inventory.delete_error'));
            }
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6 max-w-7xl">
                <SkeletonLoader height={400} className="rounded-xl" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <FaBoxOpen className="text-indigo-600" /> {t('inventory.title')}
                </h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition"
                >
                    <FaPlus /> {t('inventory.add_item')}
                </button>
            </div>

            {items.length === 0 ? (
                <EmptyState
                    title={t('inventory.no_items')}
                    description={t('inventory.no_items_desc')}
                    actionLabel={t('inventory.add_item')}
                    onAction={() => handleOpenModal()}
                    icon={<FaBoxOpen />}
                />
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600">{t('inventory.labels.name')}</th>
                                <th className="p-4 font-semibold text-gray-600">{t('inventory.labels.quantity')}</th>
                                <th className="p-4 font-semibold text-gray-600">{t('inventory.labels.unit')}</th>
                                <th className="p-4 font-semibold text-gray-600">{t('inventory.labels.cost')}</th>
                                <th className="p-4 font-semibold text-gray-600">{t('inventory.status')}</th>
                                <th className="p-4 font-semibold text-gray-600">{t('inventory.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(item => (
                                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 from-gray-50 to-white transition">
                                    <td className="p-4 font-medium text-gray-800">{item.name}</td>
                                    <td className="p-4">{item.quantity}</td>
                                    <td className="p-4 text-gray-500">{item.unit}</td>
                                    <td className="p-4">${item.costPerUnit?.toFixed(2)}</td>
                                    <td className="p-4">
                                        {item.quantity <= (item.reorderLevel || 5) && (
                                            <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold">
                                                <FaExclamationTriangle /> Low Stock
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 flex gap-2">
                                        <button onClick={() => handleOpenModal(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                                            <FaEdit />
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4">{editingItem ? t('inventory.edit_title') : t('inventory.add_title')}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('inventory.labels.name')}</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('inventory.labels.quantity')}</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.quantity}
                                        onChange={e => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('inventory.labels.unit')}</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.unit}
                                        onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                    >
                                        <option value="PCS">PCS</option>
                                        <option value="KG">KG</option>
                                        <option value="L">L</option>
                                        <option value="OZ">OZ</option>
                                        <option value="BOX">BOX</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('inventory.labels.cost')}</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.costPerUnit}
                                        onChange={e => setFormData({ ...formData, costPerUnit: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('inventory.labels.reorder_level')}</label>
                                    <input
                                        type="number"
                                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.reorderLevel}
                                        onChange={e => setFormData({ ...formData, reorderLevel: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    {t('common:cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    {t('inventory.save_btn')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryDashboard;
