import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { register } from '../../services/auth';
import useAuth from '../../hooks/useAuth';
import { validatePassword } from '../../utils/helpers';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { TiWarningOutline } from "react-icons/ti";
import Input from '../../ui/Input';
import InputPassword from '../../ui/InputPassword';
import { PasswordStrength } from '../../components/PasswordStrength';

const Register = () => {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [passwordConfirm, setPasswordConfirm] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [error, setError] = React.useState<string | null>(null);
    const { auth }: any = useAuth()
    const navigate = useNavigate();
    const errRef = useRef<HTMLDivElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedUsername = username.trim();
        const trimmedPassword = password.trim();
        const trimmedEmail = email.trim();
        
        if (!trimmedUsername || !trimmedPassword || !trimmedEmail) {
            setError('Email, username, and password are required.');
            errRef.current?.focus();
            return;
        }

        const passwordValidation = validatePassword(trimmedPassword);
        if (!passwordValidation.isValid) {
            setError(passwordValidation.errors[0]);
            errRef.current?.focus();
            return;
        }

        if (password !== passwordConfirm) {
            setError("Passwords do not match");
            errRef.current?.focus();
            return;
        }
        try {
            const res = await register({
                username: trimmedUsername,
                password: trimmedPassword,
                email: trimmedEmail
            });
            toast.success('Register successful! Redirecting...');
            navigate('/login', { replace: true });
            setError(null);
        } catch (err: any) {
            setError(err?.response?.data || 'Register failed. Please try again.');
            errRef.current?.focus();
        }
    }

    useEffect(() => {
        if (auth?.user) {
            navigate('/dashboard', { replace: true });
        }
        return () => {
            setError(null);
            setUsername('');
            setPassword('');
            setEmail('');
            setPasswordConfirm('');
        };
    }, [auth])

    return (
        <section className='flex-grow flex items-center justify-center'>
            <div className="rounded-lg w-full sm:max-w-lg max-w-full sm:min-h-[500px]">
                <div className="bg-[#0A0A0A] p-6 mx-2 sm:mx-0 shadow-md rounded-xl flex flex-col">
                    <h2 className="text-2xl font-bold mb-8 text-center">Register</h2>
                    <form onSubmit={handleSubmit} className='flex flex-col gap-4 px-0 sm:px-8 sm:mt-8'>
                        {error && (
                            <div ref={errRef} className="text-red-700 flex text-sm gap-1">
                                <TiWarningOutline size={20} /> <p>{error}</p>
                            </div>
                        )}
                        <Input
                            type="email"
                            label='Email'
                            placeholder="Your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Input
                            type="text"
                            label='Username'
                            placeholder="Your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <InputPassword
                            label='Password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <InputPassword
                            label='Confirm Password'
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                        />
                        <PasswordStrength password={password} />
                        <button
                            type="submit"
                            className="mt-4 bg-[#E5E5E5] text-black p-2 rounded hover:bg-[#c9c9c9] transition-colors duration-200"
                        >
                            Register
                        </button>
                        <p className="text-sm text-gray-400 mt-4 mx-auto">
                            Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Login here</Link>
                        </p>
                    </form>
                </div>
            </div>
        </section>
    )
}

export default Register