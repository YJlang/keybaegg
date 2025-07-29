// src/pages/SearchPage.tsx
import React, { useEffect, useState } from 'react';
import { KeyboardWarrior, fetchWarriors } from '../api/keyboardWarriorApi';
import SearchBar from '../components/SearchBar';
import WarriorCard from '../components/WarriorCard';

const SearchPage: React.FC = () => {
    const [warriors, setWarriors] = useState<KeyboardWarrior[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadWarriors = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchWarriors();
                setWarriors(data);
            } catch (err) {
                setError('데이터를 불러오는 중 오류가 발생했습니다.');
                console.error('Error fetching warriors:', err);
            } finally {
                setLoading(false);
            }
        };

        loadWarriors();
    }, []);

    // 티어 순서 정의
    const tierOrder = ['SS', 'S', 'A', 'B', 'C', 'D'];
    
    // 티어별 색상 정의
    const getTierSectionColor = (tier: string) => {
        switch (tier) {
            case 'SS': return 'from-purple-900/20 to-purple-800/10 border-purple-500/30';
            case 'S': return 'from-yellow-900/20 to-yellow-800/10 border-yellow-500/30';
            case 'A': return 'from-blue-900/20 to-blue-800/10 border-blue-500/30';
            case 'B': return 'from-green-900/20 to-green-800/10 border-green-500/30';
            case 'C': return 'from-gray-900/20 to-gray-800/10 border-gray-500/30';
            case 'D': return 'from-red-900/20 to-red-800/10 border-red-500/30';
            default: return 'from-gray-900/20 to-gray-800/10 border-gray-500/30';
        }
    };

    // 티어별 제목 색상
    const getTierTitleColor = (tier: string) => {
        switch (tier) {
            case 'SS': return 'text-purple-400';
            case 'S': return 'text-yellow-400';
            case 'A': return 'text-blue-400';
            case 'B': return 'text-green-400';
            case 'C': return 'text-gray-400';
            case 'D': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    // 검색 필터링 및 티어별 그룹화
    const filteredWarriors = warriors.filter(warrior =>
        warrior.nickname.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 티어별로 그룹화
    const groupedWarriors = tierOrder.reduce((acc, tier) => {
        const tierWarriors = filteredWarriors.filter(warrior => warrior.tier === tier);
        if (tierWarriors.length > 0) {
            acc[tier] = tierWarriors.sort((a, b) => b.points - a.points); // 포인트 높은 순으로 정렬
        }
        return acc;
    }, {} as Record<string, KeyboardWarrior[]>);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">데이터를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                        다시 시도
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-8 text-white">키보드 배틀러 검색</h1>
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            
            {searchTerm && (
                <p className="text-gray-400 mb-6 text-center">
                    "{searchTerm}" 검색 결과: {filteredWarriors.length}명
                </p>
            )}
            
            {/* 티어별 섹션 */}
            {Object.keys(groupedWarriors).length > 0 ? (
                <div className="space-y-8">
                    {tierOrder.map(tier => {
                        const tierWarriors = groupedWarriors[tier];
                        if (!tierWarriors || tierWarriors.length === 0) return null;
                        
                        return (
                            <div 
                                key={tier}
                                className={`bg-gradient-to-r ${getTierSectionColor(tier)} border border-l-4 rounded-lg p-6 shadow-lg`}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className={`text-3xl font-bold ${getTierTitleColor(tier)}`}>
                                        {tier} 티어 ({tierWarriors.length}명)
                                    </h2>
                                    <div className={`text-sm ${getTierTitleColor(tier)} bg-black/20 px-3 py-1 rounded-full`}>
                                        평균 {Math.round(tierWarriors.reduce((sum, w) => sum + w.points, 0) / tierWarriors.length).toLocaleString()} P
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {tierWarriors.map(warrior => (
                                        <WarriorCard key={warrior.id} warrior={warrior} />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-400 text-lg">
                        {searchTerm ? '검색 결과가 없습니다.' : '등록된 배틀러가 없습니다.'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default SearchPage;
