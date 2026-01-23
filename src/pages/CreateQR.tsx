import React, { useState, useEffect, useRef } from 'react';
import axios from '../services/api';
import { useTranslation } from 'react-i18next';
import { getCurrentUser, type User } from '../services/auth';
import DashboardLayout from '../components/DashboardLayout';
import { useNavigate } from 'react-router-dom';
// import QRCodeStyling from 'qr-code-styling'; // Not used directly, but maybe by generateStaticQR? No, effectively unused in original or used by utils.
import { HexColorPicker } from 'react-colorful';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    FaShareAlt, FaBarcode, FaMusic, FaWifi, FaPlus, FaLock, FaPalette, FaLink, FaAddressCard, FaFile, FaList, FaGoogle, FaStore, FaLaptop, FaVideo, FaMagic, FaSave, FaImage, FaCloudUploadAlt, FaQrcode, FaUtensils, FaCrop
} from 'react-icons/fa';
import { generateAnimatedQR, generateStaticQR, blobToBase64 } from '../utils/qrGenerator'; // helper functions need to be typed too or exist
import UpgradeModal from '../components/UpgradeModal';
import MenuSelector from '../components/MenuSelector';

interface CreateQRProps {
    enableMenuModule?: boolean;
}

// --- INTERFACES ---

interface AccordionProps {
    title: string;
    children: React.ReactNode;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    icon?: React.ComponentType<{ className?: string }>;
    colorClass?: string;
}

const Accordion: React.FC<AccordionProps> = ({ title, children, isOpen, setIsOpen, icon: Icon, colorClass }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-shadow hover:shadow-md mb-6">
        <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
        >
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                {Icon && <Icon className={colorClass} />} {title}
            </h2>
            <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                ▼
            </span>
        </button>
        <div
            className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}
        >
            <div className="p-6 pt-0 border-t border-gray-50">
                {children}
            </div>
        </div>
    </div>
);

interface QRModule {
    id: string;
    label: string;
    icon: React.ComponentType;
}

interface WifiData {
    ssid: string;
    password: string;
    type: string;
}

interface VCardData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    mobile: string;
    company: string;
    title: string;
    website: string;
    street: string;
    city: string;
    zip: string;
    country: string;
}

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

interface UserWithSub extends User {
    subscriptionTier?: string;
}



