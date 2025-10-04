import React, { useState } from 'react'
import { forgotPassword } from '../../services/auth';
import Input from '../../ui/Input';
import Button from '../../ui/Button';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const onSubmit = async (e: any) => {
        e.preventDefault();
        setStatus(null);
        setLoading(true);
        const emailTrimmed = email.trim();
        if (!emailTrimmed) {
            setStatus({ type: 'error', msg: 'E-posta gerekli' });
            setLoading(false);
            return;
        }
        try {
            const msg = await forgotPassword(email.trim());
            setStatus({ type: 'success', msg });
        } catch (err: any) {
            setStatus({ type: 'error', msg: err.message || 'Bir şeyler ters gitti' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className='flex-grow flex items-center justify-center p-4'>
            <section className='flex flex-col gap-5 w-full min-h-[300px] max-w-md p-6 bg-[#0A0A0A] rounded-lg shadow-md'>
                <h1 className='text-2xl font-bold mb-4 mx-auto w-fit'>Forgot Password</h1>
                <p className="text-sm text-gray-600 mb-4">
                    E-posta adresini gir. Kayıtlı ise kısa süre içinde bir sıfırlama bağlantısı gönderilecek.
                </p>
                <form onSubmit={onSubmit} className="space-y-4">
                    <Input
                        label="E-posta"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? 'Gönderiliyor…' : 'E-posta Gönder'}
                    </Button>
                </form>
                {status && (
                    <div className={`mb-4 p-3 rounded ${status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {status.msg}
                    </div>
                )}
            </section>
        </main>
    )
}

export default ForgotPasswordPage