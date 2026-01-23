import React, { useEffect, useState } from 'react';
import {
    FaChartLine,
    FaShoppingBag,
    FaDollarSign,
    FaCalendarAlt,
    FaFileInvoiceDollar,
    FaUtensils
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    BarChart,
    Bar
} from 'recharts';
import { format, subDays, startOfMonth } from 'date-fns';
import { useTranslation } from 'react-i18next';

import analyticsService from '../services/analyticsService';
import {
    AnalyticsSummary,
    RevenueData,
    PopularItemData,
    FinancialReport
} from '../types/restaurant';
import SkeletonLoader from '../components/common/SkeletonLoader';

// --- Components ---

const StatsCard = ({ title, value, icon, color, subValue }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 transition hover:shadow-md">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
            {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
        </div>
    </div>
);

const RestaurantAnalytics: React.FC = () => {
    const { t } = useTranslation('restaurant');
    const [activeTab, setActiveTab] = useState<'overview' | 'financials'>('overview');

    // --- Overview State ---
    const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
    const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
    const [popularItems, setPopularItems] = useState<PopularItemData[]>([]);
    const [loadingOverview, setLoadingOverview] = useState<boolean>(true);

    // --- Financials State ---
    const [financialReport, setFinancialReport] = useState<FinancialReport | null>(null);
    const [startDate, setStartDate] = useState<string>(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
    const [loadingFinancials, setLoadingFinancials] = useState<boolean>(false);

    // Initial Fetch (Overview)
    useEffect(() => {
        fetchOverviewData();
    }, []);

    // Fetch Financials when tab changes or dates change
    useEffect(() => {
        if (activeTab === 'financials') {
            fetchFinancialReport();
        }
    }, [activeTab, startDate, endDate]);

    const fetchOverviewData = async () => {
        try {
            setLoadingOverview(true);
            const [summaryRes, revenueRes, itemsRes] = await Promise.all([
                analyticsService.getSummary(),
                analyticsService.getRevenueChart(),
                analyticsService.getPopularItemsChart()
            ]);
            setSummary(summaryRes);
            setRevenueData(revenueRes);
            setPopularItems(itemsRes);
        } catch (error) {
            console.error('Failed to load overview', error);
            // toast.error('Failed to load overview data'); // Suppress initial load error if backend empty
        } finally {
            setLoadingOverview(false);
        }
    };

    const fetchFinancialReport = async () => {
        try {
            setLoadingFinancials(true);
            const data = await analyticsService.getFinancialReport(startDate, endDate);
            setFinancialReport(data);
        } catch (error) {
            console.error('Failed to load financial report', error);
            toast.error('Failed to load financial report');
        } finally {
            setLoadingFinancials(false);
        }
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{t('analytics_report.title')}</h1>
                    <p className="text-gray-500 mt-1">{t('analytics_report.subtitle')}</p>
                </div>

                {/* Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'overview'
                            ? 'bg-white text-orange-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {t('analytics_report.overview')}
                    </button>
                    <button
                        onClick={() => setActiveTab('financials')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'financials'
                            ? 'bg-white text-orange-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {t('analytics_report.financials')}
                    </button>
                </div>
            </div>

            {/* --- OVERVIEW TAB --- */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {loadingOverview ? (
                        <SkeletonLoader />
                    ) : (
                        <>
                            {/* Key Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatsCard
                                    title={t('analytics.total_revenue')}
                                    value={formatCurrency(summary?.totalRevenue || 0)}
                                    icon={<FaDollarSign />}
                                    color="bg-green-100 text-green-600"
                                />
                                <StatsCard
                                    title={t('analytics.total_orders')}
                                    value={summary?.totalOrders || 0}
                                    icon={<FaShoppingBag />}
                                    color="bg-blue-100 text-blue-600"
                                />
                                {/* Add more cards if available */}
                            </div>

                            {/* Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Revenue Chart */}
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <FaChartLine className="text-orange-500" />
                                        {t('analytics_report.revenue_trend')}
                                    </h3>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={revenueData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                                <XAxis dataKey="date" stroke="#888" fontSize={12} />
                                                <YAxis stroke="#888" fontSize={12} tickFormatter={(val) => `$${val}`} />
                                                <Tooltip
                                                    formatter={(value: number) => [formatCurrency(value), t('analytics_report.revenue_label')]}
                                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="revenue"
                                                    stroke="#f97316"
                                                    strokeWidth={3}
                                                    dot={{ r: 4, fill: '#f97316' }}
                                                    activeDot={{ r: 6 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Popular Items */}
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <FaUtensils className="text-orange-500" />
                                        {t('analytics_report.popular_items')}
                                    </h3>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={popularItems} layout="vertical">
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                                                <XAxis type="number" hide />
                                                <YAxis dataKey="name" type="category" width={100} fontSize={12} stroke="#666" />
                                                <Tooltip
                                                    formatter={(value: number) => [value, t('analytics_report.orders_label')]}
                                                    cursor={{ fill: 'transparent' }}
                                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                />
                                                <Bar dataKey="value" fill="#f97316" radius={[0, 4, 4, 0]} barSize={20} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* --- FINANCIALS TAB --- */}
            {activeTab === 'financials' && (
                <div className="space-y-6">
                    {/* Filters */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <FaCalendarAlt className="text-gray-400" />
                            <span className="text-sm font-medium text-gray-600">{t('analytics_report.period')}:</span>
                        </div>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                        <span className="text-gray-400">-</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                        <button
                            onClick={fetchFinancialReport}
                            className="ml-auto bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition"
                        >
                            {t('analytics_report.refresh')}
                        </button>
                    </div>

                    {loadingFinancials ? (
                        <div className="py-20 text-center">
                            <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-gray-500">{t('analytics_report.generating')}</p>
                        </div>
                    ) : financialReport ? (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatsCard
                                    title={t('analytics_report.period_revenue')}
                                    value={formatCurrency(financialReport.totalRevenue || 0)}
                                    icon={<FaFileInvoiceDollar />}
                                    color="bg-purple-100 text-purple-600"
                                    subValue={t('analytics_report.paid_orders_note')}
                                />
                                <StatsCard
                                    title={t('analytics_report.orders_count')}
                                    value={financialReport.totalOrders || 0}
                                    icon={<FaShoppingBag />}
                                    color="bg-blue-100 text-blue-600"
                                />
                                <StatsCard
                                    title={t('analytics_report.avg_order_value')}
                                    value={formatCurrency(financialReport.averageOrderValue || 0)}
                                    icon={<FaChartLine />}
                                    color="bg-green-100 text-green-600"
                                />
                            </div>

                            {/* Detailed Chart */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <FaChartLine className="text-orange-500" />
                                    {t('analytics_report.revenue_timeline')} ({format(new Date(startDate), 'MMM d')} - {format(new Date(endDate), 'MMM d')})
                                </h3>
                                <div className="h-96">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={financialReport.timeline}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                            <XAxis
                                                dataKey="date"
                                                tickFormatter={(val) => format(new Date(val), 'MMM d')}
                                                stroke="#888"
                                                fontSize={12}
                                            />
                                            <YAxis
                                                stroke="#888"
                                                fontSize={12}
                                                tickFormatter={(val) => `$${val}`}
                                            />
                                            <Tooltip
                                                labelFormatter={(val) => format(new Date(val), 'MMM d, yyyy')}
                                                formatter={(value: number) => [formatCurrency(value), t('analytics_report.revenue_label')]}
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            />
                                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                            <Line
                                                type="monotone"
                                                dataKey="revenue"
                                                name={t('analytics_report.revenue_label')}
                                                stroke="#f97316"
                                                strokeWidth={3}
                                                activeDot={{ r: 8 }}
                                                dot={false}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="ordersCount"
                                                name={t('analytics_report.orders_label')}
                                                stroke="#3b82f6"
                                                strokeWidth={2}
                                                dot={false}
                                                yAxisId={1} // Map to second Y axis if needed, currently reusing YAxis 0, might look small.
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
                            <p className="text-gray-400">{t('analytics_report.select_date')}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RestaurantAnalytics;
