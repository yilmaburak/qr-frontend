import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import axios from 'axios';
import { getCurrentUser } from '../services/auth';
import {
    FaUtensils, FaCheck, FaClock, FaSpinner, FaBell, FaTimes, FaMoneyBillWave, FaMotorcycle
} from 'react-icons/fa';
import Modal from '../components/common/Modal';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

// Delivery Icons (You might want to replace these with actual logos if available, using text/colors for now)
const DeliveryIcon = ({ source }: { source: string }) => {
    switch (source) {
        case 'YEMEKSEPETI': return <span className="bg-red-600 text-white text-xs px-2 py-1 rounded font-bold">YS</span>;
        case 'TRENDYOL': return <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded font-bold">TY</span>;
        case 'GETIR': return <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded font-bold">GT</span>;
        default: return <FaMotorcycle />;
    }
};

interface TableOrderItem {
    itemName: string;
    quantity: number;
    price: number;
    status: string;
    notes?: string;
}

interface TableDisplay {
    id: number;
    tableNumber: string;
    hasPendingOrders: boolean;
    activeOrderId?: number;
    // Updated DTO fields
    lastWaiterCallTime?: string;
    waiterCallDurationMinutes?: number; // Calculated on frontend
    totalBill?: number;
    activeItems?: TableOrderItem[];
}

