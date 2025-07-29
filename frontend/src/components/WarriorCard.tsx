// src/components/WarriorCard.tsx
import React from 'react';
import { KeyboardWarrior } from '../api/keyboardWarriorApi';

interface WarriorCardProps {
    warrior: KeyboardWarrior;
}

const getTierColor = (tier: string) => {
    switch (tier) {
        case 'SS': return 'border-purple-500 text-purple-400';
        case 'S': return 'border-yellow-400 text-yellow-400';
        case 'A': return 'border-blue-400 text-blue-400';
        case 'B': return 'border-green-400 text-green-400';
        case 'C': return 'border-gray-400 text-gray-400';
        case 'D': return 'border-red-500 text-red-400';
        default: return 'border-gray-600 text-gray-400';
    }
};

const WarriorCard: React.FC<WarriorCardProps> = ({ warrior }) => {
    const tierColor = getTierColor(warrior.tier);
    
    // 프로필 이미지 URL 생성 (백엔드 URL과 결합)
    const profileImageUrl = warrior.profileImage.startsWith('http') 
        ? warrior.profileImage 
        : `http://localhost:8080${warrior.profileImage}`;
    
    return (
        <div className={`bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 ${tierColor.split(' ')[0]} hover:shadow-xl transition-shadow duration-200`}>
            <div className="flex items-start space-x-4">
                {/* 프로필 이미지 */}
                <div className="flex-shrink-0">
                    <img
                        src={profileImageUrl}
                        alt={`${warrior.nickname} 프로필`}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-600"
                        onError={(e) => {
                            // 이미지 로드 실패 시 기본 이미지로 대체
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjMzc0MTUxIi8+CjxjaXJjbGUgY3g9IjMyIiBjeT0iMjQiIHI9IjEyIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0xNiA0OEwzMiAzNkw0OCA0OCIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjQiIGZpbGw9Im5vbmUiLz4KPC9zdmc+';
                        }}
                    />
                </div>
                
                {/* 배틀러 정보 */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-2 truncate">{warrior.nickname}</h3>
                            {warrior.comment && (
                                <p className="text-sm text-gray-400 line-clamp-2">{warrior.comment}</p>
                            )}
                        </div>
                        <div className="text-right ml-4">
                            <p className={`text-2xl font-bold ${tierColor.split(' ')[1]}`}>{warrior.tier}</p>
                            <p className="text-lg text-gray-300 font-semibold">{warrior.points.toLocaleString()} P</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WarriorCard;
