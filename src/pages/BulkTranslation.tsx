import React, { useState, useEffect } from 'react';
import axios from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import { FaLanguage, FaSave, FaQrcode, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { QRCodeItem } from '../types/dashboard_types';

interface TranslationData {
    qrCodeId: number;
    languageCode: string;
    title: string;
    description: string;
    content: string;
}

const BulkTranslation: React.FC = () => {
    const { t } = useTranslation('qr');
    const [qrCodes, setQrCodes] = useState<QRCodeItem[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [languageCode, setLanguageCode] = useState<string>('en');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'tr', name: 'Turkish' },
        { code: 'de', name: 'German' },
        { code: 'fr', name: 'French' },
        { code: 'es', name: 'Spanish' },
    ];

    useEffect(() => {
        fetchQrCodes();
    }, []);

    const fetchQrCodes = async () => {
        try {
            const res = await axios.get('/qrcodes');
            setQrCodes(res.data);
        } catch (err) {
            console.error('Failed to fetch QR codes', err);
            toast.error('Failed to load QR codes');
        } finally {
            setLoading(false);
        }
    };

    const toggleSelection = (id: number) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const handleBulkTranslate = async () => {
        if (selectedIds.size === 0) {
            toast.error('Please select at least one QR code');
            return;
        }

        setIsSubmitting(true);
        const translations: TranslationData[] = Array.from(selectedIds).map(id => {
            const qr = qrCodes.find(q => Number(q.id) === id);
            return {
                qrCodeId: id,
                languageCode,
                title: qr?.title || '',
                description: qr?.description || '',
                content: qr?.targetUrl || ''
            };
        });

        try {
            await axios.post('/qr/bulk-translate', translations);
            toast.success('Batch translations saved successfully!');
            setSelectedIds(new Set());
        } catch (err) {
            console.error('Batch translation failed', err);
            toast.error('Failed to save translations');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <FaLanguage className="text-indigo-600" />
                            Bulk Translations
                        </h1>
                        <p className="text-gray-500 mt-2">Translate multiple QR codes at once for your international audience.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* QR Selection Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <FaQrcode className="text-gray-400" /> Select QR Codes
                                </h3>
                                <button
                                    onClick={() => setSelectedIds(new Set(qrCodes.map(q => Number(q.id))))}
                                    className="text-xs text-indigo-600 font-bold hover:underline"
                                >
                                    Select All
                                </button>
                            </div>

                            {loading ? (
                                <div className="p-12 text-center text-gray-500">Loading your QR codes...</div>
                            ) : (
                                <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
                                    {qrCodes.map(qr => (
                                        <div
                                            key={qr.id}
                                            onClick={() => toggleSelection(Number(qr.id))}
                                            className={`p-4 flex items-center gap-4 cursor-pointer transition-colors ${selectedIds.has(Number(qr.id)) ? 'bg-indigo-50/50' : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedIds.has(Number(qr.id)) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-200'
                                                }`}>
                                                {selectedIds.has(Number(qr.id)) && <FaCheckCircle size={12} />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-800">{qr.title}</p>
                                                <p className="text-xs text-gray-500 truncate max-w-md">{qr.targetUrl || 'Static Content'}</p>
                                            </div>
                                            <div className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase transition-colors ${qr.dynamic ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {qr.dynamic ? 'Dynamic' : 'Static'}
                                            </div>
                                        </div>
                                    ))}
                                    {qrCodes.length === 0 && (
                                        <div className="p-12 text-center text-gray-500 italic">
                                            No QR codes found. Create some first!
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Translation Settings Area */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit sticky top-8">
                            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <FaLanguage className="text-gray-400" /> Target Language
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-2">Select Language</label>
                                    <select
                                        value={languageCode}
                                        onChange={(e) => setLanguageCode(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    >
                                        {languages.map(lang => (
                                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 space-y-2">
                                    <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
                                        <FaExclamationCircle /> Auto-Translation Preview
                                    </div>
                                    <p className="text-[11px] text-amber-700 leading-tight">
                                        This will replicate the current <b>Title</b>, <b>Description</b>, and <b>Content</b> to the target language entry. You can then edit them individually in the QR settings.
                                    </p>
                                </div>

                                <div className="pt-4">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-500">Selected Items:</span>
                                        <span className="font-bold text-indigo-600">{selectedIds.size}</span>
                                    </div>
                                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-600 transition-all duration-300"
                                            style={{ width: `${(selectedIds.size / Math.max(1, qrCodes.length)) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleBulkTranslate}
                                    disabled={selectedIds.size === 0 || isSubmitting}
                                    className={`w-full mt-6 py-3 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all ${selectedIds.size === 0 || isSubmitting
                                        ? 'bg-gray-300 cursor-not-allowed shadow-none'
                                        : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <FaSave /> Apply Translations
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default BulkTranslation;
