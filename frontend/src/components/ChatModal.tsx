// src/components/ChatModal.tsx
import React from 'react';

interface ChatModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* 배경 오버레이 */}
            <div 
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={onClose}
            ></div>
            
            {/* 모달 컨테이너 */}
            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4">
                {/* 헤더 */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">라이브 채팅</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                {/* iframe 컨테이너 */}
                <div className="p-4">
                    <iframe 
                        src="//uchat.ch/%EC%B1%84%ED%8C%85%ED%94%84%EB%A6%AC%EB%AF%B8%EC%96%B4%EB%A6%AC%EA%B7%B8" 
                        style={{
                            display: 'inline-block', 
                            width: '100%', 
                            height: '500px',
                            border: 'none',
                            borderRadius: '8px'
                        }}
                        title="라이브 채팅"
                        allow="microphone; camera"
                    />
                </div>
            </div>
        </div>
    );
};

export default ChatModal; 