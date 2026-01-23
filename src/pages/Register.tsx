import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUserPlus, FaUser, FaEnvelope, FaLock, FaGlobe } from 'react-icons/fa';
import { register, getCountries } from '../services/auth';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const Register: React.FC = () => {
    const { t } = useTranslation('auth');
    const { executeRecaptcha } = useGoogleReCaptcha();
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [countryId, setCountryId] = useState<string>('');
    const [countries, setCountries] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const { register: authRegister } = useAuth();

    useEffect(() => {
        const fetchCountries = async () => {
            const data = await getCountries();
            setCountries(data);
            if (data.length > 0) {
                // Try to find Turkey or default to first
                const tr = data.find(c => c.code === 'TR' || c.name.toLowerCase() === 'turkey');
                setCountryId(tr ? tr.id : data[0].id);
            }
        };
        fetchCountries();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!executeRecaptcha) {
            setError('reCAPTCHA not initialized');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const captchaToken = await executeRecaptcha('register');

            const response = await register({
                username,
                email,
                password,
                captchaToken,
                countryId
            });

            if (response.token) {
                // Auto-login successful using Context
                authRegister(response.token, response);

                alert(t('register.success_registered'));
                navigate('/qr/dashboard');
            } else {
                // Fallback if no token (old behavior or error)
                navigate('/login');
            }
        } catch (err: any) {
            // Better error handling - show actual error from backend
            let errorMessage = t('register.error_generic') || 'Registration failed. Please try again.';

            if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }

            console.error('Registration error:', err);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="bg-indigo-50 p-3 rounded-full">
                        <FaUserPlus className="text-3xl text-indigo-600" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">{t('register.title')}</h2>
                <p className="text-center text-gray-500 mb-8">{t('register.subtitle')}</p>

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
                            placeholder={t('register.username_label')}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 placeholder-gray-400 transition-all"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaEnvelope className="text-gray-400" />
                        </div>
                        <input
                            type="email"
                            placeholder={t('register.email_label')}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 placeholder-gray-400 transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaLock className="text-gray-400" />
                        </div>
                        <input
                            type="password"
                            placeholder={t('register.password_label')}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 placeholder-gray-400 transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaGlobe className="text-gray-400" />
                        </div>
                        <select
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 placeholder-gray-400 transition-all appearance-none"
                            value={countryId}
                            onChange={(e) => setCountryId(e.target.value)}
                            required
                        >
                            <option value="" disabled>{t('register.select_country') || 'Select Country'}</option>
                            {countries.map((country) => (
                                <option key={country.id} value={country.id}>
                                    {country.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? t('common.loading') : t('register.register_button')}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm">
                    <p className="text-gray-500">
                        {t('register.have_account')}{' '}
                        <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
                            {t('register.signin_link')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;
