import React, { useState, useEffect } from 'react';
import { FaTimes, FaMagic, FaSave, FaCheck, FaPlus } from 'react-icons/fa';
import axios from '../services/api';
import { toast } from 'react-toastify';

import { useTranslation } from 'react-i18next';

// Matches Template interface from CreateQR.tsx
interface Template {
    id: string | number;
    name: string;
    style: string;
    eyeStyle: string;
    foregroundColor: string;
    backgroundColor: string;
    dotScale: number;
    eyeScale: number;
    logoScale: number;
    ecLevel: string;
    logoBase64?: string | null;
    backgroundImageBase64?: string | null;
    backgroundGifBase64?: string | null;
    frame?: string;
    frameColor?: string;
    frameText?: string;
    frameTextColor?: string;
    frameTextPosition?: string;
}

interface TemplatePreset {
    id: string;
    name: string;
    icon: string;
    colors: { fg: string; bg: string };
    style: string;
    eyeStyle: string;
    dotScale: number;
}

// Subset of template settings used for QR generation
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

interface QRTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (template: QRTemplateSettings) => void;
    onCreateNew: () => void;
    currentTemplate?: QRTemplateSettings | null;
}

// Built-in presets (same as CreateQR.tsx)
const TEMPLATE_PRESETS: TemplatePreset[] = [
    {
        id: 'menu',
        name: 'Restaurant',
        icon: '🍔',
        colors: { fg: '#E65100', bg: '#FFF3E0' },
        style: 'classy',
        eyeStyle: 'classy',
        dotScale: 0.9,
    },
    {
        id: 'wifi',
        name: 'WiFi',
        icon: '📶',
        colors: { fg: '#0277BD', bg: '#E1F5FE' },
        style: 'extra-rounded',
        eyeStyle: 'circle',
        dotScale: 1.0,
    },
    {
        id: 'dark',
        name: 'Dark',
        icon: '🌑',
        colors: { fg: '#FFFFFF', bg: '#212121' },
        style: 'square',
        eyeStyle: 'square',
        dotScale: 0.9,
    },
    {
        id: 'eco',
        name: 'Eco',
        icon: '🌿',
        colors: { fg: '#2E7D32', bg: '#E8F5E9' },
        style: 'dots',
        eyeStyle: 'rounded',
        dotScale: 0.85,
    },
    {
        id: 'classic',
        name: 'Classic',
        icon: '⬛',
        colors: { fg: '#000000', bg: '#FFFFFF' },
        style: 'square',
        eyeStyle: 'square',
        dotScale: 1.0,
    },
];

const QRTemplateModal: React.FC<QRTemplateModalProps> = ({ isOpen, onClose, onSelect, onCreateNew, currentTemplate }) => {
    const { t } = useTranslation('qr');
    const [userTemplates, setUserTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchUserTemplates();
        }
    }, [isOpen]);

    const fetchUserTemplates = async () => {
        setLoading(true);
        try {
            const res = await axios.get<Template[]>('/templates');
            setUserTemplates(res.data);
        } catch (err) {
            console.error("Failed to fetch templates", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePresetSelect = (preset: TemplatePreset) => {
        onSelect({
            name: preset.name,
            foregroundColor: preset.colors.fg,
            backgroundColor: preset.colors.bg,
            style: preset.style,
            eyeStyle: preset.eyeStyle,
            dotScale: preset.dotScale,
            ecLevel: 'H',
        });
        toast.success(t('template.applied', { name: preset.name }));
        onClose();
    };

    const handleUserTemplateSelect = (template: Template) => {
        onSelect({
            name: template.name,
            foregroundColor: template.foregroundColor,
            backgroundColor: template.backgroundColor,
            style: template.style,
            eyeStyle: template.eyeStyle,
            dotScale: template.dotScale,
            ecLevel: template.ecLevel,
            logoBase64: template.logoBase64,
            frame: template.frame,
            frameColor: template.frameColor,
            frameText: template.frameText,
            frameTextColor: template.frameTextColor,
            frameTextPosition: template.frameTextPosition,
        });
        toast.success(t('template.applied', { name: template.name }));
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[70vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <FaMagic className="text-purple-500" />
                        <h2 className="text-lg font-bold text-gray-800">{t('template.select_title')}</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <FaTimes size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Create New Button */}
                    <button
                        onClick={() => { onClose(); onCreateNew(); }}
                        className="w-full p-3 border-2 border-dashed border-purple-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all flex items-center justify-center gap-2 text-purple-600 font-bold"
                    >
                        <FaPlus /> {t('template.create_new')}
                    </button>

                    {/* Preset Templates - Compact Grid */}
                    <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t('template.quick_presets')}</h3>
                        <div className="grid grid-cols-5 gap-2">
                            {TEMPLATE_PRESETS.map((preset) => (
                                <button
                                    key={preset.id}
                                    onClick={() => handlePresetSelect(preset)}
                                    className={`p-2 rounded-lg border-2 transition-all hover:scale-105 text-center ${currentTemplate?.name === preset.name
                                        ? 'border-purple-500 bg-purple-50'
                                        : 'border-gray-100 bg-white hover:border-gray-200'
                                        }`}
                                    title={preset.name}
                                >
                                    <div className="text-xl mb-1">{preset.icon}</div>
                                    <p className="text-[10px] font-bold text-gray-600 truncate">{preset.name}</p>
                                    <div className="flex justify-center gap-0.5 mt-1">
                                        <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: preset.colors.fg }} />
                                        <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: preset.colors.bg }} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* User Saved Templates */}
                    {userTemplates.length > 0 && (
                        <div>
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                <FaSave className="text-purple-400" size={10} /> {t('template.your_templates')}
                            </h3>
                            <div className="grid grid-cols-4 gap-2">
                                {userTemplates.map((template) => (
                                    <button
                                        key={template.id}
                                        onClick={() => handleUserTemplateSelect(template)}
                                        className={`p-2 rounded-lg border-2 border-dashed transition-all hover:scale-105 text-center ${currentTemplate?.name === template.name
                                            ? 'border-purple-500 bg-purple-50'
                                            : 'border-purple-200 bg-white hover:border-purple-400'
                                            }`}
                                        title={template.name}
                                    >
                                        <div className="text-lg mb-1">💾</div>
                                        <p className="text-[10px] font-bold text-gray-600 truncate">{template.name}</p>
                                        <div className="flex justify-center gap-0.5 mt-1">
                                            <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: template.foregroundColor }} />
                                            <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: template.backgroundColor }} />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {loading && (
                        <div className="text-center py-4 text-gray-400 text-sm">
                            {t('template.loading')}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 text-sm text-gray-600 hover:text-gray-800 font-medium"
                    >
                        {t('common.cancel', { defaultValue: 'Cancel' })}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QRTemplateModal;
