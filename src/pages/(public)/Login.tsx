import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { login } from '../../services/auth';
import useAuth from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { TiWarningOutline } from "react-icons/ti";
import Input from '../../ui/Input';
import InputPassword from '../../ui/InputPassword';
import Button from '../../ui/Button';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { auth, setAuth }: any = useAuth()
    const navigate = useNavigate();
    const errRef = useRef<HTMLDivElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedUsername = username.trim();
        const trimmedPassword = password.trim();
        if (!trimmedUsername || !trimmedPassword) {
            setError('Username and password are required.');
            errRef.current?.focus();
            return;
        }
        try {
            const res = await login({ username: trimmedUsername, password: trimmedPassword });
            toast.success('Login successful! Redirecting...');
            setAuth({
                user: res.user || username,
                accessToken: res.token,
                roles: res.roles || [5150]
            });
            setError(null);
        } catch (err: any) {
            setError(err?.response?.data || 'Login failed. Please check your credentials and try again.');
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
        };
    }, [auth])

    return (
        <main className='flex-grow flex items-center justify-center'>
            <div className="rounded-lg w-full sm:max-w-4xl max-w-full grid sm:grid-cols-2 sm:h-[500px]">
                <div className="bg-[#0A0A0A] p-6 mx-2 sm:mx-0 shadow-md rounded-l-lg flex flex-col">
                    <h2 className="text-2xl font-bold mb-8 text-center">Login to Your Account</h2>
                    <form onSubmit={handleSubmit} className='flex flex-col gap-4 px-0 sm:px-8 sm:mt-8'>
                        {error && (
                            <div ref={errRef} className="text-red-700 flex text-sm gap-1">
                                <TiWarningOutline size={20} /> <p>{error}</p>
                            </div>
                        )}
                        <Input
                            type="text"
                            placeholder="Username"
                            inputClass="w-full"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="username"
                            required
                            showAsterisk={false}
                        />
                        <InputPassword
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                            showAsterisk={false}
                        />
                        <Button type="submit">
                            Login
                        </Button>
                        <Link to="/forgot-password" className="text-sm text-blue-400 hover:underline mt-2 mx-auto">
                            Forgot Password?
                        </Link>
                        <p className="text-sm mt-4 mx-auto">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-blue-400 hover:underline">
                                Register here
                            </Link>
                        </p>
                    </form>
                </div>
                <div className='hidden sm:block bg-[#0A0A0A] rounded-r-lg overflow-hidden'>
                    <img
                        src="https://images.unsplash.com/photo-1508780709619-79562169bc64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                        alt="Login"
                        className="w-full h-full object-cover overflow-hidden"
                    />
                </div>
            </div>
        </main>
    )
}

export default Login