import React, { useState, useEffect } from 'react';
import { FaFilter, FaDownload, FaEye, FaSearch } from 'react-icons/fa';
import { format } from 'date-fns';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

interface AuditLog {
    id: number;
    username: string;
    action: string;
    entityType: string;
    entityId: number | null;
    ipAddress: string;
    userAgent: string;
    details: string;
    status: 'SUCCESS' | 'FAILED' | 'UNAUTHORIZED';
    timestamp: string;
}

interface FilterState {
    username: string;
    action: string;
    entityType: string;
    status: string;
    startDate: string;
    endDate: string;
}

const AdminAuditLogs: React.FC = () => {
    const { t } = useTranslation('admin');
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [filters, setFilters] = useState<FilterState>({
        username: '',
        action: '',
        entityType: '',
        status: '',
        startDate: '',
        endDate: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [actions, setActions] = useState<string[]>([]);
    const [entityTypes, setEntityTypes] = useState<string[]>([]);

    useEffect(() => {
        fetchAuditLogs();
        fetchFilterOptions();
    }, [page, filters]);

    const fetchAuditLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                size: '50',
                ...Object.entries(filters).reduce((acc, [key, value]) => {
                    if (value) acc[key] = value;
                    return acc;
                }, {} as Record<string, string>)
            });

            const response = await api.get(`/admin/audit-logs?${params}`);
            setLogs(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (error: any) {
            toast.error(t('logs.audit.alerts.fetch_error') + error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchFilterOptions = async () => {
        try {
            const [actionsRes, typesRes] = await Promise.all([
                api.get('/admin/audit-logs/actions'),
                api.get('/admin/audit-logs/entity-types')
            ]);
            setActions(actionsRes.data);
            setEntityTypes(typesRes.data);
        } catch (error) {
            console.error('Failed to fetch filter options', error);
        }
    };

    const handleFilterChange = (key: keyof FilterState, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(0);
    };

    const clearFilters = () => {
        setFilters({
            username: '',
            action: '',
            entityType: '',
            status: '',
            startDate: '',
            endDate: ''
        });
        setPage(0);
    };

    const exportToCSV = () => {
        const headers = ['Timestamp', 'Username', 'Action', 'Entity Type', 'Entity ID', 'Status', 'IP Address'];
        const csv = [
            headers.join(','),
            ...logs.map(log => [
                format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
                log.username,
                log.action,
                log.entityType || '',
                log.entityId || '',
                log.status,
                log.ipAddress
            ].join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SUCCESS': return 'bg-green-100 text-green-800';
            case 'FAILED': return 'bg-red-100 text-red-800';
            case 'UNAUTHORIZED': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{t('logs.audit.title')}</h1>
                    <p className="text-gray-600 mt-1">{t('logs.audit.subtitle')}</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                        <FaFilter />
                        {t('logs.audit.filters_btn')}
                    </button>
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <FaDownload />
                        {t('logs.audit.export_csv')}
                    </button>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-6 grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('logs.audit.filters.username')}</label>
                        <input
                            type="text"
                            value={filters.username}
                            onChange={(e) => handleFilterChange('username', e.target.value)}
                            placeholder={t('logs.audit.filters.username_placeholder')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('logs.audit.filters.action')}</label>
                        <select
                            value={filters.action}
                            onChange={(e) => handleFilterChange('action', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">{t('logs.audit.filters.all_actions')}</option>
                            {actions.map(action => (
                                <option key={action} value={action}>{action}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('logs.audit.filters.entity_type')}</label>
                        <select
                            value={filters.entityType}
                            onChange={(e) => handleFilterChange('entityType', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">{t('logs.audit.filters.all_types')}</option>
                            {entityTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('logs.audit.filters.status')}</label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">{t('logs.audit.filters.all_statuses')}</option>
                            <option value="SUCCESS">Success</option>
                            <option value="FAILED">Failed</option>
                            <option value="UNAUTHORIZED">Unauthorized</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('logs.audit.filters.start_date')}</label>
                        <input
                            type="datetime-local"
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('logs.audit.filters.end_date')}</label>
                        <input
                            type="datetime-local"
                            value={filters.endDate}
                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="col-span-3 flex justify-end">
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition"
                        >
                            {t('logs.audit.clear_filters')}
                        </button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('logs.audit.table.timestamp')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('logs.audit.table.user')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('logs.audit.table.action')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('logs.audit.table.entity')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('logs.audit.table.status')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('logs.audit.table.ip')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('logs.audit.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                    {t('logs.audit.loading')}
                                </td>
                            </tr>
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                    {t('logs.audit.no_logs')}
                                </td>
                            </tr>
                        ) : (
                            logs.map(log => (
                                <tr key={log.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {log.username}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {log.action.replace(/_/g, ' ')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {log.entityType || '-'}
                                        {log.entityId && <span className="text-gray-500"> #{log.entityId}</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(log.status)}`}>
                                            {log.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {log.ipAddress}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <button
                                            onClick={() => setSelectedLog(log)}
                                            className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                                        >
                                            <FaEye /> {t('logs.audit.view_details')}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Page {page + 1} of {totalPages}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(prev => Math.max(0, prev - 1))}
                                disabled={page === 0}
                                className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {t('common.previous')}
                            </button>
                            <button
                                onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
                                disabled={page >= totalPages - 1}
                                className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {t('common.next')}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedLog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-2xl font-bold">{t('logs.audit.modal.title')}</h2>
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">ID</label>
                                <p className="text-gray-900">{selectedLog.id}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">{t('logs.audit.table.timestamp')}</label>
                                <p className="text-gray-900">{format(new Date(selectedLog.timestamp), 'PPpp')}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">{t('users.table.username')}</label>
                                <p className="text-gray-900">{selectedLog.username}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">{t('logs.audit.table.action')}</label>
                                <p className="text-gray-900 font-mono">{selectedLog.action}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">{t('logs.audit.table.entity')}</label>
                                <p className="text-gray-900">{selectedLog.entityType || 'N/A'} {selectedLog.entityId && `#${selectedLog.entityId}`}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">{t('logs.audit.table.status')}</label>
                                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedLog.status)}`}>
                                    {selectedLog.status}
                                </span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">{t('logs.audit.table.ip')}</label>
                                <p className="text-gray-900">{selectedLog.ipAddress}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">{t('logs.audit.modal.user_agent')}</label>
                                <p className="text-gray-900 text-sm break-all">{selectedLog.userAgent}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-2">{t('logs.audit.modal.details_json')}</label>
                                <pre className="bg-gray-50 p-4 rounded border border-gray-200 text-xs overflow-x-auto">
                                    {(() => {
                                        try {
                                            return JSON.stringify(JSON.parse(selectedLog.details || '{}'), null, 2);
                                        } catch (e) {
                                            return selectedLog.details;
                                        }
                                    })()}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAuditLogs;
