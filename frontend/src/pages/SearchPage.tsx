// src/pages/SearchPage.tsx
import React, { useEffect, useState } from 'react';
import { KeyboardWarrior, fetchWarriors, fetchRanking } from '../api/keyboardWarriorApi';
import SearchBar from '../components/SearchBar';
import WarriorCard from '../components/WarriorCard';

const SearchPage: React.FC = () => {
    const [warriors, setWarriors] = useState<KeyboardWarrior[]>([]);
    const [rankedWarriors, setRankedWarriors] = useState<KeyboardWarrior[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showRanking, setShowRanking] = useState(false);

    useEffect(() => {
        const loadWarriors = async () => {
            try {
                setLoading(true);
                setError(null);
                const [warriorsData, rankingData] = await Promise.all([
                    fetchWarriors(),
                    fetchRanking()
                ]);
                setWarriors(warriorsData);
                setRankedWarriors(rankingData);
            } catch (err) {
                setError('데이터를 불러오는 중 오류가 발생했습니다.');
                console.error('Error fetching warriors:', err);
            } finally {
                setLoading(false);
            }
        };

        loadWarriors();
    }, []);

    // 실시간 랭킹 폴링 (5초마다)
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const rankingData = await fetchRanking();
                setRankedWarriors(rankingData);
            } catch (err) {
                console.error('Error fetching ranking:', err);
            }
        }, 5000); // 5초마다

        return () => clearInterval(interval);
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

    // 검색 필터링
    const filteredWarriors = warriors.filter(warrior =>
        warrior.nickname.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredRankedWarriors = rankedWarriors.filter(warrior =>
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
            
            {/* 실시간 랭킹 토글 버튼 */}
            <div className="flex justify-center mb-6">
                <button
                    onClick={() => setShowRanking(!showRanking)}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                        showRanking 
                            ? 'bg-blue-600 text-white shadow-lg' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                    {showRanking ? '🏆 실시간 랭킹 보기' : '📊 티어별 보기'}
                </button>
            </div>
            
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            
            {searchTerm && (
                <p className="text-gray-400 mb-6 text-center">
                    "{searchTerm}" 검색 결과: {showRanking ? filteredRankedWarriors.length : filteredWarriors.length}명
                </p>
            )}
            
            {/* 실시간 랭킹 표시 */}
            {showRanking ? (
                <div className="space-y-4">
                    <div className="bg-gradient-to-r from-yellow-900/20 to-yellow-800/10 border border-yellow-500/30 rounded-lg p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-3xl font-bold text-yellow-400">
                                🏆 실시간 랭킹 ({filteredRankedWarriors.length}명)
                            </h2>
                            <div className="text-sm text-yellow-400 bg-black/20 px-3 py-1 rounded-full animate-pulse">
                                실시간 업데이트 중...
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredRankedWarriors.map((warrior, index) => (
                                <div key={warrior.id} className="relative">
                                    {/* 순위 배지 */}
                                    <div className="absolute -top-2 -left-2 z-10">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                            index === 0 ? 'bg-yellow-500 text-yellow-900' :
                                            index === 1 ? 'bg-gray-400 text-gray-900' :
                                            index === 2 ? 'bg-orange-600 text-orange-100' :
                                            'bg-blue-600 text-blue-100'
                                        }`}>
                                            {index + 1}
                                        </div>
                                    </div>
                                    <WarriorCard warrior={warrior} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                /* 티어별 섹션 */
                Object.keys(groupedWarriors).length > 0 ? (
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
                )
            )}
        </div>
    );
};

export default SearchPage;
