import React, { useEffect, useState } from 'react';
import axios from '../../services/api'; // Adjust path if needed
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { FaChartLine, FaUsers, Faglobe, FaMobile, FaDesktop } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

interface AnalyticsData {
    totalScans: number;
    uniqueVisitors: number;
    topDevices: { [key: string]: number };
    topBrowsers: { [key: string]: number };
    topOS: { [key: string]: number };
    topLocations: { [key: string]: number };
    scansByDay: { [key: string]: number };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const GlobalAnalytics: React.FC = () => {
    const { t } = useTranslation('qr');
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await axios.get('/analytics/overview');
            setData(res.data);
        } catch (error) {
            console.error('Failed to load analytics', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-white">Loading Analytics...</div>;

    if (!data) return <div className="p-8 text-center text-white">No data available</div>;

    // Transform Data for Charts
    const deviceData = Object.entries(data.topDevices || {}).map(([name, value]) => ({ name, value }));
    const browserData = Object.entries(data.topBrowsers || {}).map(([name, value]) => ({ name, value }));
    const osData = Object.entries(data.topOS || {}).map(([name, value]) => ({ name, value }));
    const locationData = Object.entries(data.topLocations || {}).map(([name, value]) => ({ name, value }));
    const dailyData = Object.entries(data.scansByDay || {})
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-white mb-2">Analytics Overview</h1>
            <p className="text-gray-400 mb-8">Aggregate performance of all your QR codes.</p>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white/10 p-6 rounded-xl border border-white/5 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/20 rounded-lg text-blue-500">
                            <FaChartLine size={24} />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Total Scans</p>
                            <h3 className="text-2xl font-bold text-white">{data.totalScans}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white/10 p-6 rounded-xl border border-white/5 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/20 rounded-lg text-green-500">
                            <FaUsers size={24} />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Unique Visitors</p>
                            <h3 className="text-2xl font-bold text-white">{data.uniqueVisitors}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Scans Over Time */}
                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-6">Scans Over Time</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dailyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                <XAxis dataKey="date" stroke="#888" />
                                <YAxis stroke="#888" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Device Distribution */}
                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-6">Device Distribution</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={deviceData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {deviceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Locations */}
                <div className="bg-white/5 p-6 rounded-xl border border-white/10 col-span-full lg:col-span-1">
                    <h3 className="text-xl font-bold text-white mb-6">Top Locations</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={locationData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#444" horizontal={false} />
                                <XAxis type="number" stroke="#888" />
                                <YAxis dataKey="name" type="category" stroke="#888" width={100} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="value" fill="#82ca9d" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Browser Distribution */}
                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-6">Top Browsers</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={browserData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#444" horizontal={false} />
                                <XAxis type="number" stroke="#888" />
                                <YAxis dataKey="name" type="category" stroke="#888" width={100} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="value" fill="#00C49F" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* OS Distribution */}
                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-6">Operating Systems</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={osData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {osData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlobalAnalytics;
