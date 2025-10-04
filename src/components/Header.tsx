import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { logout } from '../services/auth'

const Header = () => {
    const { auth, setAuth }: any = useAuth()
    const navigate = useNavigate();

    const logOut = async () => {
        try {
            const res = await logout();
            console.log(res);
            setAuth({});
            navigate('/login');
        } catch (error) {
            console.log('error: ', error);
        }
    }

    return (
        <header
            className="w-full h-16 bg-[#0A0A0A] sticky top-0 z-10 flex items-center text-black dark:text-white"
        >
            <div className="container mx-auto flex justify-between items-center px-4">
                <Link to="/" className="text-2xl font-bold">
                    HelalQR
                </Link>
                <nav>
                    <Link to="/" className="mr-4 hover:underline text-[#888888] hover:text-[#EDEDED]">
                        Home
                    </Link>
                    <Link to="/about" className="mr-4 hover:underline text-[#888888] hover:text-[#EDEDED]">
                        About
                    </Link>
                    {auth?.user ? (<>
                        <Link to="/dashboard" className="mr-4 hover:underline text-[#888888] hover:text-[#EDEDED]">
                            Dashboard
                        </Link>
                        <button onClick={logOut} className="inline-flex items-center justify-center h-8 gap-2 px-4 text-xs font-medium tracking-wide transition duration-300 rounded-full focus-visible:outline-none justify-self-center whitespace-nowrap bg-[#141414] text-gray-200 hover:bg-[#242424] hover:text-white">
                            Logout
                        </button>
                    </>) : (<>
                        <Link to="/login" className="inline-flex items-center justify-center h-8 gap-2 px-4 text-xs font-medium tracking-wide transition duration-300 rounded-full focus-visible:outline-none justify-self-center whitespace-nowrap bg-[#141414] text-gray-200 hover:bg-[#242424] hover:text-white">
                            <span>Login</span>
                        </Link>
                        <Link to="/register" className="ml-2 inline-flex items-center justify-center h-8 gap-2 px-4 text-xs font-medium tracking-wide transition duration-300 rounded-full focus-visible:outline-none justify-self-center whitespace-nowrap bg-[#aaaaaa] text-black hover:bg-[#242424] hover:text-white">
                            <span>Register</span>
                        </Link>
                    </>)}
                </nav>
            </div>
        </header>
    )
}

export default Header