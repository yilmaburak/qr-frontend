import React, { useState, useEffect } from 'react';
import axios from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

interface QRCodeData {
    title: string;
    description: string;
    content: string;
}

interface Translation {
    id?: number;
    languageCode: string;
    title: string;
    description: string;
    content: string;
}

const EditQR: React.FC = () => {
    const { t } = useTranslation('qr');
    const { id } = useParams<{ id: string }>();
    const [qrData, setQRData] = useState<QRCodeData>({
        title: '',
        description: '',
        content: '',
    });
    const [translations, setTranslations] = useState<Translation[]>([]);
    const [newTranslation, setNewTranslation] = useState<Translation>({
        languageCode: 'en',
        title: '',
        description: '',
        content: '',
    });
    const [isEditingTranslation, setIsEditingTranslation] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'tr', name: 'Turkish' },
        { code: 'de', name: 'German' },
        { code: 'fr', name: 'French' },
        { code: 'es', name: 'Spanish' },
    ];

    const fetchQR = async () => {
        try {
            const res = await axios.get<any[]>('/qrcodes');
            const foundQR = res.data.find((qr) => qr.id === Number(id));
            if (foundQR) {
                setQRData({
                    title: foundQR.title,
                    description: foundQR.description || '',
                    content: foundQR.content,
                });
                fetchTranslations();
            } else {
                toast.error(t('edit.not_found'));
                navigate('/dashboard');
            }
        } catch (err) {
            console.error(err);
            toast.error(t('edit.load_error'));
        } finally {
            setLoading(false);
        }
    };

    const fetchTranslations = async () => {
        try {
            const res = await axios.get(`/qrcodes/${id}/translations`);
            setTranslations(res.data);
        } catch (err) {
            console.error('Failed to fetch translations', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.put(`/qrcodes/${id}`, qrData);
            toast.success(t('edit.success_update'));
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            toast.error(t('edit.update_error'));
        }
    };

    const handleSaveTranslation = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`/qrcodes/${id}/translations`, newTranslation);
            toast.success('Translation saved successfully');
            setNewTranslation({ languageCode: 'en', title: '', description: '', content: '' });
            setIsEditingTranslation(false);
            fetchTranslations();
        } catch (err) {
            console.error('Failed to save translation', err);
            toast.error('Failed to save translation');
        }
    };

    const handleDeleteTranslation = async (langCode: string) => {
        if (!window.confirm('Are you sure you want to delete this translation?')) return;
        try {
            await axios.delete(`/qrcodes/${id}/translations/${langCode}`);
            toast.success('Translation deleted');
            fetchTranslations();
        } catch (err) {
            console.error('Failed to delete translation', err);
            toast.error('Failed to delete translation');
        }
    };

    useEffect(() => {
        if (id) fetchQR();
    }, [id]);

    if (loading) return <DashboardLayout><div className="p-8 text-center">Loading...</div></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">{t('edit.title')}</h1>
                    <button onClick={() => navigate('/qr/dashboard')} className="text-sm text-gray-500 hover:text-indigo-600 font-medium transition-colors">
                        &larr; Back to Dashboard
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Main Details */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <span className="w-2 h-6 bg-indigo-600 rounded-full"></span>
                            Main Content (Default)
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Title</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    value={qrData.title}
                                    onChange={(e) => setQRData({ ...qrData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Description</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    value={qrData.description}
                                    onChange={(e) => setQRData({ ...qrData, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Target URL / Content</label>
                                <textarea
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-32"
                                    value={qrData.content}
                                    onChange={(e) => setQRData({ ...qrData, content: e.target.value })}
                                    required
                                ></textarea>
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95">
                                {t('edit.update_button')}
                            </button>
                        </form>
                    </div>

                    {/* Translations */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <span className="w-2 h-6 bg-purple-600 rounded-full"></span>
                                    Translations
                                </h2>
                                {!isEditingTranslation && (
                                    <button
                                        onClick={() => {
                                            setIsEditingTranslation(true);
                                            setNewTranslation({ languageCode: 'en', title: qrData.title, description: qrData.description, content: qrData.content });
                                        }}
                                        className="text-xs font-bold text-indigo-600 hover:underline"
                                    >
                                        + Add New
                                    </button>
                                )}
                            </div>

                            {isEditingTranslation ? (
                                <form onSubmit={handleSaveTranslation} className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-bold text-gray-700">Add/Edit Translation</h3>
                                        <button type="button" onClick={() => setIsEditingTranslation(false)} className="text-xs text-red-500 font-bold hover:underline">Cancel</button>
                                    </div>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                                        value={newTranslation.languageCode}
                                        onChange={(e) => setNewTranslation({ ...newTranslation, languageCode: e.target.value })}
                                    >
                                        {languages.map(lang => (
                                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="Translated Title"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                        value={newTranslation.title}
                                        onChange={(e) => setNewTranslation({ ...newTranslation, title: e.target.value })}
                                        required
                                    />
                                    <textarea
                                        placeholder="Translated Content"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm h-20"
                                        value={newTranslation.content}
                                        onChange={(e) => setNewTranslation({ ...newTranslation, content: e.target.value })}
                                        required
                                    ></textarea>
                                    <button type="submit" className="w-full bg-purple-600 text-white font-bold py-2 rounded-lg text-sm shadow-md hover:bg-purple-700">
                                        Save Translation
                                    </button>
                                </form>
                            ) : (
                                <div className="space-y-3">
                                    {translations.map(tr => (
                                        <div key={tr.id} className="group p-3 border border-gray-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold uppercase bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">{tr.languageCode}</span>
                                                    <span className="font-semibold text-gray-800 text-sm">{tr.title}</span>
                                                </div>
                                                <p className="text-[11px] text-gray-500 mt-0.5 truncate max-w-[200px]">{tr.content}</p>
                                            </div>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setNewTranslation(tr);
                                                        setIsEditingTranslation(true);
                                                    }}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTranslation(tr.languageCode)}
                                                    className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {translations.length === 0 && (
                                        <div className="text-center py-6 text-gray-400 text-sm italic">
                                            No translations added yet.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default EditQR;
