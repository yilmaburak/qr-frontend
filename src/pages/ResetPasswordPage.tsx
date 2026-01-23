import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/auth';
import PasswordField from '../components/PasswordField';
import { PasswordStrength } from '../components/PasswordStrength';
import { useTranslation } from 'react-i18next';

interface Status {
    type: 'success' | 'error';
    msg: string;
}

export default function ResetPasswordPage() {
    const { t } = useTranslation('auth');
    const [sp] = useSearchParams();
    const token = sp.get('token');
    const [pw1, setPw1] = useState<string>('');
    const [pw2, setPw2] = useState<string>('');
    const [status, setStatus] = useState<Status | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) setStatus({ type: 'error', msg: t('errors.invalid_token') });
    }, [token]);

    const validPolicy = (p: string) => /(?=.{8,})(?=.*[A-ZÇĞİÖŞÜ])(?=.*[a-zçğıöşü])(?=.*\d)/.test(p);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        if (pw1 !== pw2) {
            setStatus({ type: 'error', msg: t('errors.passwords_mismatch') });
            return;
        }
        if (!validPolicy(pw1)) {
            setStatus({ type: 'error', msg: t('errors.password_policy') });
            return;
        }

        setLoading(true);
        setStatus(null);
        try {
            const msg = await resetPassword(token, pw1);
            setStatus({ type: 'success', msg });
            setTimeout(() => navigate('/login'), 1200);
        } catch (err: any) {
            setStatus({ type: 'error', msg: err.message || t('errors.token_expired') });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6">
            <h1 className="text-xl font-bold mb-4">{t('reset_password.title')}</h1>
            <form onSubmit={onSubmit} className="space-y-4">
                <PasswordField id="pw1" label={t('reset_password.new_password')} value={pw1} onChange={(e) => setPw1(e.target.value)} />
                <PasswordStrength password={pw1} />
                <PasswordField id="pw2" label={t('reset_password.confirm_password')} value={pw2} onChange={(e) => setPw2(e.target.value)} />
                <button disabled={loading || !token} className="w-full border rounded px-3 py-2">
                    {loading ? t('common.updating') : t('reset_password.submit')}
                </button>
                {status && (
                    <div className={status.type === 'success' ? 'text-green-600' : 'text-red-600'}>
                        {status.msg}
                    </div>
                )}
            </form>
            <p className="text-xs text-gray-600 mt-4">
                {t('reset_password.policy_hint')}
            </p>
        </div>
    );
}
