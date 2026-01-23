import React, { useEffect, useState } from 'react';
import { FaCalendarAlt, FaCheck, FaTimes, FaPhone, FaUser } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from '../services/api';
import { useTranslation } from 'react-i18next';
import SkeletonLoader from '../components/common/SkeletonLoader';

interface Reservation {
    id: number;
    customerName: string;
    customerPhone: string;
    reservationTime: string;
    partySize: number;
    status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED';
    tableNumber?: string;
}

const ReservationDashboard: React.FC = () => {
    const { t } = useTranslation('restaurant');
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        try {
            const res = await axios.get('/restaurant/reservations');
            setReservations(res.data);
        } catch (error) {
            toast.error(t('reservations.load_fail'));
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: number, status: string) => {
        try {
            await axios.put(`/restaurant/reservations/${id}/status?status=${status}`);
            setReservations(prev => prev.map(r => r.id === id ? { ...r, status: status as any } : r));
            toast.success(t('reservations.status_update', { status: status }));
        } catch (error) {
            toast.error(t('reservations.update_fail'));
        }
    };

    if (loading) return <div className="p-8"><SkeletonLoader height={400} className="rounded-xl" /></div>;

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
                <FaCalendarAlt className="text-indigo-600" /> {t('reservations.title')}
            </h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                        <tr>
                            <th className="p-4">{t('reservations.time')}</th>
                            <th className="p-4">{t('reservations.customer')}</th>
                            <th className="p-4">{t('reservations.party_size')}</th>
                            <th className="p-4">{t('reservations.status')}</th>
                            <th className="p-4 text-right">{t('reservations.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {reservations.map(res => (
                            <tr key={res.id} className="hover:bg-gray-50 transition">
                                <td className="p-4">
                                    <div className="font-bold text-gray-800">
                                        {new Date(res.reservationTime).toLocaleDateString()}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {new Date(res.reservationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <FaUser className="text-gray-300" />
                                        <span className="font-medium text-gray-900">{res.customerName}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                        <FaPhone className="text-gray-300 text-xs" />
                                        {res.customerPhone}
                                    </div>
                                </td>
                                <td className="p-4 text-gray-600 font-medium">
                                    {res.partySize} {t('reservations.guests')}
                                </td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(res.status)}`}>
                                        {t(`reservations.${res.status.toLowerCase()}`, { defaultValue: res.status })}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    {res.status === 'PENDING' && (
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => updateStatus(res.id, 'CONFIRMED')}
                                                className="bg-green-100 text-green-700 p-2 rounded-lg hover:bg-green-200 transition"
                                                title="Confirm"
                                            >
                                                <FaCheck />
                                            </button>
                                            <button
                                                onClick={() => updateStatus(res.id, 'REJECTED')}
                                                className="bg-red-100 text-red-700 p-2 rounded-lg hover:bg-red-200 transition"
                                                title="Reject"
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {reservations.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-400">
                                    {t('reservations.no_reservations')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'CONFIRMED': return 'bg-green-100 text-green-700 border-green-200';
        case 'REJECTED': return 'bg-red-50 text-red-400 border-red-100';
        case 'CANCELLED': return 'bg-gray-100 text-gray-500 border-gray-200';
        default: return 'bg-gray-50 text-gray-600';
    }
};

export default ReservationDashboard;