const CreateQR: React.FC<CreateQRProps> = ({ enableMenuModule = false }) => {
    const { t } = useTranslation('qr');
    const [isTemplatesOpen, setIsTemplatesOpen] = useState<boolean>(false);
    const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);

    // MODULE CONFIG
    const QR_MODULES: QRModule[] = [
        { id: 'url', label: 'URL', icon: FaLink },
        { id: 'vcard', label: 'vCard', icon: FaAddressCard },
        { id: 'file', label: 'File', icon: FaFile },
        { id: 'linkpage', label: 'Link Page', icon: FaList },
        { id: 'google', label: 'Google Form', icon: FaGoogle },
        { id: 'app', label: 'App Stores', icon: FaStore },
        { id: 'landing', label: 'Landing Page', icon: FaLaptop },
        { id: 'smart', label: 'Smart URL', icon: FaShareAlt },
        { id: 'gs1', label: 'GS1 Digital', icon: FaBarcode },
        { id: 'mp3', label: 'MP3', icon: FaMusic },
        { id: 'video', label: 'Video', icon: FaVideo },
        { id: 'wifi', label: 'Wifi', icon: FaWifi },
        ...(enableMenuModule ? [{ id: 'menu', label: 'Menu', icon: FaUtensils }] : []),
        { id: 'text', label: 'More', icon: FaPlus },
    ];

    const [activeTab, setActiveTab] = useState<string>('url');

    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');

    // CONTENT STATES
    const [urlValue, setUrlValue] = useState<string>("");
    const [textValue, setTextValue] = useState<string>("");
    const [wifiData, setWifiData] = useState<WifiData>({ ssid: '', password: '', type: 'WPA' });
    const [vcard, setVcard] = useState<VCardData>({
        firstName: '', lastName: '', email: '', phone: '', mobile: '',
        company: '', title: '', website: '', street: '', city: '', zip: '', country: ''
    });

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [logoBase64, setLogoBase64] = useState<string | null>(null);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    const [backgroundImageFile, setBackgroundImageFile] = useState<File | null>(null);
    const [backgroundImageBase64, setBackgroundImageBase64] = useState<string | null>(null);
    const [backgroundImagePreview, setBackgroundImagePreview] = useState<string | null>(null);
    const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null);

    // GIF Background State
    const [backgroundGifFile, setBackgroundGifFile] = useState<File | null>(null);
    const [backgroundGifBase64, setBackgroundGifBase64] = useState<string | null>(null);
    const [backgroundGifPreview, setBackgroundGifPreview] = useState<string | null>(null);

    // Live Preview State
    const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);

    const [foregroundColor, setForegroundColor] = useState<string>('#000000');
    const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
    const [style, setStyle] = useState<string>('square');
    const [eyeStyle, setEyeStyle] = useState<string>('square');
    const [dotScale, setDotScale] = useState<number>(0.85);
    const [eyeScale, setEyeScale] = useState<number>(1.0);
    const [logoScale, setLogoScale] = useState<number>(0.4);
    const [ecLevel, setEcLevel] = useState<string>('H'); // H, Q, M, L

    // Animation state
    const [isAnimated, setIsAnimated] = useState<boolean>(false);
    const [animationType, setAnimationType] = useState<string>('NONE');
    const [animationFrames, setAnimationFrames] = useState<number>(10);
    const [backgroundVisibility, setBackgroundVisibility] = useState<number>(0.25); // Default 0.25 visibility = 0.75 dimming
    const [animationDuration, setAnimationDuration] = useState<number>(100);

    const canvasRef = useRef<HTMLDivElement>(null);

    const [canCreateDynamic, setCanCreateDynamic] = useState<boolean>(false);
    const [isDynamic, setIsDynamic] = useState<boolean>(false);

    // Frame State
    const [frame, setFrame] = useState<string>('none');
    const [frameColor, setFrameColor] = useState<string>('#000000');
    const [frameText, setFrameText] = useState<string>('');
    const [frameTextColor, setFrameTextColor] = useState<string>('#ffffff');
    const [frameTextPosition, setFrameTextPosition] = useState<string>('bottom');

    // Security State
    const [password, setPassword] = useState<string>('');
    const [emptyCenter, setEmptyCenter] = useState<boolean>(false);

    // File Upload State (for FILE/VIDEO/MP3 QR types)
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [uploadedFileUrl, setUploadedFileUrl] = useState<string>('');
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isUploading, setIsUploading] = useState<boolean>(false);

    // User Templates
    const [userTemplates, setUserTemplates] = useState<Template[]>([]);
    const [showSaveTemplateModal, setShowSaveTemplateModal] = useState<boolean>(false);
    const [newTemplateName, setNewTemplateName] = useState<string>('');

    const navigate = useNavigate();


    const fetchUserTemplates = async () => {
        try {
            const res = await axios.get<Template[]>('/templates');
            setUserTemplates(res.data);
        } catch (err) {
            console.error("Failed to fetch templates", err);
        }
    };

    const [usageStats, setUsageStats] = useState<any>(null);

    useEffect(() => {
        fetchUserTemplates();
        const user: any = getCurrentUser();
        if (user && user.subscriptionTier === 'PRO_MONTHLY') {
            setCanCreateDynamic(true);
        }
        fetchUsage();
    }, []);

    const fetchUsage = async () => {
        const { getUsageStats } = require('../services/auth');
        const stats = await getUsageStats();
        setUsageStats(stats);
    };

    const getUser = (): UserWithSub | null => {
        return getCurrentUser() as UserWithSub;
    }

    const handleSaveTemplate = async () => {
        const user = getUser();
        if (!user || user.subscriptionTier !== 'PRO_MONTHLY') {
            setShowUpgradeModal(true);
            return;
        }

        if (!newTemplateName.trim()) return;

        try {
            const payload: Partial<Template> = {
                name: newTemplateName,
                style,
                eyeStyle,
                foregroundColor,
                backgroundColor,
                dotScale,
                eyeScale,
                logoScale,
                ecLevel,
                logoBase64,
                backgroundImageBase64,
                backgroundGifBase64,
                frame, frameColor, frameText, frameTextColor, frameTextPosition
            };

            await axios.post('/templates', payload);
            toast.success(t('create.messages.template_saved'));
            setShowSaveTemplateModal(false);
            setNewTemplateName('');
            fetchUserTemplates();
        } catch (err) {
            toast.error(t('create.messages.failed_save'));
            console.error(err);
        }
    };

    const handleDeleteTemplate = async (e: React.MouseEvent, id: string | number) => {
        e.stopPropagation();
        if (!window.confirm(t('create.buttons.delete_template'))) return;
        try {
            await axios.delete(`/templates/${id}`);
            toast.success(t('create.messages.template_deleted'));
            fetchUserTemplates();
        } catch (err) {
            toast.error(t('create.messages.failed_delete'));
        }
    }

    const TEMPLATE_PRESETS: TemplatePreset[] = [
        {
            id: 'menu',
            name: 'Restaurant Menu',
            icon: '🍔',
            colors: { fg: '#E65100', bg: '#FFF3E0' },
            style: 'classy',
            eyeStyle: 'classy',
            dotScale: 0.9,
        },
        {
            id: 'wifi',
            name: 'WiFi Access',
            icon: '📶',
            colors: { fg: '#0277BD', bg: '#E1F5FE' },
            style: 'extra-rounded',
            eyeStyle: 'circle',
            dotScale: 1.0,
        },
        {
            id: 'social',
            name: 'Social Media',
            icon: '❤️',
            colors: { fg: '#D81B60', bg: '#FCE4EC' },
            style: 'dots',
            eyeStyle: 'rounded',
            dotScale: 0.85,
        },
        {
            id: 'dark',
            name: 'Dark Mode',
            icon: '🌑',
            colors: { fg: '#FFFFFF', bg: '#212121' },
            style: 'square',
            eyeStyle: 'square',
            dotScale: 0.9,
        },
        {
            id: 'eco',
            name: 'Eco Friendly',
            icon: '🌿',
            colors: { fg: '#2E7D32', bg: '#E8F5E9' },
            style: 'dots',
            eyeStyle: 'rounded',
            dotScale: 0.85,
        },
    ];

    const applyTemplate = (t: Template | TemplatePreset | any) => { // Using any to handle mixed type properties logic simply
        setForegroundColor(t.colors ? t.colors.fg : t.foregroundColor);
        setBackgroundColor(t.colors ? t.colors.bg : t.backgroundColor);
        setStyle(t.style);
        setEyeStyle(t.eyeStyle);
        setDotScale(t.dotScale);

        if (t.logoBase64) {
            setLogoBase64(t.logoBase64);
            setLogoPreview(`data:image/png;base64,${t.logoBase64}`);
        }
        if (t.backgroundImageBase64) {
            setBackgroundImageBase64(t.backgroundImageBase64);
            setBackgroundImagePreview(`data:image/png;base64,${t.backgroundImageBase64}`);
            setBackgroundGifBase64(null);
            setBackgroundGifPreview(null);
            setIsAnimated(false);
        }
        if (t.backgroundGifBase64) {
            setBackgroundGifBase64(t.backgroundGifBase64);
            setBackgroundGifPreview(`data:image/gif;base64,${t.backgroundGifBase64}`);
            setBackgroundImageBase64(null);
            setBackgroundImagePreview(null);
            setIsAnimated(true);
        }

        setFrame(t.frame || 'none');
        setFrameColor(t.frameColor || '#000000');
        setFrameText(t.frameText || '');
        setFrameTextColor(t.frameTextColor || '#ffffff');
        setFrameTextPosition(t.frameTextPosition || 'bottom');

        toast.info(`Applied ${t.name} template!`);
    };

    const getFinalContent = (): string => {
        switch (activeTab) {
            case 'url':
            case 'file':
            case 'linkpage':
            case 'google':
            case 'menu':
            case 'app':
            case 'landing':
            case 'smart':
            case 'gs1':
            case 'mp3':
            case 'video':
                return urlValue;

            case 'text':
                return textValue;

            case 'wifi':
                const { ssid, password, type } = wifiData;
                if (!ssid) return '';
                return `WIFI:T:${type};S:${ssid};P:${password};;`;

            case 'vcard':
                return `BEGIN:VCARD
VERSION:3.0
N:${vcard.lastName};${vcard.firstName};;;
FN:${vcard.firstName} ${vcard.lastName}
ORG:${vcard.company}
TITLE:${vcard.title}
TEL;TYPE=WORK,VOICE:${vcard.phone}
TEL;TYPE=CELL,VOICE:${vcard.mobile}
EMAIL:${vcard.email}
URL:${vcard.website}
ADR;TYPE=WORK:;;${vcard.street};${vcard.city};;${vcard.zip};${vcard.country}
END:VCARD`;

            default: return urlValue;
        }
    };

    const activeContent = getFinalContent();

    const uploadAsset = async (file: File): Promise<string> => {
        const user = getUser();
        if (!user) return '';

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(
                `/storage/upload/image/${user.username}`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            return response.data.url;
        } catch (error) {
            console.error("Asset upload failed", error);
            // toast.error("Failed to upload image asset"); // Optional: suppress to avoid spam if user didn't mean to
            return '';
        }
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
        setEmptyCenter(true); // Auto-enable empty center for logo

        // Upload asset to get URL
        uploadAsset(file).then(url => {
            if (url) setLogoUrl(url);
        });

        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                const base64 = reader.result.split(',')[1];
                setLogoBase64(base64);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleBackgroundImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setBackgroundImageFile(file);
        setBackgroundImagePreview(URL.createObjectURL(file));

        // Upload asset to get URL
        uploadAsset(file).then(url => {
            if (url) setBackgroundImageUrl(url);
        });

        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                const base64 = reader.result.split(',')[1];
                setBackgroundImageBase64(base64);
                setBackgroundGifFile(null);
                setBackgroundGifPreview(null);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleGifBackgroundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'image/gif') {
            toast.error(t('create.messages.upload_gif_error'));
            return;
        }

        setBackgroundGifFile(file);
        setBackgroundGifPreview(URL.createObjectURL(file));
        setBackgroundImageFile(null);
        setBackgroundImagePreview(null);
        setEmptyCenter(true); // Auto-enable empty center for GIF background
        setForegroundColor('auto'); // Auto-enable dual-tone color extraction

        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                const base64 = reader.result.split(',')[1];
                setBackgroundGifBase64(base64);
                setIsAnimated(true);
                setAnimationType('NONE');
            }
        };
        reader.readAsDataURL(file);
    };

    const handleFileUpload = async (file: File, type: string) => {
        if (!file) return;

        setIsUploading(true);
        setUploadProgress(0);

        const user = getUser();
        if (!user) {
            toast.error('Please login to upload files');
            setIsUploading(false);
            return;
        }

        // Check file size based on subscription tier
        const maxSize = user.subscriptionTier === 'FREE' ? 10 * 1024 * 1024 : 50 * 1024 * 1024; // 10MB or 50MB
        if (file.size > maxSize) {
            const limit = user.subscriptionTier === 'FREE' ? '10MB' : '50MB';
            toast.error(`File too large! Maximum size: ${limit}`);
            setIsUploading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);

            const endpoint = type === 'video' ? 'video' : type === 'file' ? 'image' : 'mp3';
            const response = await axios.post(
                `/storage/upload/${endpoint}/${user.username}`,
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
            setUploadedFileUrl(uploadedUrl);
            setUrlValue(uploadedUrl); // Set the URL for the QR code
            toast.success(t('create.messages.upload_success'));
        } catch (error: any) {
            console.error('Upload error:', error);
            if (error.response?.status === 413) {
                toast.error('File is too large for your subscription tier');
            } else if (error.response?.status === 429) {
                toast.error('Too many uploads. Please wait a moment.');
            } else {
                toast.error('Upload failed: ' + (error.response?.data?.message || error.message));
            }
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    // State to track the latest request to avoid race conditions
    const latestRequestId = useRef<number>(0);

    // Ref to track the previous configuration to PREVENT LOOPS using deep compare
    const prevConfigRef = useRef<string>('');

    // Effect to handle preview generation
    useEffect(() => {
        let isCancelled = false;

        // Function to generate preview
        const generatePreview = async () => {
            // Deep Compare Check
            const currentConfig = {
                activeContent,
                hasGif: !!backgroundGifFile,
                gifName: backgroundGifFile?.name,
                foregroundColor,
                backgroundColor,
                style,
                eyeStyle,
                dotScale,
                eyeScale,
                ecLevel,
                hasBgImg: !!backgroundImageFile,
                bgImgName: backgroundImageFile?.name,
                logoPreview,
                logoScale,
                emptyCenter,
                frame,
                frameColor,
                frameText,
                frameTextColor,
                frameTextPosition
            };
            const configSignature = JSON.stringify(currentConfig);
            if (configSignature === prevConfigRef.current) return;
            prevConfigRef.current = configSignature;

            if (!activeContent.trim()) {
                setPreviewUrl(null);
                setIsGenerating(false);
                return;
            }

            const currentRequestId = ++latestRequestId.current;
            setIsGenerating(true);
            try {
                let blob: Blob;

                if (backgroundGifFile) {
                    blob = await generateAnimatedQR(activeContent, backgroundGifFile, {
                        foregroundColor,
                        style,
                        eyeStyle,
                        dotScale,
                        eyeScale,
                        ecLevel,
                        logo: logoPreview,
                        emptyCenter,
                        backgroundDimming: 1 - backgroundVisibility, // Invert for generator (expects opacity)
                        frame, frameColor, frameText, frameTextColor, frameTextPosition
                    });
                } else {
                    blob = await generateStaticQR(activeContent, {
                        foregroundColor,
                        backgroundColor,
                        width: 640,
                        style,
                        eyeStyle,
                        dotScale,
                        eyeScale,
                        ecLevel,
                        emptyCenter,
                        logo: logoPreview,
                        backgroundImage: backgroundImagePreview || undefined, // Use preview or file logic
                        backgroundDimming: 1 - backgroundVisibility, // Shared logic
                        frame, frameColor, frameText, frameTextColor, frameTextPosition
                    });
                }

                if (!isCancelled && currentRequestId === latestRequestId.current) {
                    setPreviewBlob(blob);
                    if (previewUrl) URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(URL.createObjectURL(blob));
                }
            } catch (error: any) {
                if (!isCancelled && currentRequestId === latestRequestId.current) {
                    console.error('Preview generation error:', error);
                    // Show error to user so they know WHY it failed
                    toast.error(`Generation Failed: ${error?.message || 'Unknown Error'}`);
                }
            } finally {
                if (!isCancelled && currentRequestId === latestRequestId.current) setIsGenerating(false);
            }
        };

        // Debounce for static generation
        const timer = setTimeout(() => {
            generatePreview();
        }, 800);

        return () => {
            isCancelled = true;
            clearTimeout(timer);
        };

    }, [activeContent, backgroundGifFile, foregroundColor, backgroundColor, style, eyeStyle, dotScale, eyeScale, ecLevel, backgroundImageFile, logoPreview, logoScale, emptyCenter, backgroundVisibility, frame, frameColor, frameText, frameTextColor, frameTextPosition]); // Removed previewUrl to fix infinite loop

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!activeContent.trim()) {
                toast.error(t('create.messages.enter_content'));
                return;
            }

            if (!previewBlob) {
                toast.error(t('create.messages.wait_preview'));
                return;
            }

            const generatedImageBase64 = await blobToBase64(previewBlob);

            await axios.post('/qrcodes', {
                content: activeContent,
                title,
                description,
                generatedImageBase64,
                dynamic: isDynamic,
                foregroundColor,
                backgroundColor,
                style,
                eyeStyle,
                dotScale,
                eyeScale,
                animationType: backgroundGifFile ? 'NONE' : (isAnimated ? animationType : 'NONE'),
                animationFrames: isAnimated ? animationFrames : null,
                animationDuration: isAnimated ? animationDuration : null,
                animationData: null,
                password: password,
                logoUrl: logoUrl,
                backgroundImageUrl: backgroundImageUrl,
                // menuId removed from general creator
            });
            toast.success(t('create.messages.qr_created'));
            setTimeout(() => {
                navigate('/dashboard');
            }, 100);
        } catch (err) {
            console.error(err);
            toast.error(t('create.messages.qr_failed'));
        }
    };

    const renderInput = () => {
        switch (activeTab) {
            case 'linkpage':
            case 'google':
                return (
                    <div className="animate-fadeIn">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Target URL ({activeTab.toUpperCase()})</label>
                        <input
                            type="text"
                            value={urlValue}
                            onChange={(e) => setUrlValue(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            placeholder={placeholder}
                        />
                        <p className="text-xs text-gray-400 mt-2">Paste the link to your resource here.</p>
                    </div>
                );

            case 'menu':
                return (
                    <div className="animate-fadeIn">
                        <label className="block text-sm font-medium text-gray-700 mb-3">Select Menu</label>
                        <MenuSelector
                            onCreateMenu={() => navigate('/restaurant/menu')}
                            onSelectMenu={(menu: any) => {
                                const link = `${window.location.origin}/menu/${menu.id}`;
                                setUrlValue(link);
                                if (!title) setTitle(menu.name);
                                toast.success(`Selected menu: ${menu.name}`);
                            }}
                        />
                        {urlValue && (
                            <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-xs break-all">
                                Linked: {urlValue}
                            </div>
                        )}
                    </div>
                );

            case 'url':


                return (
                    <div className="animate-fadeIn">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Target URL ({activeTab.toUpperCase()})</label>
                        <input
                            type="text"
                            value={urlValue}
                            onChange={(e) => setUrlValue(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            placeholder="https://example.com"
                        />
                        <p className="text-xs text-gray-400 mt-2">Paste the link to your resource here.</p>
                    </div>
                );
            case 'wifi':
                return (
                    <div className="space-y-4 animate-fadeIn">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('create.labels.network_name')}</label>
                            <input type="text" value={wifiData.ssid} onChange={(e) => setWifiData({ ...wifiData, ssid: e.target.value })} placeholder={t('create.placeholders.wifi_ssid')} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('create.labels.password')}</label>
                            <input type="text" value={wifiData.password} onChange={(e) => setWifiData({ ...wifiData, password: e.target.value })} placeholder={t('create.placeholders.wifi_password')} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('create.labels.encryption')}</label>
                            <select value={wifiData.type} onChange={(e) => setWifiData({ ...wifiData, type: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white">
                                <option value="WPA">WPA/WPA2</option>
                                <option value="WEP">WEP</option>
                                <option value="nopass">No Encryption</option>
                            </select>
                        </div>
                    </div>
                );
            case 'vcard':
                return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
                        <input type="text" placeholder="First Name" value={vcard.firstName} onChange={(e) => setVcard({ ...vcard, firstName: e.target.value })} className="px-3 py-2 border rounded-xl" />
                        <input type="text" placeholder="Last Name" value={vcard.lastName} onChange={(e) => setVcard({ ...vcard, lastName: e.target.value })} className="px-3 py-2 border rounded-xl" />
                        <input type="email" placeholder="Email" value={vcard.email} onChange={(e) => setVcard({ ...vcard, email: e.target.value })} className="px-3 py-2 border rounded-xl" />
                        <input type="tel" placeholder="Mobile Phone" value={vcard.mobile} onChange={(e) => setVcard({ ...vcard, mobile: e.target.value })} className="px-3 py-2 border rounded-xl" />
                        <input type="tel" placeholder="Work Phone" value={vcard.phone} onChange={(e) => setVcard({ ...vcard, phone: e.target.value })} className="px-3 py-2 border rounded-xl" />
                        <input type="text" placeholder="Company" value={vcard.company} onChange={(e) => setVcard({ ...vcard, company: e.target.value })} className="px-3 py-2 border rounded-xl" />
                        <input type="text" placeholder="Job Title" value={vcard.title} onChange={(e) => setVcard({ ...vcard, title: e.target.value })} className="px-3 py-2 border rounded-xl" />
                        <input type="url" placeholder="Website" value={vcard.website} onChange={(e) => setVcard({ ...vcard, website: e.target.value })} className="px-3 py-2 border rounded-xl" />
                        <input type="text" placeholder="Street" value={vcard.street} onChange={(e) => setVcard({ ...vcard, street: e.target.value })} className="px-3 py-2 border rounded-xl" />
                        <input type="text" placeholder="City" value={vcard.city} onChange={(e) => setVcard({ ...vcard, city: e.target.value })} className="px-3 py-2 border rounded-xl" />
                        <input type="text" placeholder="Zip" value={vcard.zip} onChange={(e) => setVcard({ ...vcard, zip: e.target.value })} className="px-3 py-2 border rounded-xl" />
                        <input type="text" placeholder="Country" value={vcard.country} onChange={(e) => setVcard({ ...vcard, country: e.target.value })} className="px-3 py-2 border rounded-xl" />
                    </div>
                );
            case 'file':
            case 'video':
            case 'mp3':
                const fileType = activeTab === 'video' ? 'video/*' : activeTab === 'mp3' ? 'audio/*' : '*/*';
                const typeLabel = activeTab === 'video' ? 'Video' : activeTab === 'mp3' ? 'Audio' : 'File';
                const user = getUser();
                const maxSize = user?.subscriptionTier === 'FREE' ? '10MB' : '50MB';

                return (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                            <p className="text-sm text-blue-800">
                                <strong>File Size Limit:</strong> {maxSize} ({user?.subscriptionTier || 'FREE'} tier)
                            </p>
                        </div>

                        {uploadedFileUrl ? (
                            <div className="space-y-3">
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-green-800 mb-1">✓ File Uploaded Successfully</p>
                                            <p className="text-xs text-green-600 break-all">{uploadedFileUrl}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setUploadedFile(null);
                                                setUploadedFileUrl('');
                                                setUrlValue('');
                                            }}
                                            className="ml-3 text-red-500 hover:text-red-700 font-bold"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload {typeLabel}
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                                    <input
                                        type="file"
                                        accept={fileType}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setUploadedFile(file);
                                                handleFileUpload(file, activeTab);
                                            }
                                        }}
                                        className="hidden"
                                        id="file-upload"
                                        disabled={isUploading}
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className={`cursor-pointer inline-flex flex-col items-center ${isUploading ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                    >
                                        <FaCloudUploadAlt className="text-5xl text-gray-400 mb-3" />
                                        <span className="text-sm text-gray-600 mb-1">
                                            {isUploading ? 'Uploading...' : `Click to upload ${typeLabel.toLowerCase()}`}
                                        </span>
                                        <span className="text-xs text-gray-400">Max: {maxSize}</span>
                                    </label>
                                </div>

                                {isUploading && (
                                    <div className="mt-4">
                                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                                            <span>Uploading...</span>
                                            <span>{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            case 'text':
                return (
                    <div className="animate-fadeIn">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Text</label>
                        <textarea
                            value={textValue}
                            onChange={(e) => setTextValue(e.target.value)}
                            placeholder="Type anything here..."
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                        />
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50/50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-8">

                        <div className="flex-1 space-y-6">

                            <div>
                                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t('create.title')}</h1>
                                <p className="text-gray-500 mt-1">{t('create.subtitle')}</p>
                            </div>

                            <Accordion
                                title={t('create.sections.templates')}
                                icon={FaMagic}
                                colorClass="text-purple-600"
                                isOpen={isTemplatesOpen}
                                setIsOpen={setIsTemplatesOpen}
                            >
                                <div className="overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide pt-4">
                                    <div className="flex gap-4">
                                        {TEMPLATE_PRESETS.map((t) => (
                                            <div key={t.id} onClick={() => applyTemplate(t)}
                                                className="flex-shrink-0 w-32 cursor-pointer bg-white rounded-xl shadow-sm border border-gray-100 p-3 hover:shadow-md hover:border-blue-300 transition-all text-center group">
                                                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{t.icon}</div>
                                                <p className="text-xs font-bold text-gray-700">{t.name}</p>
                                                <div className="flex justify-center mt-2 gap-1">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.colors.fg }}></div>
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.colors.bg }}></div>
                                                </div>
                                            </div>
                                        ))}
                                        {userTemplates.map((t) => (
                                            <div key={t.id} onClick={() => applyTemplate({
                                                name: t.name,
                                                foregroundColor: t.foregroundColor,
                                                backgroundColor: t.backgroundColor,
                                                style: t.style,
                                                eyeStyle: t.eyeStyle,
                                                dotScale: t.dotScale,
                                                logoBase64: t.logoBase64,
                                                backgroundImageBase64: t.backgroundImageBase64,
                                                backgroundGifBase64: t.backgroundGifBase64,
                                                frame: t.frame,
                                                frameColor: t.frameColor,
                                                frameText: t.frameText,
                                                frameTextColor: t.frameTextColor,
                                                frameTextPosition: t.frameTextPosition
                                            })}
                                                className="flex-shrink-0 w-32 cursor-pointer bg-white rounded-xl shadow-sm border-2 border-dashed border-purple-200 p-3 hover:shadow-md hover:border-purple-400 transition-all text-center group relative">
                                                <button onClick={(e) => handleDeleteTemplate(e, t.id)} className="absolute top-1 right-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                                                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">💾</div>
                                                <p className="text-xs font-bold text-gray-700 truncate">{t.name}</p>
                                                <div className="flex justify-center mt-2 gap-1">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.foregroundColor }}></div>
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.backgroundColor }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Accordion>

                            <form onSubmit={handleSubmit} className="space-y-6">

                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-shadow hover:shadow-md">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <FaQrcode className="text-blue-600" /> {t('create.sections.basic_info')}
                                    </h2>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('create.labels.title')}</label>
                                                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                                    placeholder={t('create.placeholders.title')} required />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('create.labels.description')}</label>
                                                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                                    placeholder={t('create.placeholders.description')} />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                                    Dynamic QR Code
                                                    {!canCreateDynamic && <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">PRO</span>}
                                                    {canCreateDynamic && usageStats && (
                                                        <span className="ml-1 bg-indigo-50 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded border border-indigo-100 font-bold">
                                                            Quota: {usageStats.dynamicQrCreated} / {usageStats.dynamicQrLimit}
                                                        </span>
                                                    )}
                                                </h3>
                                                <p className="text-xs text-gray-500 mt-0.5">Edit content anytime without changing the QR image.</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={isDynamic}
                                                    onChange={(e) => {
                                                        if (!canCreateDynamic) {
                                                            setShowUpgradeModal(true);
                                                            return;
                                                        }
                                                        // Limit check
                                                        if (e.target.checked && usageStats && usageStats.dynamicQrCreated >= usageStats.dynamicQrLimit) {
                                                            toast.error("You have reached your dynamic QR quota. Update your plan or delete existing codes.");
                                                            return;
                                                        }
                                                        setIsDynamic(e.target.checked);
                                                    }}
                                                />
                                                <div className={`w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${isDynamic ? 'peer-checked:bg-purple-600' : 'bg-gray-200'}`}></div>
                                            </label>
                                        </div>

                                        <div className="mb-4 overflow-x-auto py-4 -mx-2 px-2 scrollbar-hide">
                                            <div className="flex gap-3">
                                                {QR_MODULES.map(m => (
                                                    <button
                                                        type="button"
                                                        key={m.id}
                                                        onClick={() => setActiveTab(m.id)}
                                                        className={`flex flex-col items-center gap-1 min-w-[60px] p-2 rounded-xl transition-all ${activeTab === m.id ? 'bg-indigo-50 text-indigo-600 ring-2 ring-indigo-500 ring-offset-2' : 'hover:bg-gray-50 text-gray-500 hover:text-gray-900 border border-transparent hover:border-gray-200'}`}
                                                    >
                                                        <div className="text-xl"><m.icon /></div>
                                                        <span className="text-[10px] font-semibold whitespace-nowrap">{m.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            {renderInput()}
                                        </div>

                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-shadow hover:shadow-md">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <FaPalette className="text-purple-600" /> Appearance
                                    </h2>

                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-3">QR Pattern Style</label>
                                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                                            {['square', 'dots', 'rounded', 'classy', 'classy-rounded', 'extra-rounded'].map((opt) => (
                                                <div key={opt}
                                                    onClick={() => setStyle(opt)}
                                                    className={`cursor-pointer rounded-lg p-2 border-2 text-center text-xs font-medium transition-all ${style === opt ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-100 hover:border-gray-200 text-gray-600'}`}>
                                                    <div className={`w-full h-8 mb-1 bg-current opacity-20 rounded-md ${opt === 'dots' ? 'rounded-full' : ''}`}></div>
                                                    {opt}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Foreground Color</label>
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 rounded-full border shadow-sm" style={{ backgroundColor: foregroundColor === 'auto' ? '#9333ea' : foregroundColor }}></div>
                                                <input type="text" value={foregroundColor} onChange={(e) => setForegroundColor(e.target.value)} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                                            </div>
                                            {backgroundGifFile && (
                                                <button
                                                    onClick={() => setForegroundColor('auto')}
                                                    className={`w-full mb-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${foregroundColor === 'auto' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'}`}
                                                >
                                                    {foregroundColor === 'auto' ? '✓ Auto Colors (GIF Palette)' : '🎨 Extract Colors from GIF'}
                                                </button>
                                            )}
                                            {foregroundColor !== 'auto' && (
                                                <div className="mt-3">
                                                    <HexColorPicker color={foregroundColor} onChange={setForegroundColor} style={{ width: '100%' }} />
                                                </div>
                                            )}
                                            {foregroundColor === 'auto' && (
                                                <p className="text-xs text-purple-600 font-medium mt-2">
                                                    Colors will be automatically extracted from your GIF background
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full border shadow-sm" style={{ backgroundColor: backgroundColor }}></div>
                                                <input type="text" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                                            </div>
                                            <div className="mt-3">
                                                <HexColorPicker color={backgroundColor} onChange={setBackgroundColor} style={{ width: '100%' }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <Accordion
                                        title={t('create.sections.security')}
                                        icon={FaLock}
                                        colorClass="text-red-500"
                                        isOpen={true}
                                        setIsOpen={() => { }}
                                    >
                                        <div className="pt-2">
                                            <div className="flex items-start gap-4 p-4 bg-red-50 rounded-lg border border-red-100">
                                                <div className="flex-1">
                                                    <label className="block text-sm font-semibold text-gray-800 mb-1">
                                                        Password Protection
                                                    </label>
                                                    <p className="text-xs text-gray-500 mb-3">
                                                        Restrict access to your QR code content. Scanners must enter this password to proceed.
                                                    </p>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <FaLock className="text-gray-400" />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            placeholder="Set a password (Optional)"
                                                            value={password}
                                                            onChange={(e) => {
                                                                const user = getUser();
                                                                if (!user || user.subscriptionTier !== 'PRO_MONTHLY') {
                                                                    setShowUpgradeModal(true);
                                                                    return;
                                                                }
                                                                setPassword(e.target.value);
                                                            }}
                                                            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 text-sm"
                                                        />
                                                    </div>
                                                    {!getUser()?.subscriptionTier?.includes('PRO') && (
                                                        <div className="mt-2 flex items-center gap-1 text-xs text-amber-600 font-medium">
                                                            <FaLock size={10} /> Pro Feature
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Accordion>
                                </div>

                                <div className="mt-6">
                                    <Accordion
                                        title={t('create.sections.advanced')}
                                        icon={FaPalette}
                                        colorClass="text-purple-600"
                                        isOpen={isAdvancedOpen}
                                        setIsOpen={setIsAdvancedOpen}
                                    >
                                        <div className="mb-6 pt-2">
                                            <label className="block text-xs font-medium text-gray-500 mb-2">Eye Style (Position Patterns)</label>
                                            <div className="flex gap-3">
                                                {['square', 'circle', 'rounded'].map((opt) => (
                                                    <div key={opt}
                                                        onClick={() => setEyeStyle(opt)}
                                                        className={`cursor-pointer rounded-lg px-3 py-2 border text-xs font-medium transition-all ${eyeStyle === opt ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}>
                                                        {opt === 'square' && 'Square'}
                                                        {opt === 'circle' && 'Circle'}
                                                        {opt === 'rounded' && 'Rounded'}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <label className="block text-xs font-medium text-gray-500 mb-2">Density (Error Correction)</label>
                                            <div className="flex gap-2">
                                                {[
                                                    { val: 'H', label: 'High (Robust)' },
                                                    { val: 'Q', label: 'Medium' },
                                                    { val: 'L', label: 'Low (Sparse)' }
                                                ].map((opt) => (
                                                    <div key={opt.val}
                                                        onClick={() => setEcLevel(opt.val)}
                                                        className={`cursor-pointer rounded-lg px-3 py-2 border text-xs font-medium flex-1 text-center transition-all ${ecLevel === opt.val ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}>
                                                        {opt.label}
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-1">Lower density = Fewer dots, but less resistant to damage.</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <div className="flex justify-between mb-1">
                                                    <label className="text-xs font-medium text-gray-500">Dot Scale</label>
                                                    <span className="text-xs font-bold text-blue-600">{Math.round(dotScale * 100)}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0.5"
                                                    max="1.0"
                                                    step="0.05"
                                                    value={dotScale}
                                                    onChange={(e) => setDotScale(parseFloat(e.target.value))}
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                                />
                                            </div>

                                            <div>
                                                <div className="flex justify-between mb-1">
                                                    <label className="text-xs font-medium text-gray-500">Logo Scale</label>
                                                    <span className="text-xs font-bold text-blue-600">{Math.round(logoScale * 100)}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0.2"
                                                    max="0.6"
                                                    step="0.05"
                                                    value={logoScale}
                                                    onChange={(e) => setLogoScale(parseFloat(e.target.value))}
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                                />
                                            </div>

                                            <div>
                                                <div className="flex justify-between mb-1">
                                                    <label className="text-xs font-medium text-gray-500">Eye Scale</label>
                                                    <span className="text-xs font-bold text-blue-600">{Math.round(eyeScale * 100)}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0.5"
                                                    max="1.0"
                                                    step="0.05"
                                                    value={eyeScale}
                                                    onChange={(e) => setEyeScale(parseFloat(e.target.value))}
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                                />
                                            </div>
                                        </div>
                                    </Accordion>
                                </div>

                                <div className="mt-6">
                                    <Accordion
                                        title={t('create.sections.frames')}
                                        icon={FaCrop}
                                        colorClass="text-pink-600"
                                        isOpen={true}
                                        setIsOpen={() => { }}
                                    >
                                        <div className="mb-6 pt-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-3">Frame Style</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {['none', 'simple', 'balloon'].map(opt => (
                                                    <div key={opt} onClick={() => setFrame(opt)}
                                                        className={`cursor-pointer rounded-lg p-3 border-2 text-center text-xs font-bold uppercase transition-all ${frame === opt ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-gray-100 hover:border-gray-200 text-gray-600'}`}>
                                                        {opt}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {frame !== 'none' && (
                                            <div className="space-y-4 animate-fadeIn">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Frame Color</label>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded border shadow-sm" style={{ backgroundColor: frameColor }}></div>
                                                        <input type="text" value={frameColor} onChange={(e) => setFrameColor(e.target.value)} className="flex-1 px-3 py-1 border border-gray-200 rounded text-sm" />
                                                    </div>
                                                    <div className="mt-2">
                                                        <HexColorPicker color={frameColor} onChange={setFrameColor} style={{ width: '100%', height: '100px' }} />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Custom Text</label>
                                                    <input type="text" value={frameText} onChange={(e) => setFrameText(e.target.value)} placeholder="SCAN ME" className="w-full px-3 py-2 border rounded-lg text-sm" />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 mb-1">Text Position</label>
                                                        <div className="flex bg-gray-100 p-1 rounded-lg">
                                                            <button type="button" onClick={() => setFrameTextPosition('top')} className={`flex-1 py-1 text-xs rounded-md ${frameTextPosition === 'top' ? 'bg-white shadow text-pink-600 font-bold' : 'text-gray-500'}`}>Top</button>
                                                            <button type="button" onClick={() => setFrameTextPosition('bottom')} className={`flex-1 py-1 text-xs rounded-md ${frameTextPosition === 'bottom' ? 'bg-white shadow text-pink-600 font-bold' : 'text-gray-500'}`}>Bottom</button>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 mb-1">Text Color</label>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded border" style={{ backgroundColor: frameTextColor }}></div>
                                                            <input type="color" value={frameTextColor} onChange={(e) => setFrameTextColor(e.target.value)} className="w-full h-8 p-0 border-0 rounded" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </Accordion>
                                </div>

                                {showSaveTemplateModal && (
                                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                        <div className="bg-white p-6 rounded-xl shadow-xl w-80">
                                            <h3 className="font-bold text-lg mb-4">{t('create.buttons.save_template')}</h3>
                                            <input
                                                autoFocus
                                                type="text"
                                                placeholder={t('create.placeholders.template_name')}
                                                value={newTemplateName}
                                                onChange={e => setNewTemplateName(e.target.value)}
                                                className="w-full border p-2 rounded mb-4"
                                            />
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => setShowSaveTemplateModal(false)} className="px-3 py-1 text-gray-500">Cancel</button>
                                                <button onClick={handleSaveTemplate} className="px-3 py-1 bg-purple-600 text-white rounded">Save</button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-shadow hover:shadow-md">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <FaImage className="text-pink-600" /> {t('create.sections.branding')}
                                    </h2>

                                    <div className="mb-6">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm font-medium text-gray-700">Logo (Center Image)</label>
                                            <label className="flex items-center gap-2 cursor-pointer text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded-md">
                                                <input
                                                    type="checkbox"
                                                    checked={emptyCenter}
                                                    onChange={(e) => setEmptyCenter(e.target.checked)}
                                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                Empty Center
                                            </label>
                                            {logoPreview && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setLogoFile(null);
                                                        setLogoPreview(null);
                                                        setLogoBase64(null);
                                                        if (!backgroundGifFile) setEmptyCenter(false); // Reset if no GIF
                                                    }}
                                                    className="text-xs text-red-500 hover:text-red-700"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                        <div className="relative group">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleLogoChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div className={`w-full h-24 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 transition-all ${logoPreview ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-gray-50 text-gray-400 group-hover:border-purple-300'}`}>
                                                {logoPreview ? (
                                                    <img src={logoPreview} alt="Logo" className="h-20 w-20 object-contain rounded-md" />
                                                ) : (
                                                    <>
                                                        <FaCloudUploadAlt className="text-2xl" />
                                                        <span className="text-sm font-medium">Upload Logo</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm font-medium text-gray-700">Background Image (Static)</label>
                                            {backgroundImagePreview && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setBackgroundImageFile(null);
                                                        setBackgroundImagePreview(null);
                                                        setBackgroundImageBase64(null);
                                                    }}
                                                    className="text-xs text-red-500 hover:text-red-700"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                        <div className="relative group">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleBackgroundImageChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div className={`w-full h-24 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 transition-all ${backgroundImagePreview ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50 text-gray-400 group-hover:border-blue-300'}`}>
                                                {backgroundImagePreview ? (
                                                    <img src={backgroundImagePreview} alt="BG" className="h-full w-full object-cover rounded-md opacity-70" />
                                                ) : (
                                                    <>
                                                        <FaImage className="text-2xl" />
                                                        <span className="text-sm font-medium">Upload Image Background</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-2">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm font-medium text-gray-700">GIF Background (Animated)</label>
                                            {backgroundGifPreview && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setBackgroundGifFile(null);
                                                        setBackgroundGifPreview(null);
                                                        setBackgroundGifBase64(null);
                                                        setIsAnimated(false);
                                                        if (!logoFile) setEmptyCenter(false); // Reset if no logo
                                                    }}
                                                    className="text-xs text-red-500 hover:text-red-700"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                        <div className="relative group">
                                            <input
                                                type="file"
                                                accept="image/gif"
                                                onChange={handleGifBackgroundChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div className={`w-full h-24 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 transition-all ${backgroundGifPreview ? 'border-pink-500 bg-pink-50' : 'border-gray-200 bg-gray-50 text-gray-400 group-hover:border-pink-300'}`}>
                                                {backgroundGifPreview ? (
                                                    <div className="flex items-center gap-2">
                                                        <img src={backgroundGifPreview} alt="GIF" className="h-20 w-auto object-contain rounded-md" />
                                                        <span className="text-xs font-bold text-pink-700">GIF Loaded</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <FaVideo className="text-2xl" />
                                                        <span className="text-sm font-medium">Upload GIF Background</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Background Visibility Slider (GIF or Static Image) */}
                                        {(backgroundGifPreview || backgroundImagePreview) && (
                                            <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100 animate-fadeIn">
                                                <div className="flex justify-between items-center mb-1">
                                                    <label className="block text-xs font-bold text-gray-700 flex items-center gap-1">
                                                        Background Visibility <span className="font-normal text-gray-400">(Vividness)</span>
                                                    </label>
                                                    <span className="text-xs font-mono text-purple-600 bg-purple-50 px-1 rounded">{Math.round(backgroundVisibility * 100)}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="1"
                                                    step="0.05"
                                                    value={backgroundVisibility}
                                                    onChange={(e) => setBackgroundVisibility(parseFloat(e.target.value))}
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600 hover:accent-purple-700"
                                                />
                                                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                                    <span>Subtle (Scannable)</span>
                                                    <span>Vivid (Full Color)</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Save as Template Button */}
                                    <div className="mt-6 pt-4 border-t border-gray-100">
                                        <button
                                            type="button"
                                            onClick={() => setShowSaveTemplateModal(true)}
                                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                        >
                                            <FaSave className="text-lg" />
                                            <span>{t('create.buttons.save_template')}</span>
                                        </button>
                                        <p className="text-xs text-gray-500 text-center mt-2">
                                            {t('create.info.save_design')}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        className="w-full py-4 bg-gray-900 duration-300 hover:bg-gray-800 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2 text-lg"
                                    >
                                        <FaSave /> Create QR Code
                                    </button>
                                </div>

                            </form>
                        </div>

                        <div className="lg:min-w-[550px] lg:max-w-[600px]">
                            <div className="sticky top-6">
                                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                        <h3 className="font-bold text-gray-700">Live Preview</h3>
                                        {isGenerating && <span className="text-xs text-blue-600 animate-pulse font-semibold">Generating...</span>}
                                    </div>

                                    <div className="aspect-square bg-gray-100/50 flex items-center justify-center relative p-8">
                                        <div ref={canvasRef} className="hidden"></div>
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-contain shadow-sm rounded-lg" />
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 text-gray-400">
                                                <div className="text-5xl opacity-20"><FaQrcode /></div>
                                                <span className="text-sm">Preview will appear here</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 bg-white">
                                        <p className="text-xs text-gray-500 text-center">
                                            {isDynamic ? "Dynamic QR (Editable Content)" : "Static QR (Permanent Content)"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
                <UpgradeModal
                    isOpen={showUpgradeModal}
                    onClose={() => setShowUpgradeModal(false)}
                    featureName="Dynamic QR Codes"
                />
            </div>
        </DashboardLayout>
    );
}

export default CreateQR;
