import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { FaEdit } from 'react-icons/fa';

interface Restaurant {
    id: number;
    restaurantName: string;
    address: string;
    ownerId: number;
    ownerEmail: string;
    createdAt: string;
}

interface PaginatedResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

const Restaurants: React.FC = () => {
    const { t } = useTranslation('admin');
    const navigate = useNavigate();
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);

    useEffect(() => {
        fetchRestaurants();
    }, [page]);

    const fetchRestaurants = async () => {
        try {
            const response = await api.get<PaginatedResponse<Restaurant>>(`/admin/restaurants?page=${page}&size=10`);
            setRestaurants(response.data.content);
            setTotalPages(response.data.totalPages);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch restaurants:', error);
            toast.error(t('restaurants.fetch_error'));
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">{t('common.loading')}</div>;
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">{t('restaurants.title')}</h1>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('restaurants.table.id')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('restaurants.table.name')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('restaurants.table.address')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('restaurants.table.owner_email')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('restaurants.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {restaurants.map((restaurant) => (
                            <tr
                                key={restaurant.id}
                                className="hover:bg-gray-50 cursor-pointer"
                                onClick={() => navigate(`/admin/restaurants/${restaurant.id}`)}
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{restaurant.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{restaurant.restaurantName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">{restaurant.address}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{restaurant.ownerEmail}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/admin/restaurants/${restaurant.id}`);
                                        }}
                                        className="text-blue-600 hover:text-blue-900"
                                        title={t('restaurants.edit_restaurant')}
                                    >
                                        <FaEdit />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-6 space-x-2">
                <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 0}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                >
                    {t('common.previous')}
                </button>
                <span className="px-4 py-2">
                    {t('common.page_info', { current: page + 1, total: totalPages })}
                </span>
                <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages - 1}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                >
                    {t('common.next')}
                </button>
            </div>
        </div>
    );
};

export default Restaurants;
