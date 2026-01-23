import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import QRCode from 'qrcode';
import { FaClock, FaCheckCircle } from 'react-icons/fa';
import type { User } from '../services/auth';

interface AccessPassData {
    token: string;
}

const MyAccessPass: React.FC = () => {
    const { t } = useTranslation('qr');
    // const [token, setToken] = useState<string>(''); // Unused
    const [qrValues, setQrValues] = useState<string>('');
    const [timeLeft, setTimeLeft] = useState<number>(30);
    const [loading, setLoading] = useState<boolean>(true);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Parse user safely
    const userStr = localStorage.getItem('user');
    const user: User = userStr ? JSON.parse(userStr) : {} as User;

    const fetchToken = async () => {
        try {
            const res = await api.get<AccessPassData>('/entrance/my-pass');
            // setToken(res.data.token);
            setQrValues(res.data.token); // Format: "userId:code"
            setTimeLeft(30);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch pass token", err);
        }
    };

    useEffect(() => {
        fetchToken();
        const interval = setInterval(() => {
            fetchToken();
        }, 30000); // Fetch every 30s

        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => {
            clearInterval(interval);
            clearInterval(timer);
        };
    }, []);

    useEffect(() => {
        if (qrValues && canvasRef.current) {
            QRCode.toCanvas(canvasRef.current, qrValues, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#ffffff',
                },
            }, (error) => {
                if (error) console.error(error);
            });
        }
    }, [qrValues]);

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center">
                    <h1 className="text-3xl font-bold mb-2">{t('access_pass.title')}</h1>
                    <p className="opacity-80">{t('access_pass.subtitle')}</p>
                </div>

                <div className="p-8 flex flex-col items-center">
                    {/* User Info */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-600">
                            {user.firstName ? user.firstName[0] : (user.username?.[0]?.toUpperCase() || '?')}
                        </div>
                        <div className="text-left">
                            <h2 className="text-xl font-bold text-gray-800">{user.firstName} {user.lastName}</h2>
                            <p className="text-gray-500">{user.email}</p>
                            <span className="inline-block mt-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                {Array.isArray(user.role) ? user.role.join(', ') : user.role}
                            </span>
                        </div>
                    </div>

                    {/* QR Code */}
                    <div className="bg-white p-4 rounded-xl shadow-inner border-2 border-dashed border-gray-200 mb-6 relative">
                        <canvas ref={canvasRef} className="mx-auto" />
                        {loading && <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">{t('access_pass.loading')}</div>}
                    </div>

                    {/* Timer */}
                    <div className="flex items-center gap-2 text-gray-500 font-medium bg-gray-100 px-4 py-2 rounded-full mb-8">
                        <FaClock className="text-indigo-500 animate-pulse" />
                        <span>{t('access_pass.refreshes_in')} <span className="text-indigo-600 font-bold">{timeLeft}s</span></span>
                    </div>

                    {/* Instructions */}
                    <div className="w-full max-w-md bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                            <FaCheckCircle /> {t('access_pass.instructions_title')}
                        </h3>
                        <ul className="text-sm text-blue-700 space-y-2">
                            <li>• {t('access_pass.instruction_1')}</li>
                            <li>• {t('access_pass.instruction_2')}</li>
                            <li>• {t('access_pass.instruction_3')}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyAccessPass;
