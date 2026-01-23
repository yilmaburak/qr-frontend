import React, { useState, useEffect } from 'react';
import { FaTimes, FaQrcode, FaSave, FaPalette } from 'react-icons/fa';
import { generateStaticQR, blobToBase64 } from '../../utils/qrGenerator'; // Ensure path is correct
import axios from '../../services/api';
import { toast } from 'react-toastify';
import { HexColorPicker } from 'react-colorful';

interface MenuQRModalProps {
    isOpen: boolean;
    onClose: () => void;
    menuId: number;
    menuUid: string;
    menuName: string;
}

import { useTranslation, Trans } from 'react-i18next';
import { useBranch } from '../../contexts/BranchContext'; // If needed for context, but simplistic for now to just add hook here

const MenuQRModal: React.FC<MenuQRModalProps> = ({ isOpen, onClose, menuId, menuUid, menuName }) => {
    const { t } = useTranslation('restaurant');
    const [color, setColor] = useState('#000000');
    const [bgColor, setBgColor] = useState('#ffffff');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [title, setTitle] = useState(`${menuName} QR`);
    const [showColorPicker, setShowColorPicker] = useState(false);

    useEffect(() => {
        if (isOpen && menuId) {
            generatePreview();
        }
    }, [isOpen, menuId, color, bgColor]);

    const generatePreview = async () => {
        setIsGenerating(true);
        try {
            const origin = window.location.origin;
            const content = `${origin}/menu/view/${menuUid}`;

            const blob = await generateStaticQR(content, {
                foregroundColor: color,
                backgroundColor: bgColor,
                width: 600,
                style: 'square',
                eyeStyle: 'square',
                dotScale: 1,
                eyeScale: 1,
                ecLevel: 'H',
                emptyCenter: false,
                backgroundDimming: 0,
            });

            setGeneratedBlob(blob);
            setPreviewUrl(URL.createObjectURL(blob));
        } catch (error) {
            console.error(error);
            toast.error(t('menu_qr_modal.gen_error'));
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!generatedBlob) return;
        try {
            const origin = window.location.origin;
            const content = `${origin}/menu/view/${menuUid}`;
            const base64 = await blobToBase64(generatedBlob);

            await axios.post('/qrcodes', {
                content,
                title,
                description: `QR Code for ${menuName}`,
                generatedImageBase64: base64,
                dynamic: false,
                foregroundColor: color,
                backgroundColor: bgColor,
                style: 'square',
                eyeStyle: 'square',
                dotScale: 1,
                eyeScale: 1,
                menuId: menuId,
                animationType: 'NONE'
            });

            toast.success(t('menu_qr_modal.saved'));
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(t('menu_qr_modal.save_error'));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-fadeIn">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <FaQrcode className="text-blue-600" />
                        {t('menu_qr_modal.title')}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <FaTimes size={24} />
                    </button>
                </div>

                <div className="p-6 flex flex-col md:flex-row gap-8">
                    {/* Left: Controls */}
                    <div className="flex-1 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('tables.title')}</label>
                            {/* Assuming tables.title isn't quite right for "Title", using explicit label from common or new key if needed, wait, I added menu_qr_modal keys, no title label there? I added 'title' which is the modal title. I should probably use a generic title key or add one. Let's look at qr.json labels.title or just add custom one for labels/placeholders. Wait, I missed adding label keys for inputs in MenuQRModal in previous JSON update? I added title, qr_color, etc. checking...
                                "qr_color": "QR Color", ... No "Title" label key added. I'll use hardcoded for now or reuse existing if possible. Actually I can add one locally or use generic. 
                                Let's use generic 'create.labels.title' from qr.json since this is QR related? Or just t('common.title') if exists.
                                I'll use 'menu_management.title' is "Menu Management".
                                I'll use t('create.labels.title', { ns: 'qr' })? Or just hardcode "Title" is risky.
                                Let's check keys again. "restaurant.json" has "menu_qr_modal.title" is "Generate Menu QR".
                                I will add "title_label" to menu_qr_modal next time or reuse.
                                Actually I see "labels": { "title": "Title" } in qr.json (EN). I can use that with namespace 'qr'.
                            */}
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('labels.title', { ns: 'qr' })}</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2 border rounded-xl"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('menu_qr_modal.qr_color')}</label>
                            <div className="flex gap-4 items-center">
                                <div
                                    className="w-10 h-10 rounded-full border cursor-pointer shadow-sm"
                                    style={{ backgroundColor: color }}
                                    onClick={() => setShowColorPicker(!showColorPicker)}
                                />
                                <span className="text-sm text-gray-500">{color}</span>
                            </div>
                            {showColorPicker && (
                                <div className="absolute mt-2 z-10">
                                    <div className="fixed inset-0" onClick={() => setShowColorPicker(false)} />
                                    <div className="relative">
                                        <HexColorPicker color={color} onChange={setColor} />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-700">
                            <strong>{t('menu_qr_modal.note')}</strong> <Trans i18nKey="menu_qr_modal.note_text" values={{ menuName }} components={{ 1: <strong></strong> }} />
                        </div>
                    </div>

                    {/* Right: Preview */}
                    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 rounded-xl p-8">
                        {isGenerating ? (
                            <div className="animate-pulse w-48 h-48 bg-gray-200 rounded-xl" />
                        ) : previewUrl ? (
                            <img src={previewUrl} alt="QR Preview" className="w-48 h-48 border-4 border-white shadow-lg rounded-xl" />
                        ) : (
                            <div className="w-48 h-48 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400">
                                {t('menu_qr_modal.no_preview')}
                            </div>
                        )}
                        <p className="text-sm text-gray-400 mt-4">{t('menu_qr_modal.preview')}</p>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        {t('common.cancel', { defaultValue: 'Cancel' })}
                    </button>
                    <button
                        onClick={handleSave}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-blue-600/20"
                    >
                        <FaSave /> {t('menu_qr_modal.save_btn')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MenuQRModal;
