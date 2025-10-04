import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../../services/auth';
import InputPassword from '../../ui/InputPassword';
import { PasswordStrength } from '../../components/PasswordStrength';
import Button from '../../ui/Button';
import { validatePassword } from '../../utils/helpers';
import { toast } from 'react-toastify';

interface Status {
    type: 'error' | 'success';
    msg: string;
}

const ResetPasswordPage = () => {
    const [sp] = useSearchParams();
    const token = sp.get('token');
    const [pw1, setPw1] = useState('');
    const [pw2, setPw2] = useState('');
    const [status, setStatus] = useState<Status | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) setStatus({ type: 'error', msg: 'Geçersiz bağlantı (token bulunamadı)' });
    }, [token]);

    const onSubmit = async (e: any) => {
        e.preventDefault();
        if (!token) return;

        if (pw1 !== pw2) {
            setStatus({ type: 'error', msg: 'Şifreler eşleşmiyor' });
            return;
        }

        const trimmedPassword = pw1.trim();
        if (trimmedPassword.length === 0) {
            setStatus({ type: 'error', msg: 'Şifre boş olamaz' });
            return;
        }
        const passwordValidation = validatePassword(trimmedPassword);
        if (!passwordValidation.isValid) {
            setStatus({ type: 'error', msg: passwordValidation.errors[0] });
            return;
        }

        setLoading(true);
        setStatus(null);
        
        try {
            const msg = await resetPassword(token, trimmedPassword);
            setStatus({ type: 'success', msg });
            toast.success('Password reset successful! Redirecting to login...');
            navigate('/login');
        } catch (err: any) {
            setStatus({ type: 'error', msg: err.message || 'Token geçersiz/süresi dolmuş/önceden kullanılmış olabilir' });
        } finally {
            setLoading(false);
        }
    };
    return (
        <main className='flex-grow flex items-center justify-center p-4'>
            <section className='flex flex-col gap-5 w-full min-h-[300px] max-w-md p-6 bg-[#0A0A0A] rounded-lg shadow-md'>
                <h1 className='text-2xl font-bold mb-4 mx-auto w-fit'>Reset Password</h1>
                {status && (
                    <div className={`p-3 text-center rounded ${status.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
                        {status.msg}
                    </div>
                )}
                <form className='flex flex-col gap-4' onSubmit={onSubmit}>
                    <InputPassword
                        label='New Password'
                        value={pw1}
                        onChange={(e) => setPw1(e.target.value.replace(/\s/g, ''))}
                        onKeyDown={(e: any) => {
                            if (e.key === ' ') e.preventDefault();
                        }}
                        placeholder='Enter new password'
                        required
                        onPaste={(e: any) => {
                            e.preventDefault();
                            return false;
                        }}
                    />
                    <PasswordStrength password={pw1} />
                    <InputPassword
                        label='Confirm New Password'
                        value={pw2}
                        onChange={(e) => setPw2(e.target.value.replace(/\s/g, ''))}
                        onKeyDown={(e: any) => {
                            if (e.key === ' ') e.preventDefault();
                        }}
                        placeholder='Re-enter new password'
                        required
                        onPaste={(e: any) => {
                            e.preventDefault();
                            return false;
                        }}
                    />
                    <Button
                        type='submit'
                        disabled={loading || !token}
                        className='mt-2'
                    >
                        {loading ? 'Processing...' : 'Reset Password'}
                    </Button>
                </form>
            </section>
        </main>
    )
}

export default ResetPasswordPage