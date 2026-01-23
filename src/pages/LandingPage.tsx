import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from '../services/api'; // Import axios
import { SITE_CONFIG } from '../config';
import { generateStaticQR, generateAnimatedQR } from '../utils/qrGenerator';
import {
    FaRocket, FaMagic, FaChartLine, FaShieldAlt, FaDownload, FaImage, FaTrash,
    FaLink, FaUser, FaFile, FaList, FaGoogle, FaUtensils, FaStore, FaLaptop,
    FaShareAlt, FaBarcode, FaMusic, FaVideo, FaWifi, FaPlus, FaCloudUploadAlt, FaLock
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

// Debounce helper
const useDebounce = <T,>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

interface WifiData {
    ssid: string;
    password: string;
    type: string;
}

interface VCardData {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    org: string;
    title: string;
}

const LandingPage: React.FC = () => {
    const { t } = useTranslation('landing');
    const [qrUrl, setQrUrl] = useState<string | null>(null);
    const qrUrlRef = useRef<string | null>(null);
    const [, setQrBlob] = useState<Blob | null>(null); // Kept if needed later, otherwise unused
    const [isGenerating, setIsGenerating] = useState<boolean>(false);

    // Upload State
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    // QR Content State
    const [qrType, setQrType] = useState<string>('url'); // default

    // Data States
    const [urlValue, setUrlValue] = useState<string>(SITE_CONFIG.demoUrl || "https://example.com");
    const [textValue, setTextValue] = useState<string>("");

    const [wifiData, setWifiData] = useState<WifiData>({ ssid: '', password: '', type: 'WPA' });
    const [vCardData, setVCardData] = useState<VCardData>({ firstName: '', lastName: '', phone: '', email: '', org: '', title: '' });
    // const [emailData, setEmailData] = useState({ email: '', subject: '', body: '' }); // Unused
    // const [smsData, setSmsData] = useState({ phone: '', message: '' }); // Unused

    // Styles
    const [qrColor, setQrColor] = useState<string>('#4f46e5');
    const [qrStyle, setQrStyle] = useState<string>('classy');
    const [backgroundVisibility, setBackgroundVisibility] = useState<number>(0.25);

    // Backgrounds
    const [gifFile, setGifFile] = useState<File | null>(null);
    const [bgImageFile, setBgImageFile] = useState<File | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [emptyCenter, setEmptyCenter] = useState<boolean>(false);

    // const [gifPreview, setGifPreview] = useState<string | null>(null); // Unused in render, could be removed or used for previewing the raw GIF

    // Module Config - REORDERED: Free/Simple first, Complex/Pro last
    const QR_MODULES = [
        // Free / Simple types
        { id: 'url', label: t('modules.url'), icon: FaLink },
        { id: 'text', label: t('modules.text'), icon: FaPlus },
        { id: 'wifi', label: t('modules.wifi'), icon: FaWifi },
        { id: 'vcard', label: t('modules.vcard'), icon: FaUser },
        { id: 'google', label: t('modules.google'), icon: FaGoogle },
        { id: 'gs1', label: t('modules.gs1'), icon: FaBarcode },

        // Public Uploads (20MB)
        { id: 'file', label: t('modules.file'), icon: FaFile },
        { id: 'mp3', label: t('modules.mp3'), icon: FaMusic },
        { id: 'video', label: t('modules.video'), icon: FaVideo },

        // Complex / Hosted types (Require Login)
        { id: 'linkpage', label: t('modules.linkpage'), icon: FaList },
        { id: 'menu', label: t('modules.menu'), icon: FaUtensils },
        { id: 'app', label: t('modules.app'), icon: FaStore },
        { id: 'landing', label: t('modules.landing'), icon: FaLaptop },
        { id: 'smart', label: t('modules.smart'), icon: FaShareAlt },
    ];

    // Computed Content
    const qrContent = useMemo(() => {
        switch (qrType) {
            case 'url':
            case 'file':
            case 'google':
            case 'gs1':
            case 'mp3':
            case 'video':
                return urlValue;

            case 'text':
                return textValue;

            case 'wifi':
                // WIFI:T:WPA;S:MyNet;P:pass;;
                const { ssid, password, type } = wifiData;
                if (!ssid) return '';
                return `WIFI:T:${type};S:${ssid};P:${password};;`;

            case 'vcard':
                const { firstName, lastName, phone, email, org, title } = vCardData;
                if (!firstName && !lastName && !org) return '';
                return `BEGIN:VCARD\nVERSION:3.0\nN:${lastName};${firstName}\nFN:${firstName} ${lastName}\nTEL;TYPE=CELL:${phone}\nEMAIL:${email}\nORG:${org}\nTITLE:${title}\nEND:VCARD`;

            // Email/SMS could be added under 'More' logic or specific types if requested.
            // For now 'More' is mapped to Text, but I'll treat it as 'Text' generic.
            case 'linkpage':
            case 'menu':
            case 'app':
            case 'landing':
            case 'smart':
                // These types require a backend to manage the content, so for the public generator,
                // we'll just return a placeholder or an empty string, as the actual content
                // would be dynamic and managed via a user dashboard.
                // The renderInput function will show an upsell for these.
                return "Login to create dynamic QR codes for this type.";

            default: return urlValue;
        }
    }, [qrType, urlValue, textValue, wifiData, vCardData]);

    const debouncedContent = useDebounce(qrContent, 500);
    const debouncedColor = useDebounce(qrColor, 300);
    const debouncedStyle = useDebounce(qrStyle, 300);
    const debouncedEmptyCenter = useDebounce(emptyCenter, 300);
    const debouncedBgVisibility = useDebounce(backgroundVisibility, 300);

    const handleGifUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === 'image/gif') {
            setGifFile(file);
            setBgImageFile(null); // Clear static
            setEmptyCenter(true); // Auto-enable empty center for GIF backgrounds
            setQrColor('auto'); // Auto-enable dual-tone color extraction
            // setGifPreview(URL.createObjectURL(file));
        }
    };

    const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setBgImageFile(file);
            setGifFile(null); // Clear GIF
            // setGifPreview(null);
        }
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setLogoFile(file);
        }
    };

    const clearMedia = () => {
        setGifFile(null);
        setBgImageFile(null);
        setLogoFile(null);
        setEmptyCenter(false); // Reset empty center when clearing media
        // setGifPreview(null);
    };

    const generate = useCallback(async () => {
        if (!debouncedContent) return;
        setIsGenerating(true);
        try {
            let blob: Blob;
            if (gifFile) {
                // Generate Animated QR
                blob = await generateAnimatedQR(debouncedContent, gifFile, {
                    foregroundColor: debouncedColor,
                    style: debouncedStyle as any, // Cast to any or explicit type from qrGenerator
                    eyeStyle: 'rounded',
                    dotScale: 0.85,
                    eyeScale: 1.0,
                    ecLevel: 'Q',
                    logo: logoFile,
                    emptyCenter: debouncedEmptyCenter,
                    backgroundDimming: 1 - debouncedBgVisibility
                });
            } else {
                // Generate Static QR (Standard or with BG Image)
                blob = await generateStaticQR(debouncedContent, {
                    width: 600,
                    height: 600,
                    foregroundColor: debouncedColor,
                    backgroundColor: '#ffffff',
                    style: debouncedStyle as any,
                    eyeStyle: 'rounded',
                    dotScale: 0.85,
                    eyeScale: 1.0,
                    ecLevel: 'Q',
                    logo: logoFile,
                    emptyCenter: debouncedEmptyCenter,
                    backgroundImage: bgImageFile || undefined,
                    backgroundDimming: 1 - debouncedBgVisibility
                });
            }

            setQrBlob(blob);
            if (qrUrlRef.current) URL.revokeObjectURL(qrUrlRef.current);
            const newUrl = URL.createObjectURL(blob);
            qrUrlRef.current = newUrl;
            setQrUrl(newUrl);
        } catch (err) {
            console.error("Gen failed", err);
        } finally {
            setIsGenerating(false);
        }
    }, [debouncedContent, debouncedColor, debouncedStyle, gifFile, bgImageFile, logoFile, debouncedEmptyCenter, debouncedBgVisibility]);

    useEffect(() => {
        generate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [generate]);

    const handleDownload = () => {
        if (!qrUrl) return;
        const link = document.createElement('a');
        link.href = qrUrl;
        link.download = `qr-${Date.now()}.${gifFile ? 'gif' : 'png'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePublicFileUpload = async (file: File, type: string) => {
        if (!file) return;

        // 20MB Limit
        if (file.size > 20 * 1024 * 1024) {
            alert(t('create.messages.file_too_large') || "File too large (Max 20MB)");
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append('file', file);

            // Type mapping: 'file' -> 'image' (or generic), 'mp3' -> 'audio', 'video' -> 'video'
            // Backend expects: image, video, audio
            let endpointType = "image";
            if (type === 'mp3') endpointType = "audio";
            if (type === 'video') endpointType = "video";

            const response = await axios.post(
                `/storage/upload/public/${endpointType}`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            setUploadProgress(percentCompleted);
                        }
                    }
                }
            );

            const uploadedUrl = response.data.url;
            setUrlValue(uploadedUrl); // Set as the content
        } catch (error: any) {
            console.error('Upload error:', error);
            alert("Upload failed: " + (error.response?.data?.error || error.message));
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    // Helper to render input based on type
    const renderInput = () => {
        switch (qrType) {
            case 'url':
                return (
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">{t('generator.target_url')}</label>
                        <input
                            type="text"
                            value={urlValue}
                            onChange={(e) => setUrlValue(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-gray-700 placeholder-gray-400 text-lg"
                        />
                        <p className="text-xs text-gray-400 mt-2">{t('generator.static_note')}</p>
                    </div>
                );
            case 'google':
                return (
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Google Maps Link</label>
                        <input
                            type="text"
                            value={urlValue}
                            onChange={(e) => setUrlValue(e.target.value)}
                            placeholder="https://maps.google.com/..."
                            className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-gray-700 placeholder-gray-400 text-lg"
                        />
                    </div>
                );
            case 'gs1':
                return (
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">GS1 Barcode Value</label>
                        <input
                            type="text"
                            value={urlValue}
                            onChange={(e) => setUrlValue(e.target.value)}
                            placeholder="(01)12345678901234"
                            className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-gray-700 placeholder-gray-400 text-lg"
                        />
                    </div>
                );

            case 'linkpage':
            case 'menu':
            case 'app':
            case 'landing':
            case 'smart':
                // PRO / Hosted Features -> Login Upsell
                return (
                    <div className="border border-gray-200 rounded-2xl p-8 text-center bg-gray-50 flex flex-col items-center justify-center animate-fadeIn">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-indigo-600 text-2xl mb-4 shadow-sm">
                            <FaLock />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Login Required</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mb-6">
                            The <b>{qrType.charAt(0).toUpperCase() + qrType.slice(1)}</b> module requires a dashboard to manage your content dynamically.
                        </p>
                        <div className="flex gap-4 justify-center w-full max-w-xs">
                            <Link to="/login" className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-all text-center">
                                Login
                            </Link>
                            <Link to="/register" className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 text-center">
                                Try for Free
                            </Link>
                        </div>
                    </div>
                );

            case 'file':
            case 'mp3':
            case 'video':
                return (
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">{t('modules.' + qrType)} Upload (Max 20MB)</label>

                        {!urlValue || urlValue.startsWith('http') && !urlValue.includes('uploads') ? (
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors relative group">
                                <input
                                    type="file"
                                    accept={qrType === 'mp3' ? 'audio/*' : qrType === 'video' ? 'video/*' : '*/*'}
                                    onChange={(e) => e.target.files && handlePublicFileUpload(e.target.files[0], qrType)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    disabled={isUploading}
                                />
                                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
                                    <FaCloudUploadAlt />
                                </div>
                                <p className="text-sm font-bold text-gray-700">Click to Upload {qrType.toUpperCase()}</p>
                                <p className="text-xs text-gray-400 mt-1">Free Public Upload (20MB Limit)</p>
                            </div>
                        ) : (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                                        {qrType === 'mp3' ? <FaMusic /> : qrType === 'video' ? <FaVideo /> : <FaFile />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-green-800 truncate">{urlValue.split('/').pop()}</p>
                                        <p className="text-xs text-green-600 truncate">{urlValue}</p>
                                    </div>
                                </div>
                                <button onClick={() => setUrlValue("")} className="text-xs text-red-500 hover:text-red-700 font-bold px-2">
                                    <FaTrash />
                                </button>
                            </div>
                        )}

                        {isUploading && (
                            <div className="mt-3">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="font-bold text-gray-600">Uploading...</span>
                                    <span className="font-bold text-indigo-600">{uploadProgress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'wifi':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">{t('generator.ssid')}</label>
                            <input type="text" value={wifiData.ssid} onChange={(e) => setWifiData({ ...wifiData, ssid: e.target.value })} placeholder="MyWifi" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">{t('generator.password')}</label>
                            <input type="text" value={wifiData.password} onChange={(e) => setWifiData({ ...wifiData, password: e.target.value })} placeholder="Secret Pass" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">{t('generator.encryption')}</label>
                            <select value={wifiData.type} onChange={(e) => setWifiData({ ...wifiData, type: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none bg-gray-50">
                                <option value="WPA">WPA/WPA2</option>
                                <option value="WEP">WEP</option>
                                <option value="nopass">No Encryption</option>
                            </select>
                        </div>
                    </div>
                );
            case 'vcard':
                return (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                            <label className="block text-sm font-bold text-gray-700 mb-2">{t('generator.first_name')}</label>
                            <input type="text" value={vCardData.firstName} onChange={(e) => setVCardData({ ...vCardData, firstName: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none" placeholder="John" />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-sm font-bold text-gray-700 mb-2">{t('generator.last_name')}</label>
                            <input type="text" value={vCardData.lastName} onChange={(e) => setVCardData({ ...vCardData, lastName: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none" placeholder="Doe" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">{t('generator.phone')}</label>
                            <input type="tel" value={vCardData.phone} onChange={(e) => setVCardData({ ...vCardData, phone: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none" placeholder="+1234567890" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">{t('generator.email')}</label>
                            <input type="email" value={vCardData.email} onChange={(e) => setVCardData({ ...vCardData, email: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none" placeholder="john@example.com" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">{t('generator.org')}</label>
                            <input type="text" value={vCardData.org} onChange={(e) => setVCardData({ ...vCardData, org: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none" placeholder="Company Inc." />
                        </div>
                    </div>
                );
            case 'text':
                return (
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">{t('generator.your_text')}</label>
                        <textarea
                            value={textValue}
                            onChange={(e) => setTextValue(e.target.value)}
                            placeholder={t('generator.text_placeholder')}
                            rows={4}
                            className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-gray-700 placeholder-gray-400 text-lg"
                        />
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
                <div className="container mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg transform hover:rotate-12 transition-transform">
                            QR
                        </div>
                        <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                            {SITE_CONFIG.name}
                        </span>
                    </div>
                    <div className="flex gap-4 items-center">
                        <Link to="/login" className="hidden md:block px-6 py-2.5 rounded-full font-semibold text-gray-600 hover:text-gray-900 transition-colors">
                            {t('hero.login')}
                        </Link>
                        <Link to="/register" className="px-6 py-2.5 rounded-full font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 whitespace-nowrap">
                            {t('hero.get_started')}
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="pt-32 pb-20 overflow-hidden relative">
                {/* Background Blobs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-tr from-indigo-200 via-purple-200 to-pink-200 rounded-[100%] blur-3xl opacity-30 -z-10 animate-pulse-slow"></div>

                <div className="container mx-auto px-6 relative z-10 text-center">

                    <span className="inline-block py-1 px-3 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-bold mb-6 tracking-wide uppercase">
                        {t('hero.badge')}
                    </span>
                    <h1 className="text-5xl lg:text-7xl font-black tracking-tight mb-6 leading-tight">
                        {t('hero.title_part1')} <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">{t('hero.title_highlight')}</span>
                        <br />{t('hero.title_part2')}
                    </h1>
                    <p className="text-xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed">
                        {t('hero.subtitle')}
                    </p>

                    {/* CENTERED GENERATOR CARD */}
                    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-5xl mx-auto overflow-hidden flex flex-col lg:flex-row text-left">

                        {/* LEFT: Inputs */}
                        <div className="lg:w-7/12 p-8 lg:p-10 flex flex-col justify-start border-b lg:border-b-0 lg:border-r border-gray-100 bg-white relative z-10 transition-all">

                            {/* MODULE SELECTOR */}
                            <div className="mb-8 overflow-x-auto py-4 -mx-4 px-4 scrollbar-hide">
                                <div className="flex gap-4">
                                    {QR_MODULES.map(m => (
                                        <button
                                            key={m.id}
                                            onClick={() => setQrType(m.id)}
                                            className={`flex flex-col items-center gap-2 min-w-[70px] p-3 rounded-xl transition-all ${qrType === m.id ? 'bg-indigo-50 text-indigo-600 ring-2 ring-indigo-500 ring-offset-2' : 'hover:bg-gray-50 text-gray-500 hover:text-gray-900'}`}
                                        >
                                            <div className="text-2xl"><m.icon /></div>
                                            <span className="text-xs font-semibold whitespace-nowrap">{m.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                {renderInput()}

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">{t('generator.style')}</label>
                                        <select
                                            value={qrStyle}
                                            onChange={(e) => setQrStyle(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none font-medium bg-gray-50 cursor-pointer"
                                        >
                                            <option value="square">Square</option>
                                            <option value="dots">Dots</option>
                                            <option value="rounded">Rounded</option>
                                            <option value="classy">Classy</option>
                                            <option value="classy-rounded">Elegant</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">{t('generator.color')}</label>
                                        <div className="flex gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200">
                                            {['#4f46e5', '#db2777', '#059669', '#000000'].map(c => (
                                                <button
                                                    key={c}
                                                    onClick={() => setQrColor(c)}
                                                    className={`w-9 h-9 rounded-full border-2 transition-transform hover:scale-110 ${qrColor === c ? 'border-gray-900 scale-110 shadow-sm' : 'border-transparent'}`}
                                                    style={{ backgroundColor: c }}
                                                    title={c}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Logo Upload */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center justify-between">
                                        <span>{t('generator.logo')}</span>
                                        {logoFile && <button onClick={() => setLogoFile(null)} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"><FaTrash /> {t('generator.remove')}</button>}
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            accept="image/png, image/jpeg, image/jpg"
                                            onChange={handleLogoUpload}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                        />
                                        <div className={`w-full py-3 px-2 rounded-xl border-dashed border-2 flex flex-col items-center justify-center gap-1 transition-all text-center h-24 ${logoFile ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300'}`}>
                                            <div className="text-xl font-bold">Q</div>
                                            <span className="text-xs font-bold">{logoFile ? logoFile.name.substring(0, 10) + '...' : t('generator.upload_logo')}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Background Uploads */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center justify-between">
                                        <span>{t('generator.background')}</span>
                                        <label className="flex items-center gap-2 cursor-pointer text-xs font-normal text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 px-2 py-1 rounded-md">
                                            <input
                                                type="checkbox"
                                                checked={emptyCenter}
                                                onChange={(e) => setEmptyCenter(e.target.checked)}
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            {t('generator.empty_center')}
                                        </label>
                                        {(gifFile || bgImageFile) && <button onClick={clearMedia} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"><FaTrash /> {t('generator.remove')}</button>}
                                    </label>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="relative group">
                                            <input
                                                type="file"
                                                accept="image/gif"
                                                onChange={handleGifUpload}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                            />
                                            <div className={`w-full py-3 px-2 rounded-xl border-dashed border-2 flex flex-col items-center justify-center gap-1 transition-all text-center h-24 ${gifFile ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-indigo-300'}`}>
                                                <FaMagic className="text-xl" />
                                                <span className="text-xs font-bold">{gifFile ? gifFile.name.substring(0, 10) + '...' : t('generator.upload_gif')}</span>
                                            </div>
                                        </div>
                                        <div className="relative group">
                                            <input
                                                type="file"
                                                accept="image/png, image/jpeg, image/jpg"
                                                onChange={handleBgImageUpload}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                            />
                                            <div className={`w-full py-3 px-2 rounded-xl border-dashed border-2 flex flex-col items-center justify-center gap-1 transition-all text-center h-24 ${bgImageFile ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 hover:border-purple-300'}`}>
                                                <FaImage className="text-xl" />
                                                <span className="text-xs font-bold">{bgImageFile ? bgImageFile.name.substring(0, 10) + '...' : t('generator.upload_image')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {(gifFile || bgImageFile) && (
                                    <div className="mt-4 bg-gray-50 p-3 rounded-xl border border-gray-200 animate-fadeIn">
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="text-xs font-bold text-gray-700">{t('generator.bg_visibility')}</label>
                                            <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-1 rounded">{Math.round(backgroundVisibility * 100)}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.05"
                                            value={backgroundVisibility}
                                            onChange={(e) => setBackgroundVisibility(parseFloat(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        />
                                    </div>
                                )}

                                <button
                                    onClick={handleDownload}
                                    disabled={!qrUrl}
                                    className="w-full py-4 rounded-xl font-bold text-white bg-gray-900 hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
                                >
                                    {isGenerating ? t('hero.generating') : <><FaDownload /> {t('hero.download_qr')}</>}
                                </button>
                            </div>
                        </div>

                        {/* RIGHT: QR Preview */}
                        <div className="lg:w-5/12 bg-gray-50 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-indigo-50/50">
                            <div className="relative max-w-[300px] w-full group perspective-1000">
                                {/* 3D Tilt Wrapper */}
                                <div className="relative bg-white p-4 rounded-3xl shadow-xl border border-white transform transition-transform duration-500 group-hover:rotate-x-2 group-hover:rotate-y-2">
                                    {/* Decorative */}
                                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-500"></div>

                                    <div className="relative bg-white rounded-2xl overflow-hidden shadow-inner aspect-square flex items-center justify-center">
                                        {qrUrl && !isGenerating ? (
                                            <img src={qrUrl} alt="Generated QR" className="w-full h-full object-contain" />
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 text-gray-400 animate-pulse">
                                                <div className="text-4xl"><FaRocket /></div>
                                                <span className="text-sm font-bold uppercase tracking-widest">{t('hero.processing')}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {/* Features Section */}
            <section id="features" className="py-24 bg-gray-50 relative">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-4xl font-bold mb-4 tracking-tight">{t('features.title')}</h2>
                        <p className="text-gray-500 text-lg">{t('features.subtitle')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { key: 'dynamic', icon: FaRocket },
                            { key: 'analytics', icon: FaChartLine },
                            { key: 'design', icon: FaMagic },
                            { key: 'vcard', icon: FaShieldAlt }
                        ].map((feature, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 text-2xl mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-indigo-200 group-hover:shadow-lg">
                                    <feature.icon />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-gray-900">{t(`features.features_list.${feature.key}.title`)}</h3>
                                <p className="text-gray-500 leading-relaxed font-medium">{t(`features.features_list.${feature.key}.description`)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-100 py-12">
                <div className="container mx-auto px-6 text-center">
                    <Link to="/" className="inline-flex items-center justify-center gap-2 mb-6 opacity-50 hover:opacity-100 transition-opacity">
                        <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 font-bold">Q</div>
                        <span className="font-bold text-gray-400">{SITE_CONFIG.name}</span>
                    </Link>
                    <p className="text-gray-400 text-sm font-medium">
                        &copy; {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
