import { useState } from 'react';
import { forgotPassword } from '../services/auth';
import { useTranslation } from 'react-i18next';

interface Status {
    type: 'success' | 'error';
    msg: string;
}

export default function ForgotPasswordPage() {
    const { t } = useTranslation('auth');
    const [email, setEmail] = useState<string>('');
    const [status, setStatus] = useState<Status | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus(null);
        setLoading(true);
        try {
            const msg = await forgotPassword(email.trim());
            setStatus({ type: 'success', msg });
        } catch (err: any) {
            setStatus({ type: 'error', msg: err.message || t('errors.generic') });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6">
            <h1 className="text-xl font-bold mb-4">{t('forgot_password.title')}</h1>
            <p className="text-sm text-gray-600 mb-4">
                {t('forgot_password.description')}
            </p>
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">{t('common.email')}</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full border rounded px-3 py-2"
                        placeholder={t('common.email_placeholder')}
                    />
                </div>
                <button disabled={loading} className="w-full border rounded px-3 py-2">
                    {loading ? t('common.sending') : t('forgot_password.submit')}
                </button>
                {status && (
                    <div className={status.type === 'success' ? 'text-green-600' : 'text-red-600'}>
                        {status.msg}
                    </div>
                )}
            </form>
        </div>
    );
}
