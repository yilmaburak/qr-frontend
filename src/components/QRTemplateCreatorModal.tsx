import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaPalette, FaSave, FaSlidersH, FaImage } from 'react-icons/fa';
import { HexColorPicker } from 'react-colorful';
import { toast } from 'react-toastify';
import axios from '../services/api';
import { generateStaticQR } from '../utils/qrGenerator';
import { useTranslation } from 'react-i18next';

export interface QRTemplateSettings {
    name: string;
    foregroundColor: string;
    backgroundColor: string;
    style: string;
    eyeStyle: string;
    dotScale: number;
    ecLevel?: string;
    logoBase64?: string | null;
    frame?: string;
    frameColor?: string;
    frameText?: string;
    frameTextColor?: string;
    frameTextPosition?: string;
}

interface QRTemplateCreatorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (template: QRTemplateSettings) => void;
}

const QRTemplateCreatorModal: React.FC<QRTemplateCreatorModalProps> = ({ isOpen, onClose, onSave }) => {
    const { t } = useTranslation('qr');
    // Template Settings State
    const [templateName, setTemplateName] = useState(t('template.name_placeholder'));
    const [foregroundColor, setForegroundColor] = useState('#000000');
    const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
    const [style, setStyle] = useState('square');
    const [eyeStyle, setEyeStyle] = useState('square');
    const [dotScale, setDotScale] = useState(0.9);
    const [ecLevel, setEcLevel] = useState('H');

    // UI State
    const [showFgPicker, setShowFgPicker] = useState(false);
    const [showBgPicker, setShowBgPicker] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Preview generation
    useEffect(() => {
        if (!isOpen) return;

        const generatePreview = async () => {
            try {
                const blob = await generateStaticQR('https://example.com/menu', {
                    foregroundColor,
                    backgroundColor,
                    style,
                    eyeStyle,
                    dotScale,
                    ecLevel,
                    width: 200,
                    margin: 1
                });
                if (previewUrl) URL.revokeObjectURL(previewUrl);
                setPreviewUrl(URL.createObjectURL(blob));
            } catch (err) {
                console.error('Preview failed', err);
            }
        };

        const timer = setTimeout(generatePreview, 300);
        return () => clearTimeout(timer);
    }, [isOpen, foregroundColor, backgroundColor, style, eyeStyle, dotScale, ecLevel]);

    const handleSaveTemplate = async () => {
        if (!templateName.trim()) {
            toast.error(t('template.enter_name_error'));
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                name: templateName,
                style,
                eyeStyle,
                foregroundColor,
                backgroundColor,
                dotScale,
                eyeScale: 1.0,
                logoScale: 0.4,
                ecLevel,
            };

            await axios.post('/templates', payload);
            toast.success(t('template.save_success'));

            onSave({
                name: templateName,
                foregroundColor,
                backgroundColor,
                style,
                eyeStyle,
                dotScale,
                ecLevel,
            });
            onClose();
        } catch (err) {
            toast.error(t('template.save_error'));
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-purple-600 to-indigo-600">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3">
                            <FaPalette className="text-white text-xl" />
                            <div>
                                <h2 className="text-lg font-bold text-white">{t('template.create_title')}</h2>
                                <p className="text-xs text-white/70">{t('template.design_custom')}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                            <FaTimes size={20} />
                        </button>
                    </div>

                    {/* Content - Two Column Layout */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                            {/* Left: Controls */}
                            <div className="p-6 space-y-6 border-r border-gray-100">
                                {/* Template Name */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">{t('template.name_label')}</label>
                                    <input
                                        type="text"
                                        value={templateName}
                                        onChange={(e) => setTemplateName(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder={t('template.name_placeholder')}
                                    />
                                </div>

                                {/* Pattern Style */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">{t('template.pattern_style')}</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['square', 'dots', 'rounded', 'classy', 'classy-rounded', 'extra-rounded'].map((opt) => (
                                            <button
                                                key={opt}
                                                type="button"
                                                onClick={() => setStyle(opt)}
                                                className={`p-2 rounded-lg border-2 text-xs font-medium transition-all ${style === opt
                                                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                                                    : 'border-gray-100 hover:border-gray-200 text-gray-600'
                                                    }`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Eye Style */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">{t('template.eye_style')}</label>
                                    <div className="flex gap-2">
                                        {['square', 'circle', 'rounded'].map((opt) => (
                                            <button
                                                key={opt}
                                                type="button"
                                                onClick={() => setEyeStyle(opt)}
                                                className={`flex-1 py-2 rounded-lg border-2 text-xs font-medium transition-all ${eyeStyle === opt
                                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                    : 'border-gray-100 hover:border-gray-200 text-gray-600'
                                                    }`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Colors */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">{t('create.labels.foreground_color')}</label>
                                        <div
                                            className="w-full h-10 rounded-lg border-2 border-gray-200 cursor-pointer shadow-inner"
                                            style={{ backgroundColor: foregroundColor }}
                                            onClick={() => setShowFgPicker(!showFgPicker)}
                                        />
                                        {showFgPicker && (
                                            <div className="mt-2">
                                                <HexColorPicker color={foregroundColor} onChange={setForegroundColor} style={{ width: '100%' }} />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">{t('create.labels.background_color')}</label>
                                        <div
                                            className="w-full h-10 rounded-lg border-2 border-gray-200 cursor-pointer shadow-inner"
                                            style={{ backgroundColor: backgroundColor }}
                                            onClick={() => setShowBgPicker(!showBgPicker)}
                                        />
                                        {showBgPicker && (
                                            <div className="mt-2">
                                                <HexColorPicker color={backgroundColor} onChange={setBackgroundColor} style={{ width: '100%' }} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Dot Scale */}
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="text-sm font-bold text-gray-700">{t('create.labels.dot_style')}</label>
                                        <span className="text-sm font-bold text-purple-600">{Math.round(dotScale * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="1.0"
                                        step="0.05"
                                        value={dotScale}
                                        onChange={(e) => setDotScale(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                    />
                                </div>
                            </div>

                            {/* Right: Preview */}
                            <div className="p-6 bg-gray-50 flex flex-col items-center justify-center min-h-[400px]">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">{t('template.live_preview')}</p>
                                <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="QR Preview" className="w-40 h-40 object-contain" />
                                    ) : (
                                        <div className="w-40 h-40 bg-gray-100 rounded-lg animate-pulse" />
                                    )}
                                </div>
                                <p className="text-xs text-gray-400 mt-4 text-center">
                                    {t('template.preview_text')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-100 bg-white flex justify-between items-center">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                        >
                            {t('common.cancel', { defaultValue: 'Cancel' })}
                        </button>
                        <button
                            onClick={handleSaveTemplate}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-purple-200"
                        >
                            <FaSave /> {isSaving ? t('template.saving') : t('template.save_apply')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QRTemplateCreatorModal;
