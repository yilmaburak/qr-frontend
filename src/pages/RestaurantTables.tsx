import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaQrcode, FaPrint, FaDownload, FaPalette, FaSlidersH, FaMagic, FaLink, FaUtensils } from 'react-icons/fa';
import { Store, ChevronDown, AlertCircle } from 'lucide-react';
import { generateStaticQR, blobToBase64 } from '../utils/qrGenerator';
import { getCurrentUser } from '../services/auth';
import { HexColorPicker } from 'react-colorful';
import { useBranch } from '../contexts/BranchContext';
import QRTemplateModal, { type QRTemplateSettings } from '../components/QRTemplateModal';
import QRTemplateCreatorModal from '../components/QRTemplateCreatorModal';
import { useTranslation } from 'react-i18next';

const RestaurantTables: React.FC = () => {
    const { t } = useTranslation('restaurant');
    const { branches, activeBranch, setActiveBranch, isLoading: branchLoading } = useBranch();

    const [tableNumber, setTableNumber] = useState<string>('');
    const [qrImage, setQrImage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [generatedUrl, setGeneratedUrl] = useState<string>('');

    // Customization State
    const [foregroundColor, setForegroundColor] = useState<string>('#000000');
    const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
    const [dotScale, setDotScale] = useState<number>(0.9);
    const [style, setStyle] = useState<string>('square');
    const [eyeStyle, setEyeStyle] = useState<string>('square');
    const [showColorPicker, setShowColorPicker] = useState<boolean>(false);

    // Template Modal State
    const [showTemplateModal, setShowTemplateModal] = useState<boolean>(false);
    const [showTemplateCreator, setShowTemplateCreator] = useState<boolean>(false);
    const [selectedTemplate, setSelectedTemplate] = useState<QRTemplateSettings | null>(null);

    // Branch Dropdown State
    const [showBranchDropdown, setShowBranchDropdown] = useState(false);

    const handleTemplateSelect = (template: QRTemplateSettings) => {
        setSelectedTemplate(template);
        setForegroundColor(template.foregroundColor);
        setBackgroundColor(template.backgroundColor);
        setDotScale(template.dotScale);
        setStyle(template.style);
        setEyeStyle(template.eyeStyle);
    };

    const generateQr = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tableNumber.trim()) {
            toast.error(t('tables.enter_table_number'));
            return;
        }
        if (!activeBranch) {
            toast.error(t('waiter.select_branch'));
            return;
        }

        setLoading(true);
        try {
            const origin = window.location.origin;
            // URL format: /menu/branch/{branchId}/table/{tableNumber}
            const url = `${origin}/menu/branch/${activeBranch.id}/table/${tableNumber}`;
            setGeneratedUrl(url);

            const blob = await generateStaticQR(url, {
                foregroundColor,
                backgroundColor,
                dotScale,
                style,
                eyeStyle,
                width: 800,
                ecLevel: 'H',
                margin: 2
            });

            setQrImage(URL.createObjectURL(blob));
            toast.success(t('tables.qr_generated', { branchName: activeBranch.name, tableNumber }));
        } catch (err) {
            console.error(err);
            toast.error(t('messages.error_occurred'));
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        if (!qrImage || !activeBranch) return;
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                <head>
                    <title>${t('tables.print_title', { branchName: activeBranch.name, tableNumber })}</title>
                    <style>
                        body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: system-ui, sans-serif; background: #f8f9fa; }
                        .card { background: white; padding: 40px; border-radius: 24px; box-shadow: 0 4px 24px rgba(0,0,0,0.1); text-align: center; }
                        img { width: 280px; height: 280px; }
                        h1 { font-size: 42px; font-weight: 800; margin: 0 0 8px 0; color: #1a1a1a; }
                        h2 { font-size: 20px; font-weight: 500; margin: 0; color: #666; }
                        .footer { margin-top: 24px; font-size: 14px; color: #999; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <h2>${activeBranch.name}</h2>
                        <h1>${t('tables.table_number')} ${tableNumber}</h1>
                        <img src="${qrImage}" />
                        <div class="footer">${t('tables.scan_instruction')}</div>
                    </div>
                    <script>setTimeout(() => window.print(), 300);</script>
                </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            {/* Header with Branch Selector */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
                        <FaQrcode className="text-indigo-600" /> {t('tables.qr_generator')}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">{t('tables.qr_subtitle')}</p>
                </div>

                {/* Branch Selector */}
                <div className="relative">
                    <button
                        onClick={() => setShowBranchDropdown(!showBranchDropdown)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl hover:border-indigo-300 transition-all shadow-sm"
                    >
                        <Store size={18} className="text-indigo-500" />
                        <span className="font-medium text-gray-700">
                            {branchLoading ? 'Loading...' : (activeBranch ? activeBranch.name : t('tables.select_branch'))}
                        </span>
                        <ChevronDown size={16} className="text-gray-400" />
                    </button>

                    {showBranchDropdown && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                            {branches.length === 0 ? (
                                <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
                                    <AlertCircle size={14} /> {t('tables.no_branches')}
                                </div>
                            ) : (
                                branches.map(branch => (
                                    <button
                                        key={branch.id}
                                        onClick={() => { setActiveBranch(branch); setShowBranchDropdown(false); }}
                                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center justify-between ${activeBranch?.id === branch.id ? 'text-indigo-600 font-semibold bg-indigo-50' : 'text-gray-700'
                                            }`}
                                    >
                                        {branch.name}
                                        {activeBranch?.id === branch.id && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Warning if no branch selected */}
            {!activeBranch && !branchLoading && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
                    <AlertCircle className="text-amber-500" size={20} />
                    <p className="text-sm text-amber-800">
                        {t('tables.warning_select_branch')}
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Controls - 2 columns */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <form onSubmit={generateQr} className="space-y-5">
                        {/* Template Selection */}
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
                                {t('tables.qr_style')}
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowTemplateModal(true)}
                                className="w-full p-3 border-2 border-dashed border-indigo-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-all flex items-center justify-between"
                            >
                                <div className="flex items-center gap-2">
                                    {selectedTemplate ? (
                                        <>
                                            <div className="flex gap-1">
                                                <div className="w-5 h-5 rounded-full border-2" style={{ backgroundColor: selectedTemplate.foregroundColor }} />
                                                <div className="w-5 h-5 rounded-full border-2" style={{ backgroundColor: selectedTemplate.backgroundColor }} />
                                            </div>
                                            <span className="font-semibold text-gray-700">{selectedTemplate.name}</span>
                                        </>
                                    ) : (
                                        <>
                                            <FaMagic className="text-indigo-400" />
                                            <span className="text-gray-500">{t('tables.choose_template')}</span>
                                        </>
                                    )}
                                </div>
                                <ChevronDown size={16} className="text-indigo-400" />
                            </button>
                        </div>

                        {/* Table Number */}
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
                                {t('tables.table_number')}
                            </label>
                            <input
                                type="text"
                                value={tableNumber}
                                onChange={(e) => setTableNumber(e.target.value)}
                                placeholder={t('tables.table_placeholder')}
                                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg font-medium"
                            />
                        </div>

                        {/* Color Override */}
                        <div className="border-t border-gray-100 pt-4">
                            <label className="block text-xs font-bold text-gray-600 mb-3 uppercase tracking-wide flex items-center gap-1">
                                <FaPalette size={10} /> {t('tables.colors_label')}
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">{t('tables.foreground')}</p>
                                    <div
                                        className="w-full h-10 rounded-lg border-2 cursor-pointer shadow-inner"
                                        style={{ backgroundColor: foregroundColor }}
                                        onClick={() => setShowColorPicker(!showColorPicker)}
                                    />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">{t('tables.background')}</p>
                                    <div
                                        className="w-full h-10 rounded-lg border-2 cursor-pointer shadow-inner"
                                        style={{ backgroundColor: backgroundColor }}
                                        onClick={() => setShowColorPicker(!showColorPicker)}
                                    />
                                </div>
                            </div>
                            {showColorPicker && (
                                <div className="mt-3 grid grid-cols-2 gap-3">
                                    <HexColorPicker color={foregroundColor} onChange={setForegroundColor} style={{ width: '100%', height: '100px' }} />
                                    <HexColorPicker color={backgroundColor} onChange={setBackgroundColor} style={{ width: '100%', height: '100px' }} />
                                </div>
                            )}
                        </div>

                        {/* Dot Scale */}
                        <div className="border-t border-gray-100 pt-4">
                            <div className="flex justify-between mb-2">
                                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">{t('tables.dot_scale')}</label>
                                <span className="text-xs font-bold text-indigo-600">{Math.round(dotScale * 100)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0.5"
                                max="1.0"
                                step="0.05"
                                value={dotScale}
                                onChange={(e) => setDotScale(parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !tableNumber || !activeBranch}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-4 rounded-xl font-bold transition disabled:opacity-50 shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                        >
                            <FaQrcode /> {loading ? t('tables.generating') : t('tables.generate_qr')}
                        </button>
                    </form>
                </div>

                {/* Preview - 3 columns */}
                <div className="lg:col-span-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 p-8 flex flex-col items-center justify-center min-h-[450px]">
                    {qrImage && activeBranch ? (
                        <div className="flex flex-col items-center w-full max-w-sm">
                            {/* Preview Card */}
                            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full text-center border border-gray-100">
                                <p className="text-sm font-medium text-gray-500 mb-1">{activeBranch.name}</p>
                                <h2 className="text-3xl font-black text-gray-800 mb-6">Table {tableNumber}</h2>
                                <div className="bg-gray-50 p-4 rounded-2xl inline-block">
                                    <img src={qrImage} alt="Menu QR" className="w-48 h-48 object-contain" />
                                </div>
                                <p className="text-xs text-gray-400 mt-4">{t('tables.scan_instruction')}</p>
                            </div>

                            {/* URL Display */}
                            <div className="mt-4 w-full p-3 bg-white rounded-xl border border-gray-200 flex items-center gap-2">
                                <FaLink className="text-gray-400 flex-shrink-0" size={12} />
                                <p className="text-xs text-gray-500 truncate flex-1">{generatedUrl}</p>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-3 w-full mt-4">
                                <button
                                    onClick={handlePrint}
                                    className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-4 py-3 rounded-xl font-semibold transition shadow-lg"
                                >
                                    <FaPrint /> {t('tables.print')}
                                </button>
                                <a
                                    href={qrImage}
                                    download={`${activeBranch.name}-table-${tableNumber}-qr.png`}
                                    className="flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 px-4 py-3 rounded-xl font-semibold transition"
                                >
                                    <FaDownload /> {t('tables.download')}
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="w-24 h-24 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <FaUtensils className="text-4xl text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-600 mb-2">{t('tables.preview_title')}</h3>
                            <p className="text-sm text-gray-400 max-w-xs">
                                {!activeBranch
                                    ? t('tables.select_branch')
                                    : t('tables.preview_subtitle')
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Bulk Generation */}
            <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                    <FaSlidersH className="text-purple-600" /> {t('tables.bulk_generate')}
                    {activeBranch && <span className="text-sm font-normal text-gray-500">{t('tables.bulk_subtitle', { branchName: activeBranch.name })}</span>}
                </h2>
                <div className="grid grid-cols-5 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-2">{t('tables.from_table')}</label>
                        <input type="number" min="1" placeholder="1" id="bulkStart" className="w-full p-3 border-2 border-gray-200 rounded-xl" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-2">{t('tables.to_table')}</label>
                        <input type="number" min="1" placeholder="10" id="bulkEnd" className="w-full p-3 border-2 border-gray-200 rounded-xl" />
                    </div>
                    <div className="col-span-3">
                        <button
                            onClick={async () => {
                                if (!activeBranch) {
                                    toast.error(t('waiter.select_branch'));
                                    return;
                                }
                                const startInput = document.getElementById('bulkStart') as HTMLInputElement;
                                const endInput = document.getElementById('bulkEnd') as HTMLInputElement;
                                const start = parseInt(startInput.value);
                                const end = parseInt(endInput.value);

                                if (!start || !end || start > end) {
                                    toast.error(t('tables.invalid_range'));
                                    return;
                                }

                                toast.info(t('tables.generating_range', { start, end }));

                                let content = `<html><head><title>${t('tables.bulk_print_title', { branchName: activeBranch.name, start, end })}</title><style>
                                    body { font-family: system-ui, sans-serif; background: #f8f9fa; padding: 20px; }
                                    .header { text-align: center; margin-bottom: 30px; }
                                    .header h1 { font-size: 28px; color: #333; margin: 0; }
                                    .header p { color: #666; margin: 5px 0 0 0; }
                                    .qr-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 24px; }
                                    .qr-item { background: white; padding: 24px; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); text-align: center; break-inside: avoid; }
                                    .table-num { font-size: 24px; font-weight: 800; color: #1a1a1a; margin-bottom: 12px; }
                                    .branch-name { font-size: 12px; color: #666; margin-bottom: 4px; }
                                    img { width: 180px; height: 180px; }
                                    .branch-name { font-size: 12px; color: #666; margin-bottom: 4px; }
                                    img { width: 180px; height: 180px; }
                                    .scan-text { font-size: 11px; color: #999; margin-top: 12px; }
                                </style></head><body>
                                <div class="header"><h1>${activeBranch.name}</h1><p>${t('tables.table_number')} ${start} - ${end}</p></div>
                                <div class="qr-grid">`;

                                for (let i = start; i <= end; i++) {
                                    const url = `${window.location.origin}/menu/branch/${activeBranch.id}/table/${i}`;
                                    const blob = await generateStaticQR(url, { foregroundColor, backgroundColor, dotScale, style, eyeStyle, width: 400, margin: 2 });
                                    const base64 = await blobToBase64(blob) as string;
                                    content += `<div class="qr-item"><div class="branch-name">${activeBranch.name}</div><div class="table-num">${t('tables.table_number')} ${i}</div><img src="${base64}"/><div class="scan-text">${t('tables.scan_for_menu')}</div></div>`;
                                }
                                content += `</div><script>setTimeout(() => window.print(), 500);</script></body></html>`;

                                const printWindow = window.open('', '_blank');
                                if (printWindow) { printWindow.document.write(content); printWindow.document.close(); }
                            }}
                            disabled={!activeBranch}
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg disabled:opacity-50"
                        >
                            {t('tables.generate_print_all')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <QRTemplateModal
                isOpen={showTemplateModal}
                onClose={() => setShowTemplateModal(false)}
                onSelect={handleTemplateSelect}
                onCreateNew={() => setShowTemplateCreator(true)}
                currentTemplate={selectedTemplate}
            />
            <QRTemplateCreatorModal
                isOpen={showTemplateCreator}
                onClose={() => setShowTemplateCreator(false)}
                onSave={(template) => {
                    handleTemplateSelect(template);
                    setShowTemplateCreator(false);
                }}
            />
        </div>
    );
};

export default RestaurantTables;
