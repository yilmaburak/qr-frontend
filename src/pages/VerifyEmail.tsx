import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from '../services/api';
import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const VerifyEmail: React.FC = () => {
    const { t } = useTranslation('auth');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const tokenParam = searchParams.get('token');
        if (!tokenParam) {
            setError(t('verify_email.error_token'));
            setLoading(false);
        } else {
            setToken(tokenParam);
            verifyEmailToken(tokenParam);
        }
    }, [searchParams]);

    const verifyEmailToken = async (token: string) => {
        try {
            await axios.post(`/auth/verify-email?token=${token}`);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            setError(err.response?.data?.error || t('verify_email.error_generic'));
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">{t('verify_email.verifying')}</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaCheckCircle className="text-green-600 text-3xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('verify_email.success_title')}</h2>
                    <p className="text-gray-600 mb-6">
                        {t('verify_email.success_message')}
                    </p>
                    <Link
                        to="/login"
                        className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                    >
                        {t('verify_email.go_to_login')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaExclamationTriangle className="text-red-600 text-3xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('verify_email.failed_title')}</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <div className="space-y-3">
                    <Link
                        to="/login"
                        className="block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                    >
                        {t('verify_email.go_to_login')}
                    </Link>
                    <p className="text-sm text-gray-500">
                        {t('verify_email.need_help')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
