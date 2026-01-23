import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaUserShield, FaUser, FaLock } from 'react-icons/fa';
import { login } from '../services/auth';
import { useTranslation } from 'react-i18next';

const AccessLogin: React.FC = () => {
    const { t } = useTranslation('auth');
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const { login: authLogin } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const response = await login({ username, password });
            // Update AuthContext state
            authLogin(response.token, response);
            // Redirect to Access Dashboard
            navigate('/access');
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || t('login.error_invalid');
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-800">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="bg-slate-100 p-3 rounded-full">
                        <FaUserShield className="text-3xl text-slate-800" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">{t('access_login.title')}</h2>
                <p className="text-center text-gray-500 mb-8">{t('access_login.subtitle')}</p>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg relative mb-6 text-sm" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaUser className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder={t('login.username_label')}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent text-gray-800 placeholder-gray-400 transition-all"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaLock className="text-gray-400" />
                        </div>
                        <input
                            type="password"
                            placeholder={t('login.password_placeholder')}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent text-gray-800 placeholder-gray-400 transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex justify-end">
                        <Link to="/forgot-password" className="text-sm text-slate-600 hover:text-slate-800 font-semibold">
                            {t('login.forgot_password')}
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-slate-800 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? t('access_login.button_loading') : t('access_login.button')}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AccessLogin;