const KitchenDisplay: React.FC = () => {
    const { t } = useTranslation('restaurant');
    const [tables, setTables] = useState<TableDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTable, setSelectedTable] = useState<TableDisplay | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const navigate = useNavigate();
    const user = getCurrentUser();

    // Sound effect for new orders
    const playNotificationSound = () => {
        const audio = new Audio('/notification.mp3'); // Ensure this file exists in public folder
        audio.play().catch(e => console.log('Audio play failed', e));
    };

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        loadData();

        // Initial Poll
        const interval = setInterval(loadData, 15000);

        // Websocket Connection Wrapper
        let client: any = null;

        const connectWebSocket = () => {
            // @ts-ignore
            const socket = new SockJS('http://localhost:8080/ws');
            // @ts-ignore
            client = Stomp.over(socket);
            client.debug = () => { };
            // Auto reconnect logic managed by StompJS if configured, or manual
            client.reconnect_delay = 5000;

            client.connect({}, () => {
                const restaurantId = user.id;
                console.log('WS Connected');
                client.subscribe(`/topic/kitchen/${restaurantId}`, (message: any) => {
                    console.log('New Order Received via Websocket');
                    toast.info(t('kitchen.new_order'), {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "light",
                    });
                    playNotificationSound();
                    loadData();
                });
            }, (err: any) => {
                console.error('Websocket connection error', err);
                // Manual reconnect retry just in case
                setTimeout(connectWebSocket, 5000);
            });
        };

        connectWebSocket();

        // Separate timer to update "minutes ago" every minute without refetching
        const timerInterval = setInterval(() => {
            setTables(prev => [...prev]);
        }, 60000);

        return () => {
            clearInterval(interval);
            clearInterval(timerInterval);
            if (client && client.connected) {
                client.disconnect();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate]);

    const loadData = async () => {
        try {
            const token = localStorage.getItem('token');
            // Fetch Tables (now includes bill and items)
            const response = await axios.get('http://localhost:8080/api/restaurant/admin/tables', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const rawTables: TableDisplay[] = response.data;
            const now = new Date();

            // Calculate durations and process
            const processedTables = rawTables.map(t => {
                let duration = 0;
                if (t.lastWaiterCallTime) {
                    const callTime = new Date(t.lastWaiterCallTime);
                    const diffMs = now.getTime() - callTime.getTime();
                    duration = Math.floor(diffMs / 60000); // Minutes
                }
                return { ...t, waiterCallDurationMinutes: duration };
            });

            // Sort:
            // 1. Waiter Call (Longest wait first)
            // 2. Delivery Orders (Negative IDs)
            // 3. Pending Orders (Has orders = true)
            // 4. Others (By Table Number)
            processedTables.sort((a, b) => {
                const isADelivery = a.id < 0;
                const isBDelivery = b.id < 0;

                // Priority 1: Waiter Calls
                if (a.lastWaiterCallTime && !b.lastWaiterCallTime) return -1;
                if (!a.lastWaiterCallTime && b.lastWaiterCallTime) return 1;
                if (a.lastWaiterCallTime && b.lastWaiterCallTime) {
                    return (b.waiterCallDurationMinutes || 0) - (a.waiterCallDurationMinutes || 0); // Descending duration
                }

                // Priority 2: Delivery Orders
                if (isADelivery && !isBDelivery) return -1;
                if (!isADelivery && isBDelivery) return 1;

                // Priority 3: Pending Orders
                if (a.hasPendingOrders && !b.hasPendingOrders) return -1;
                if (!a.hasPendingOrders && b.hasPendingOrders) return 1;

                // Priority 4: Table Number
                // Handle "DELIVERY-" strings vs numbers
                return a.tableNumber.localeCompare(b.tableNumber, undefined, { numeric: true });
            });

            setTables(processedTables);
            setLoading(false);
        } catch (error) {
            console.error(error);
            // Fallback for mock/demo if backend fails
            setLoading(false);
        }
    };

    const handleDismissCall = async (e: React.MouseEvent, tableId: number) => {
        e.stopPropagation(); // Prevent card click
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:8080/api/restaurant/admin/tables/${tableId}/dismiss-call`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(t('kitchen.dismissed'));
            loadData();
        } catch (error) {
            toast.error(t('kitchen.dismiss_fail'));
        }
    };

    const handleCardClick = (table: TableDisplay) => {
        setSelectedTable(table);
        setIsDetailsModalOpen(true);
    };

    if (loading) return <div className="p-8 text-center text-gray-500">{t('kitchen.loading')}</div>;

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold mb-8 text-gray-800 flex items-center gap-3">
                <FaUtensils /> {t('kitchen.title')}
                <span className="text-sm font-normal text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                    {t('kitchen.live_updates')}
                </span>
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {tables.map(table => {
                    const isWaiterCall = !!table.lastWaiterCallTime;
                    const isUrgentCall = isWaiterCall && (table.waiterCallDurationMinutes || 0) > 5;
                    const hasOrders = table.hasPendingOrders;
                    const isDelivery = table.id < 0; // Negative ID for virtual delivery tables

                    // Parse Order Source from Table Number if Delivery
                    let deliverySource = '';
                    if (isDelivery) {
                        const parts = table.tableNumber.split('-');
                        if (parts.length > 1) deliverySource = parts[1];
                    }

                    let cardClass = "bg-white border-l-4 border-gray-300"; // Default Idle
                    if (isUrgentCall) cardClass = "bg-red-50 border-l-4 border-red-600 animate-pulse-slow shadow-lg transform scale-105 transition-transform";
                    else if (isWaiterCall) cardClass = "bg-orange-50 border-l-4 border-orange-500 shadow-md";
                    else if (isDelivery) {
                        // Delivery Color Coding
                        if (deliverySource === 'YEMEKSEPETI') cardClass = "bg-red-50 border-l-4 border-red-600 shadow-md";
                        else if (deliverySource === 'TRENDYOL') cardClass = "bg-orange-50 border-l-4 border-orange-500 shadow-md";
                        else if (deliverySource === 'GETIR') cardClass = "bg-purple-50 border-l-4 border-purple-600 shadow-md";
                        else cardClass = "bg-gray-50 border-l-4 border-gray-500 shadow-md";
                    }
                    else if (hasOrders) cardClass = "bg-blue-50 border-l-4 border-blue-500 shadow-md";

                    return (
                        <div
                            key={table.id}
                            onClick={() => handleCardClick(table)}
                            className={`${cardClass} rounded-lg p-6 relative cursor-pointer hover:shadow-xl transition-shadow`}
                        >
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4">
                                {isDelivery ? (
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2 mb-1">
                                            <DeliveryIcon source={deliverySource} />
                                            <span className="text-xs font-bold text-gray-500 uppercase">{t('kitchen.delivery')}</span>
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-800 truncate" title={table.tableNumber}>
                                            {table.activeItems && table.activeItems.length > 0 ? table.activeItems[0].itemName : t('kitchen.order')}
                                            {table.activeItems && table.activeItems.length > 1 ? ` +${table.activeItems.length - 1}` : ''}
                                        </h2>
                                    </div>
                                ) : (
                                    <h2 className="text-4xl font-bold text-gray-800">#{table.tableNumber}</h2>
                                )}

                                {isWaiterCall && (
                                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${isUrgentCall ? 'bg-red-200 text-red-800' : 'bg-orange-200 text-orange-800'}`}>
                                        <FaBell />
                                        <span className="font-bold">{table.waiterCallDurationMinutes}m</span>
                                        <button
                                            onClick={(e) => handleDismissCall(e, table.id)}
                                            className="ml-2 hover:bg-white/50 rounded-full p-1 transition-colors"
                                            title="Dismiss Call"
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="space-y-3">
                                {hasOrders ? (
                                    <div className={`${isDelivery ? 'text-gray-800' : 'text-blue-800'}`}>
                                        {!isDelivery && (
                                            <>
                                                <div className="flex items-center gap-2 font-semibold">
                                                    <FaUtensils />
                                                    <span>{t('kitchen.active_order')}</span>
                                                </div>
                                                <div className="text-sm mt-1">
                                                    {table.activeItems ? `${table.activeItems.length} items` : 'View Details'}
                                                </div>
                                            </>
                                        )}
                                        {isDelivery && table.activeItems && (
                                            <div className="text-sm text-gray-600 italic">
                                                {/* Customer name etc could go here if in DTO */}
                                                {t('kitchen.customer_note')}: {table.activeItems[0]?.notes || 'No notes'}
                                            </div>
                                        )}
                                    </div>
                                ) : !isWaiterCall && (
                                    <div className="text-gray-400 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                        {t('kitchen.idle')}
                                    </div>
                                )}

                                {/* Total Bill Display */}
                                {table.totalBill !== undefined && table.totalBill > 0 && (
                                    <div className="flex items-center gap-2 text-green-700 font-bold bg-green-50 px-3 py-2 rounded-lg mt-2">
                                        <FaMoneyBillWave />
                                        <span>${table.totalBill?.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Table Details Modal */}
            <Modal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                title={selectedTable?.id && selectedTable.id < 0 ? t('kitchen.delivery_details') : t('kitchen.table_details', { number: selectedTable?.tableNumber })}
                size="lg"
                footer={
                    <button
                        onClick={() => setIsDetailsModalOpen(false)}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-800"
                    >
                        {t('kitchen.close')}
                    </button>
                }
            >
                {selectedTable && (
                    <div className="space-y-6">
                        {/* Status Summary */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase">{t('kitchen.total_bill')}</h3>
                                <div className="text-2xl font-bold text-green-600">
                                    ${(selectedTable.totalBill || 0).toFixed(2)}
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase">{t('orders.status')}</h3>
                                {selectedTable.id < 0 ? (
                                    <div className="text-blue-600 font-bold flex items-center gap-2">
                                        <FaMotorcycle /> {t('kitchen.delivery')}
                                    </div>
                                ) : selectedTable.lastWaiterCallTime ? (
                                    <div className="text-red-500 font-bold flex items-center gap-2">
                                        <FaBell /> {t('kitchen.called_ago', { minutes: selectedTable.waiterCallDurationMinutes })}
                                    </div>
                                ) : (
                                    <div className="text-gray-500">{t('kitchen.active')}</div>
                                )}
                            </div>
                        </div>

                        {/* Order Items */}
                        <div>
                            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                                <FaUtensils className="text-gray-400" />
                                {t('kitchen.served_items')}
                            </h3>
                            {selectedTable.activeItems && selectedTable.activeItems.length > 0 ? (
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('kitchen.order')}</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('kitchen.qty')}</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('kitchen.price')}</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('inventory.status')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {selectedTable.activeItems.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="font-medium text-gray-900">{item.itemName}</div>
                                                        {item.notes && <div className="text-xs text-gray-400 italic">{item.notes}</div>}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">{item.quantity}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">${item.price.toFixed(2)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                            ${item.status === 'SERVED' ? 'bg-green-100 text-green-800' :
                                                                item.status === 'PREPARING' ? 'bg-blue-100 text-blue-800' :
                                                                    'bg-yellow-100 text-yellow-800'}`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-50">
                                            <tr>
                                                <td colSpan={2} className="px-6 py-3 text-right font-bold">{t('orders.total')}</td>
                                                <td colSpan={2} className="px-6 py-3 font-bold text-green-700">
                                                    ${(selectedTable.totalBill || 0).toFixed(2)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg">
                                    {t('kitchen.no_items')}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default KitchenDisplay;
