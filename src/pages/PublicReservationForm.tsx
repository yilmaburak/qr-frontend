import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios'; // Use direct axios for public endpoint (no interceptor/token needed purely)
import { FaCalendarAlt, FaClock, FaUser, FaPhone, FaCheck } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const PublicReservationForm: React.FC = () => {
    const { t } = useTranslation('restaurant');
    // For demo purposes, we might need to know WHICH restaurant.
    // Ideally this ID comes from URL params (e.g. /reserve/:restaurantId) or context.
    // I will hardcode or use a param approach. For this iteration, let's assume URL param logic or a prop.
    // But since this is a top-level page, I'll allow inputting ID for testing or assume '1'.

    // For standard flow: This page would be linked from the Public Menu.
    const [formData, setFormData] = useState({
        restaurantId: 1, // Defaulting to 1 for MVP
        name: '',
        phone: '',
        date: '',
        time: '',
        size: 2
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Combine date and time
            const dateTime = `${formData.date}T${formData.time}:00`;

            await axios.post('http://localhost:8080/api/public/reservations', {
                restaurantId: formData.restaurantId,
                name: formData.name,
                phone: formData.phone,
                time: dateTime,
                size: formData.size
            });
            setSubmitted(true);
            toast.success(t('public_reservation.requested', { defaultValue: 'Reservation requested!' }));
        } catch (error) {
            toast.error(t('public_reservation.submit_fail', { defaultValue: 'Failed to submit reservation.' }));
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FaCheck className="text-4xl text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('public_reservation.success_title')}</h2>
                    <p className="text-gray-600">{t('public_reservation.success_desc')}</p>
                    <button
                        onClick={() => setSubmitted(false)}
                        className="mt-6 text-indigo-600 font-medium hover:underline"
                    >
                        {t('public_reservation.make_another')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('public_reservation.title')}</h1>
                    <p className="text-gray-500">{t('public_reservation.subtitle')}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('public_reservation.your_name')}</label>
                        <div className="relative">
                            <FaUser className="absolute left-3 top-3.5 text-gray-400" />
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                placeholder="John Doe"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('public_reservation.phone')}</label>
                        <div className="relative">
                            <FaPhone className="absolute left-3 top-3.5 text-gray-400" />
                            <input
                                type="tel"
                                required
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                placeholder="(555) 123-4567"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('public_reservation.date')}</label>
                            <div className="relative">
                                <FaCalendarAlt className="absolute left-3 top-3.5 text-gray-400" />
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full pl-10 pr-2 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('public_reservation.time')}</label>
                            <div className="relative">
                                <FaClock className="absolute left-3 top-3.5 text-gray-400" />
                                <input
                                    type="time"
                                    required
                                    value={formData.time}
                                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                                    className="w-full pl-10 pr-2 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('public_reservation.party_size')}</label>
                        <select
                            value={formData.size}
                            onChange={e => setFormData({ ...formData, size: parseInt(e.target.value) })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition bg-white"
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                <option key={n} value={n}>{n} {n === 1 ? t('public_reservation.person') : t('public_reservation.people')}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-indigo-700 hover:shadow-xl transition transform hover:-translate-y-0.5"
                    >
                        {t('public_reservation.confirm_booking')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PublicReservationForm;
