// src/components/Header.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { isAuthenticated, removeToken } from '../auth/token';

const Header: React.FC = () => {
    const location = useLocation();
    const isLoggedIn = isAuthenticated();

    const handleLogout = () => {
        removeToken();
        window.location.href = '/';
    };

    return (
        <header className="bg-gray-800 text-white p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold tracking-wider">
                    keybae.gg
                </Link>
                <nav className="space-x-4 flex items-center">
                    <Link 
                        to="/" 
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/' ? 'bg-gray-900' : 'hover:bg-gray-700'}`}>
                        Search
                    </Link>
                    {isLoggedIn && (
                        <>
                            <span className="text-sm text-gray-300">관리자님, 환영합니다!</span>
                            <Link 
                                to="/manage" 
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/manage' ? 'bg-gray-900' : 'hover:bg-gray-700'}`}>
                                Manage
                            </Link>
                            <button 
                                onClick={handleLogout}
                                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors">
                                Logout
                            </button>
                        </>
                    )}
                    {!isLoggedIn && (
                        <Link 
                            to="/login" 
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/login' ? 'bg-gray-900' : 'hover:bg-gray-700'}`}>
                            Login
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
