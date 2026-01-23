import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from '../../services/api';
import { FaClock, FaCheckCircle, FaUtensils, FaTruck } from 'react-icons/fa';
import type { Order } from '../../types/restaurant';
import { useTranslation } from 'react-i18next';

const Orders: React.FC = () => {
    const { t } = useTranslation('restaurant');
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const statuses = [
        { key: 'PENDING', label: t('orders.pending'), icon: <FaClock />, color: 'bg-yellow-100 text-yellow-600' },
        { key: 'PREPARING', label: t('orders.preparing'), icon: <FaUtensils />, color: 'bg-blue-100 text-blue-600' },
        { key: 'READY', label: t('orders.ready'), icon: <FaCheckCircle />, color: 'bg-green-100 text-green-600' },
        { key: 'DELIVERED', label: t('orders.delivered'), icon: <FaTruck />, color: 'bg-gray-100 text-gray-600' }
    ];

    useEffect(() => {
        loadOrders();
        // Poll for new orders every 30 seconds
        const interval = setInterval(loadOrders, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadOrders = async () => {
        try {
            const res = await axios.get<Order[]>('/restaurant/orders');
            setOrders(res.data);
        } catch (error) {
            console.error("Failed to load orders", error);
            // toast.error("Could not load orders");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId: number | string, newStatus: string) => {
        try {
            const res = await axios.put<Order>(`/restaurant/orders/${orderId}/status?status=${newStatus}`);
            // Assuming endpoint returns the updated order
            // If not, we map locally.
            const updatedOrder = res.data || { ...orders.find(o => o.id === orderId), status: newStatus };
            setOrders(orders.map(o => o.id === orderId ? (updatedOrder as Order) : o));
            toast.success(t('orders.status_updated', { id: orderId, status: newStatus }));
        } catch (error) {
            toast.error(t('orders.update_fail'));
        }
    };

    // Helper to filter orders by status
    const getOrdersByStatus = (status: string) => orders.filter(o => o.status === status);

    // Helper for next/prev status
    const getNextStatus = (current: string) => {
        const flow = ['PENDING', 'PREPARING', 'READY', 'DELIVERED'];
        const idx = flow.indexOf(current);
        return idx < flow.length - 1 ? flow[idx + 1] : current;
    };

    const getPrevStatus = (current: string) => {
        const flow = ['PENDING', 'PREPARING', 'READY', 'DELIVERED'];
        const idx = flow.indexOf(current);
        return idx > 0 ? flow[idx - 1] : current;
    };


    if (loading) return <div className="p-8 text-center">{t('orders.loading')}</div>;

    return (
        <div className="container mx-auto">
            <h1 className="text-2xl font-bold mb-6">{t('orders.title')}</h1>

            <div className="flex gap-4 overflow-x-auto pb-4">
                {statuses.map(status => (
                    <div key={status.key} className="min-w-[300px] flex-1 bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className={`flex items-center gap-2 mb-4 p-3 rounded-lg ${status.color}`}>
                            {status.icon}
                            <span className="font-bold">{status.label}</span>
                            <span className="ml-auto bg-white px-2 py-0.5 rounded-full text-sm shadow-sm">
                                {getOrdersByStatus(status.key).length}
                            </span>
                        </div>

                        <div className="space-y-3">
                            {getOrdersByStatus(status.key).map(order => (
                                <div key={order.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold text-gray-800">#{order.id}</span>
                                        <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</span>
                                    </div>
                                    <div className="mb-2">
                                        <span className="text-sm font-semibold text-gray-700">{t('orders.table')}: {order.tableNumber || t('orders.takeaway')}</span>
                                    </div>

                                    <div className="space-y-1 mb-3">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                                <span className="text-gray-600">{item.quantity}x {item.itemName || item.menuItemName}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {order.customerNote && (
                                        <div className="bg-yellow-50 p-2 rounded text-xs text-yellow-700 mb-3">
                                            {t('orders.note')}: {order.customerNote}
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center pt-2 border-t mt-2">
                                        <span className="font-bold text-orange-500">${order.totalAmount?.toFixed(2)}</span>

                                        <div className="flex gap-2">
                                            {status.key !== 'PENDING' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(order.id, getPrevStatus(status.key))}
                                                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-600"
                                                >
                                                    &lt; {t('orders.prev')}
                                                </button>
                                            )}
                                            {status.key !== 'DELIVERED' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(order.id, getNextStatus(status.key))}
                                                    className="text-xs px-2 py-1 bg-orange-100 hover:bg-orange-200 text-orange-600 rounded font-semibold"
                                                >
                                                    {t('orders.next')} &gt;
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {getOrdersByStatus(status.key).length === 0 && (
                                <div className="text-center py-8 text-gray-400 text-sm italic">
                                    {t('orders.no_orders')}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Orders;
