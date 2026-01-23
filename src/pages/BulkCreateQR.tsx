import React, { useState, useRef } from 'react';
import axios from '../services/api';
import { getCurrentUser } from '../services/auth';
import DashboardLayout from '../components/DashboardLayout';
import menuService from '../services/menuService'; // Import menuService
import { FaCloudUploadAlt, FaFileCsv, FaDownload, FaCog } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

interface BulkSettings {
    foregroundColor: string;
    backgroundColor: string;
    style: string;
    isDynamic: boolean;
    title: string;
    animationType?: string;
    password?: string;
    menuId?: number | null;
}

interface Menu {
    id: number;
    name: string;
}

const BulkCreateQR: React.FC = () => {
    const { t } = useTranslation('qr');
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [menus, setMenus] = useState<Menu[]>([]);

    // Settings (Simplified version for Batch)
    const [settings, setSettings] = useState<BulkSettings>({
        foregroundColor: '#000000',
        backgroundColor: '#ffffff',
        style: 'square',
        isDynamic: true, // Default to Dynamic for tracking
        title: 'Bulk Batch',
        menuId: null,
    });

    const user: any = getCurrentUser(); // subscriptionTier logic needs user type update
    const isPro = user?.subscriptionTier?.includes('PRO');

    React.useEffect(() => {
        if (user) {
            menuService.getMenus(user.id).then(data => setMenus(data)).catch(console.error);
        }
    }, []);

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type === 'text/csv') {
            setFile(droppedFile);
        } else {
            toast.error('Please upload a CSV file.');
        }
    };

    const handleGenerate = async () => {
        if (!file) {
            toast.error('Please upload a CSV file.');
            return;
        }
        if (!isPro) {
            toast.error('Pro subscription required for Bulk QR.');
            return;
        }

        setIsGenerating(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('settings', JSON.stringify({
            ...settings,
            // Add defaults for complex fields ignored in bulk
            animationType: 'NONE',
            password: '',
        }));

        try {
            const response = await axios.post('/bulk/generate', formData, {
                responseType: 'blob', // Important for ZIP download
            });

            // Create Download Link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'bulk_qrcodes.zip');
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success('Bulk Generation Complete! Downloading...');
            setFile(null); // Reset
        } catch (err) {
            console.error(err);
            toast.error('Failed to generate. Limit may be exceeded (Max 50).');
        } finally {
            setIsGenerating(false);
        }
    };

    const downloadSample = () => {
        const csvContent = "data:text/csv;charset=utf-8,Content,Title,Description\nhttps://google.com,Google,Search Engine\nhttps://example.com,Example,My Website";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'sample_bulk_qr.csv');
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{t('bulk_create.title')}</h1>
                        <p className="text-gray-600 mt-1">{t('bulk_create.subtitle')}</p>
                    </div>
                    {!isPro && (
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold border border-purple-200">
                            {t('bulk_create.pro_feature')}
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT: Upload Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <div
                            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-colors ${isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-300 bg-gray-50'
                                }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                                <FaCloudUploadAlt className="text-4xl text-purple-600" />
                            </div>

                            {file ? (
                                <div className="text-center">
                                    <p className="font-semibold text-gray-800">{file.name}</p>
                                    <p className="text-sm text-gray-500 mb-4">{(file.size / 1024).toFixed(2)} KB</p>
                                    <button onClick={() => setFile(null)} className="text-red-500 text-sm hover:underline">Remove</button>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <p className="font-medium text-gray-700">{t('bulk_create.drag_drop')}</p>
                                    <p className="text-sm text-gray-400 my-2">or</p>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                                    >
                                        {t('bulk_create.browse_files')}
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept=".csv"
                                        onChange={(e) => e.target.files && setFile(e.target.files[0])}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <FaFileCsv className="text-blue-500 text-xl" />
                                <div>
                                    <p className="text-sm font-semibold text-blue-800">Need a template?</p>
                                    <p className="text-xs text-blue-600">Download our sample CSV file to get started.</p>
                                </div>
                            </div>
                            <button onClick={downloadSample} className="flex items-center gap-2 text-sm text-blue-700 font-medium hover:underline">
                                <FaDownload /> Download Sample
                            </button>
                        </div>
                    </div>

                    {/* RIGHT: Settings */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FaCog className="text-gray-500" /> Batch Settings
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Foreground Color</label>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded border" style={{ backgroundColor: settings.foregroundColor }}></div>
                                    <input
                                        type="color"
                                        value={settings.foregroundColor}
                                        onChange={(e) => setSettings({ ...settings, foregroundColor: e.target.value })}
                                        className="flex-1"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Style</label>
                                <select
                                    value={settings.style}
                                    onChange={(e) => setSettings({ ...settings, style: e.target.value })}
                                    className="w-full text-sm border-gray-300 rounded-lg p-2"
                                >
                                    <option value="square">Square</option>
                                    <option value="dots">Dots</option>
                                    <option value="rounded">Rounded</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    checked={settings.isDynamic}
                                    onChange={(e) => setSettings({ ...settings, isDynamic: e.target.checked })}
                                    id="dynamicCheck"
                                    className="rounded text-purple-600 focus:ring-purple-500"
                                />
                                <label htmlFor="dynamicCheck" className="text-sm text-gray-700">Dynamic QRs (Trackable)</label>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Bind Menu (Optional)</label>
                                <select
                                    value={settings.menuId || ''}
                                    onChange={(e) => setSettings({ ...settings, menuId: e.target.value ? Number(e.target.value) : null })}
                                    className="w-full text-sm border-gray-300 rounded-lg p-2"
                                >
                                    <option value="">-- No Menu --</option>
                                    {menus.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-gray-400 mt-1">Associates all QRs in this batch with the selected menu.</p>
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={!file || isGenerating || !isPro}
                            className={`w-full mt-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${!file || isGenerating || !isPro
                                ? 'bg-gray-300 cursor-not-allowed shadow-none'
                                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-purple-500/25 active:scale-95'
                                }`}
                        >
                            {isGenerating ? t('bulk_create.processing') : t('bulk_create.generate_button')}
                        </button>

                        {!isPro && (
                            <p className="text-xs text-center text-red-500 mt-2">Upgrade to Pro to use this feature.</p>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default BulkCreateQR;
