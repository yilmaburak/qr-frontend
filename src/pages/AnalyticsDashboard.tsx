import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { FaArrowLeft, FaChartLine, FaGlobe, FaMobileAlt, FaChrome } from 'react-icons/fa';
import type { AnalyticsData } from '../types/dashboard_types';
import { useTranslation } from 'react-i18next';
import UpgradeModal from '../components/UpgradeModal';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AnalyticsDashboard: React.FC = () => {
    const { t } = useTranslation('dashboard');
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(0);
    const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);

    useEffect(() => {
        if (id) fetchAnalytics(page);
    }, [id, page]);

    const fetchAnalytics = async (pageNumber: number) => {
        try {
            const res = await axios.get(`/analytics/${id}?page=${pageNumber}`);
            setData(res.data);
        } catch (err: any) {
            console.error(err);
            if (err.response?.status === 403) {
                setShowUpgradeModal(true);
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <DashboardLayout><div className="p-8 text-center">{t('analytics_page.loading')}</div></DashboardLayout>;
    if (!data) return <DashboardLayout><div className="p-8 text-center">{t('analytics_page.no_data')}</div></DashboardLayout>;

    // Transform Data for Recharts
    const timelineData = Object.entries(data.scansByDay || {}).map(([date, count]) => ({ date, count }));
    const deviceData = Object.entries(data.topDevices || {}).map(([name, count]) => ({ name, value: count }));
    const browserData = Object.entries(data.topBrowsers || {}).map(([name, count]) => ({ name, value: count }));
    // const osData = Object.entries(data.topOS || {}).map(([name, count]) => ({ name, value: count })); // Unused

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <FaArrowLeft className="text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{t('analytics_page.title')}</h1>
                            <p className="text-gray-500 text-sm">{t('analytics_page.subtitle')}</p>
                        </div>
                    </div>
                    <button onClick={fetchAnalytics} className="text-blue-600 text-sm font-medium hover:underline">{t('analytics.refresh')}</button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard title={t('analytics_page.total_scans')} value={data.totalScans} icon={<FaChartLine />} color="bg-blue-50 text-blue-600" />
                    <StatsCard title={t('analytics_page.unique_visitors')} value={data.uniqueVisitors} icon={<FaGlobe />} color="bg-green-50 text-green-600" />
                    <StatsCard title={t('analytics_page.top_device')} value={deviceData[0]?.name || '-'} icon={<FaMobileAlt />} color="bg-purple-50 text-purple-600" />
                    <StatsCard title={t('analytics_page.top_browser')} value={browserData[0]?.name || '-'} icon={<FaChrome />} color="bg-orange-50 text-orange-600" />
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Timeline Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
                        <h3 className="text-lg font-semibold mb-6">{t('analytics_page.scan_activity')}</h3>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={timelineData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="date" stroke="#9CA3AF" tickLine={false} axisLine={false} dy={10} />
                                    <YAxis stroke="#9CA3AF" tickLine={false} axisLine={false} dx={-10} />
                                    <Tooltip contentStyle={{ border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Line type="monotone" dataKey="count" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4, fill: '#4F46E5', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Device Distribution */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold mb-6">{t('analytics_page.device_type')}</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={deviceData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {deviceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Browser Distribution */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold mb-6">{t('analytics_page.browser')}</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={browserData} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={80} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{ fill: '#F3F4F6' }} />
                                    <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]}>
                                        {browserData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>

                {/* Scan Logs Table */}
                <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">{t('analytics_page.recent_scans')}</h3>
                        {data.scans && (
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                                Total: {data.scans.totalElements}
                            </span>
                        )}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase transition-colors">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">{t('analytics_page.date')}</th>
                                    <th className="px-6 py-4 font-semibold">{t('analytics_page.device')}</th>
                                    <th className="px-6 py-4 font-semibold">{t('analytics_page.location')}</th>
                                    <th className="px-6 py-4 font-semibold">{t('analytics_page.browser')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data.scans?.content.map((scan) => (
                                    <tr key={scan.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(scan.scannedAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase">
                                                {scan.device || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {scan.location || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {scan.location ? 'N/A' : 'Direct'}
                                        </td>
                                    </tr>
                                ))}
                                {(!data.scans || data.scans.content.length === 0) && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                                            No recent scans found for this period
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {data.scans && data.scans.totalPages > 1 && (
                        <div className="p-6 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
                            <button
                                onClick={() => setPage(prev => Math.max(0, prev - 1))}
                                disabled={page === 0}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                Previous
                            </button>
                            <div className="flex items-center gap-2">
                                {[...Array(data.scans.totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPage(i)}
                                        className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${page === i ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-gray-400 hover:bg-gray-200 hover:text-gray-600'}`}
                                    >
                                        {i + 1}
                                    </button>
                                )).slice(Math.max(0, page - 2), Math.min(data.scans.totalPages, page + 3))}
                            </div>
                            <button
                                onClick={() => setPage(prev => Math.min(data.scans!.totalPages - 1, prev + 1))}
                                disabled={page === data.scans.totalPages - 1}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => {
                    setShowUpgradeModal(false);
                    setPage(0); // Reset to first page if they cancel upgrade
                }}
                featureName="Extended Analytics History"
            />
        </DashboardLayout>
    );
}

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
}

function StatsCard({ title, value, icon, color }: StatsCardProps) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    )
}

export default AnalyticsDashboard;
