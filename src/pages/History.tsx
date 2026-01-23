import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History as HistoryIcon, ArrowUpRight, Search, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const History = () => {
    const { t } = useTranslation('dashboard');
    const [scans, setScans] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        // Simulate API fetch
        setTimeout(() => {
            setScans([
                { id: 1, qrName: 'My Website', location: 'New York, US', device: 'iPhone', timestamp: '2023-11-20 14:30:00' },
                { id: 2, qrName: 'WiFi Guest', location: 'London, UK', device: 'Android', timestamp: '2023-11-19 09:15:00' },
                { id: 3, qrName: 'My Website', location: 'Berlin, DE', device: 'Chrome Desktop', timestamp: '2023-11-18 18:45:00' },
            ]);
            setIsLoading(false);
        }, 500);
    }, []);

    return (
        <div className="p-8 text-white">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                    <HistoryIcon className="text-blue-400" />
                    {t('history.title')}
                </h1>
                <p className="text-gray-400">{t('history.subtitle')}</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder={t('history.search_placeholder')}
                            className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                        <Filter size={18} />
                        {t('history.filter')}
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                        {t('history.export_csv')}
                    </button>
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                            <th className="p-4 font-semibold text-gray-300">QR Name</th>
                            <th className="p-4 font-semibold text-gray-300">Location</th>
                            <th className="p-4 font-semibold text-gray-300">Device</th>
                            <th className="p-4 font-semibold text-gray-300">Time</th>
                            <th className="p-4 font-semibold text-gray-300">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-400">{t('history.loading')}</td></tr>
                        ) : scans.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-400">{t('history.no_scans')}</td></tr>
                        ) : (
                            scans.map(scan => (
                                <tr key={scan.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="p-4">{scan.qrName}</td>
                                    <td className="p-4">{scan.location}</td>
                                    <td className="p-4">{scan.device}</td>
                                    <td className="p-4 text-gray-400 text-sm">{scan.timestamp}</td>
                                    <td className="p-4">
                                        <button className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm">
                                            View <ArrowUpRight size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default History;
