import React, { useState, useEffect, useRef } from 'react';
import axios from '../services/api';
import orderService from '../services/orderService';
import { useTranslation } from 'react-i18next';

import { toast } from 'react-toastify';
import { FaFire, FaCheck, FaUtensils, FaClock, FaCheckDouble } from 'react-icons/fa';
import type { Order } from '../types/restaurant';

interface OrderCardProps {
    order: Order;
    actionLabel: string;
    actionIcon: React.ComponentType;
    onAction: (id: number | string) => void;
    colorClass: string;
}

const KitchenDisplay: React.FC = () => {
    const { t } = useTranslation('restaurant');
    const [orders, setOrders] = useState<Order[]>([]);
    const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
    const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
    const prevPendingCount = useRef<number>(0);

    useEffect(() => {
        loadOrders();
        const interval = setInterval(loadOrders, 5000);
        return () => clearInterval(interval);
    }, []);

    // Audio Alert Logic
    useEffect(() => {
        const pendingCount = orders.filter(o => o.status === 'PENDING').length;
        if (pendingCount > prevPendingCount.current && audioEnabled) {
            playNotificationSound();
        }
        prevPendingCount.current = pendingCount;
    }, [orders, audioEnabled]);

    const playNotificationSound = () => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(500, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1);

            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        } catch (e) {
            console.error("Audio play failed");
        }
    };

    const loadOrders = async () => {
        try {
            const res = await orderService.getOrders();
            setOrders(res);
        } catch (err) {
            console.warn("Failed to load orders, using mock data");
            // Inline require to avoid top-level if needed, or better yet, assume import
            const { MOCK_ORDERS } = require('../data/mockData');
            setOrders(MOCK_ORDERS);
        }
    };

    // Quick Status Updates Using New Endpoints
    const markPreparing = async (orderId: number | string) => {
        setLoading(prev => ({ ...prev, [orderId]: true }));
        try {
            await orderService.markPreparing(Number(orderId));
            toast.success(t('messages.order_updated'));
            loadOrders();
        } catch (err) {
            toast.error(t('messages.error_occurred'));
        } finally {
            setLoading(prev => ({ ...prev, [orderId]: false }));
        }
    };

    const markReady = async (orderId: number | string) => {
        setLoading(prev => ({ ...prev, [orderId]: true }));
        try {
            await orderService.markReady(Number(orderId));
            toast.success(t('messages.order_updated'));
            loadOrders();
        } catch (err) {
            toast.error(t('messages.error_occurred'));
        } finally {
            setLoading(prev => ({ ...prev, [orderId]: false }));
        }
    };

    const markServed = async (orderId: number | string) => {
        setLoading(prev => ({ ...prev, [orderId]: true }));
        try {
            await orderService.markServed(Number(orderId));
            toast.success(t('messages.order_updated'));
            loadOrders();
        } catch (err) {
            toast.error(t('messages.error_occurred'));
        } finally {
            setLoading(prev => ({ ...prev, [orderId]: false }));
        }
    };

    const togglePayment = async (orderId: number | string, currentStatus: string) => {
        const newStatus = currentStatus === 'PAID' ? 'UNPAID' : 'PAID';
        try {
            await axios.put(`/restaurant/orders/${orderId}/payment?status=${newStatus}`);
            toast.success(newStatus === 'PAID' ? t('orders.paid') : t('orders.unpaid'));
            loadOrders();
        } catch (err) {
            toast.error(t('messages.error_occurred'));
        }
    };

    const filterByStatus = (status: string) => orders.filter(o => o.status === status);

    const OrderCard: React.FC<OrderCardProps> = ({ order, actionLabel, actionIcon: Icon, onAction, colorClass }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <div className="bg-gray-100 px-3 py-1 rounded-lg font-bold text-lg">
                    T-{order.tableNumber}
                </div>
                <div className="text-xs text-gray-400 flex items-center gap-1">
                    <FaClock /> {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>

            <div className="space-y-3 mb-4">
                {order.items && order.items.map((item, idx) => (
                    <div key={idx} className="text-gray-700 font-medium border-b border-gray-50 pb-2 last:border-0">
                        <div className="flex justify-between">
                            <span>{item.quantity}x {item.menuItemName || item.itemName}</span>
                        </div>
                        {item.notes && (
                            <div className="text-xs text-orange-600 italic mt-1 bg-orange-50 p-1 rounded inline-block">
                                - {item.notes}
                            </div>
                        )}
                    </div>
                ))}
                {order.customerNote && (
                    <div className="text-sm text-yellow-800 bg-yellow-100 p-2 rounded-lg mt-2 border border-yellow-200">
                        <strong>{t('orders.note')}:</strong> {order.customerNote}
                    </div>
                )}
            </div>

            <div className="flex gap-2 mb-3">
                <button
                    onClick={(e) => { e.stopPropagation(); togglePayment(order.id, order.paymentStatus || 'UNPAID'); }}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${order.paymentStatus === 'PAID'
                        ? 'bg-green-100 text-green-700 border-2 border-green-300'
                        : 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300 hover:bg-yellow-200'
                        }`}
                >
                    {order.paymentStatus === 'PAID' ? `✓ ${t('orders.paid')}` : `$ ${t('orders.unpaid')}`}
                </button>
            </div>

            <button
                onClick={() => onAction(order.id)}
                className={`w-full py-3 rounded-lg text-white font-bold text-lg flex items-center justify-center gap-2 transition-transform active:scale-95 ${colorClass}`}
            >
                <Icon /> {actionLabel}
            </button>
        </div>
    );

    return (
        <div className="container mx-auto p-4 h-[calc(100vh-64px)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
                    <FaUtensils className="text-indigo-600" /> {t('kitchen.title')}
                </h1>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            setAudioEnabled(!audioEnabled);
                            if (!audioEnabled) playNotificationSound(); // Test sound
                        }}
                        className={`px-4 py-2 rounded-full font-bold text-sm transition ${audioEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}
                    >
                        {audioEnabled ? t('kitchen.audio_on') : t('kitchen.audio_off')}
                    </button>
                    <div className="text-sm text-gray-500">
                        {t('kitchen.auto_refresh')}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-hidden">
                {/* INCOMING */}
                <div className="bg-gray-50 rounded-2xl p-4 flex flex-col h-full border border-gray-200">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-700 border-b pb-2 border-gray-200 sticky top-0 bg-gray-50 z-10">
                        <span className="bg-red-500 text-white w-8 h-8 flex items-center justify-center rounded-full text-sm shadow-sm">
                            {filterByStatus('PENDING').length}
                        </span>
                        {t('kitchen.incoming')}
                    </h2>
                    <div className="overflow-y-auto flex-1 pr-2">
                        {filterByStatus('PENDING').map(order => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                actionLabel={loading[order.id] ? t('kitchen.processing') : t('kitchen.start_cooking')}
                                actionIcon={FaFire}
                                colorClass={`bg-red-500 hover:bg-red-600 shadow-red-200 shadow-lg ${loading[order.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onAction={(id) => markPreparing(id)}
                            />
                        ))}
                        {filterByStatus('PENDING').length === 0 && (
                            <div className="text-center text-gray-400 mt-10">{t('kitchen.no_pending')}</div>
                        )}
                    </div>
                </div>

                {/* PREPARING */}
                <div className="bg-blue-50 rounded-2xl p-4 flex flex-col h-full border border-blue-100">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-700 border-b pb-2 border-blue-200 sticky top-0 bg-blue-50 z-10">
                        <span className="bg-blue-500 text-white w-8 h-8 flex items-center justify-center rounded-full text-sm shadow-sm">
                            {filterByStatus('PREPARING').length}
                        </span>
                        {t('kitchen.cooking')}
                    </h2>
                    <div className="overflow-y-auto flex-1 pr-2">
                        {filterByStatus('PREPARING').map(order => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                actionLabel={loading[order.id] ? t('kitchen.processing') : t('kitchen.mark_ready')}
                                actionIcon={FaCheck}
                                colorClass={`bg-blue-500 hover:bg-blue-600 shadow-blue-200 shadow-lg ${loading[order.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onAction={(id) => markReady(id)}
                            />
                        ))}
                    </div>
                </div>

                {/* READY */}
                <div className="bg-green-50 rounded-2xl p-4 flex flex-col h-full border border-green-100">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-700 border-b pb-2 border-green-200 sticky top-0 bg-green-50 z-10">
                        <span className="bg-green-500 text-white w-8 h-8 flex items-center justify-center rounded-full text-sm shadow-sm">
                            {filterByStatus('READY').length}
                        </span>
                        {t('kitchen.ready_to_serve')}
                    </h2>
                    <div className="overflow-y-auto flex-1 pr-2">
                        {filterByStatus('READY').map(order => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                actionLabel={loading[order.id] ? t('kitchen.processing') : t('kitchen.serve')}
                                actionIcon={FaCheckDouble}
                                colorClass={`bg-green-500 hover:bg-green-600 shadow-green-200 shadow-lg ${loading[order.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onAction={(id) => markServed(id)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KitchenDisplay;
