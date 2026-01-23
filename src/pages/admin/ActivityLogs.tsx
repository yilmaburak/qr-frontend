import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { format } from 'date-fns';
import type { ActivityLog, PaginatedResponse } from '../../types/admin';
import { useTranslation } from 'react-i18next';

const ActivityLogs: React.FC = () => {
    const { t } = useTranslation('admin');
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);

    useEffect(() => {
        fetchLogs();
    }, [page]);

    const fetchLogs = async () => {
        try {
            const response = await api.get<PaginatedResponse<ActivityLog>>(`/admin/activity-logs?page=${page}&size=20`);
            setLogs(response.data.content);
            setTotalPages(response.data.totalPages);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch activity logs:', error);
            setLoading(false);
        }
    };

    const getActionBadgeColor = (action: string) => {
        if (action.includes('DELETE')) return 'bg-red-100 text-red-800';
        if (action.includes('SUSPEND')) return 'bg-yellow-100 text-yellow-800';
        if (action.includes('ACTIVATE')) return 'bg-green-100 text-green-800';
        if (action.includes('CREATE')) return 'bg-blue-100 text-blue-800';
        return 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">{t('common.loading')}</div>;
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">{t('logs.activity.title')}</h1>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('logs.activity.table.time')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('logs.activity.table.user_id')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('logs.activity.table.action')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('logs.activity.table.entity')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('logs.activity.table.details')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('logs.activity.table.ip_address')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {log.createdAt ? format(new Date(log.createdAt), 'MMM dd, HH:mm:ss') : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.userId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getActionBadgeColor(log.action)}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {log.entityType} #{log.entityId}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">{log.details}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.ipAddress}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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

export default ActivityLogs;
