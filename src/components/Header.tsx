import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { logout } from '../services/auth';
import { IoMenu } from 'react-icons/io5';
import { useState } from 'react';

const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'About', to: '/about' },
    { label: 'Contact', to: '/contact' },
];

const Header = () => {
    const { auth, setAuth }: any = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const logOut = async () => {
        try {
            await logout();
            setAuth({});
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const renderAuthButtons = () => {
        if (auth?.user) {
            return (
                <>
                    <Link
                        to="/dashboard"
                        className="mr-4 hover:underline text-[#888888] hover:text-[#EDEDED]"
                    >
                        Dashboard
                    </Link>
                    <button
                        onClick={logOut}
                        className="inline-flex items-center justify-center h-8 gap-2 px-4 text-xs font-medium tracking-wide transition duration-300 rounded-full bg-[#141414] text-gray-200 hover:bg-[#242424] hover:text-white"
                    >
                        Logout
                    </button>
                </>
            );
        }

        return (
            <>
                <Link
                    to="/login"
                    className="w-[80px] inline-flex items-center justify-center h-8 gap-2 px-4 text-xs font-medium tracking-wide transition duration-300 rounded-full bg-[#141414] text-gray-200 hover:bg-[#242424] hover:text-white"
                >
                    Login
                </Link>
                <Link
                    to="/register"
                    className="w-[80px] ml-2 inline-flex items-center justify-center h-8 gap-2 px-4 text-xs font-medium tracking-wide transition duration-300 rounded-full bg-[#aaaaaa] text-black hover:bg-[#242424] hover:text-white"
                >
                    Register
                </Link>
            </>
        );
    };

    const renderMobileMenu = () => (
        <div
            className={`fixed top-16 left-0 w-full h-[calc(100dvh-4rem)] bg-[#0A0A0A] z-30 text-white px-6 py-8 flex flex-col justify-between md:hidden`}
        >
            <nav className="flex flex-col items-center gap-6 mt-8">
                {navLinks.map(({ to, label }) => (
                    <Link
                        key={to}
                        to={to}
                        onClick={() => setIsMenuOpen(false)}
                        className="text-lg font-medium text-[#CCCCCC] hover:text-white transition-colors duration-200"
                    >
                        {label}
                    </Link>
                ))}
            </nav>

            <div className="pt-6 border-t border-neutral-800 flex flex-col gap-4 items-center">
                {auth?.user ? (
                    <>
                        <Link
                            to="/dashboard"
                            onClick={() => setIsMenuOpen(false)}
                            className="text-base font-medium text-[#CCCCCC] hover:text-white transition-colors duration-200"
                        >
                            Dashboard
                        </Link>
                        <button
                            onClick={() => {
                                logOut();
                                setIsMenuOpen(false);
                            }}
                            className="w-full max-w-[200px] px-4 py-2 text-sm font-semibold bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white rounded-md transition duration-200"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link
                            to="/login"
                            onClick={() => setIsMenuOpen(false)}
                            className="w-full max-w-[200px] text-center px-4 py-2 text-sm font-semibold bg-[#141414] hover:bg-[#242424] text-white rounded-md transition duration-200"
                        >
                            Login
                        </Link>
                        <Link
                            to="/register"
                            onClick={() => setIsMenuOpen(false)}
                            className="w-full max-w-[200px] text-center px-4 py-2 text-sm font-semibold bg-white text-black hover:bg-neutral-200 rounded-md transition duration-200"
                        >
                            Register
                        </Link>
                    </>
                )}
            </div>
        </div>
    );



    return (
        <header className="w-full h-16 bg-[#0A0A0A] sticky top-0 z-10 flex items-center text-black dark:text-white">
            <div className="container mx-auto flex justify-between items-center px-4">
                <Link to="/" className="text-2xl font-bold text-white">
                    HelalQR
                </Link>

                <nav className="hidden md:flex space-x-4">
                    {navLinks.map(({ to, label }) => (
                        <Link
                            key={to}
                            to={to}
                            className="hover:underline text-[#888888] hover:text-[#EDEDED]"
                        >
                            {label}
                        </Link>
                    ))}
                </nav>

                <div className="hidden md:flex items-center">{renderAuthButtons()}</div>

                <button
                    className="md:hidden z-40 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    aria-label="Toggle menu"
                    onClick={() => setIsMenuOpen((prev) => !prev)}
                >
                    <IoMenu className="text-white text-xl" />
                </button>
            </div>

            {isMenuOpen && renderMobileMenu()}
        </header>
    );
};

export default Header;
