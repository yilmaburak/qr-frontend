import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaLock, FaCheckCircle } from 'react-icons/fa';
import { resetPassword } from '../services/auth';
import { useTranslation } from 'react-i18next';

const ResetPassword: React.FC = () => {
    const { t } = useTranslation('auth');
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            setError(t('reset_password.error_invalid_token'));
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError(t('reset_password.error_mismatch'));
            return;
        }

        setIsLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (token) {
                await resetPassword(token, password);
                setMessage(t('reset_password.success_message'));
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (err: any) {
            setError(err.message || t('reset_password.error_generic'));
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) return <div className="text-center mt-10">{t('reset_password.invalid_url')}</div>;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="bg-indigo-50 p-3 rounded-full">
                        <FaLock className="text-3xl text-indigo-600" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">{t('reset_password.title')}</h2>
                <p className="text-center text-gray-500 mb-8">{t('reset_password.subtitle')}</p>

                {message && (
                    <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg relative mb-6 text-sm flex items-center gap-2" role="alert">
                        <FaCheckCircle /> <span className="block sm:inline">{message}</span>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg relative mb-6 text-sm" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaLock className="text-gray-400" />
                        </div>
                        <input
                            type="password"
                            placeholder={t('reset_password.new_password')}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 placeholder-gray-400 transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaLock className="text-gray-400" />
                        </div>
                        <input
                            type="password"
                            placeholder={t('reset_password.confirm_password')}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 placeholder-gray-400 transition-all"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? t('reset_password.resetting') : t('reset_password.reset_button')}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword;
