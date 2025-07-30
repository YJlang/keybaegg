// src/components/Header.tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { isAuthenticated, removeToken } from '../auth/token';
import ChatModal from './ChatModal';

const Header: React.FC = () => {
    const location = useLocation();
    const isLoggedIn = isAuthenticated();
    const [isChatOpen, setIsChatOpen] = useState(false);

    const handleLogout = () => {
        removeToken();
        window.location.href = '/';
    };

    const handleChatOpen = () => {
        setIsChatOpen(true);
    };

    const handleChatClose = () => {
        setIsChatOpen(false);
    };

    return (
        <>
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
                        <button
                            onClick={handleChatOpen}
                            className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors flex items-center space-x-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>Chat</span>
                        </button>
                        {isLoggedIn && (
                            <>
                                <span className="text-sm text-gray-300">관리자님, 환영합니다!</span>
                                <Link 
                                    to="/manage" 
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/manage' ? 'bg-gray-900' : 'hover:bg-gray-700'}`}>
                                    배틀러 관리
                                </Link>
                                <Link 
                                    to="/manage/records" 
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/manage/records' ? 'bg-gray-900' : 'hover:bg-gray-700'}`}>
                                    전적 관리
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
            
            {/* 채팅 모달 */}
            <ChatModal isOpen={isChatOpen} onClose={handleChatClose} />
        </>
    );
};

export default Header;
