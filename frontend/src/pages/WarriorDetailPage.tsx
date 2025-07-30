// src/pages/WarriorDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    KeyboardWarrior, 
    fetchWarriorById, 
    MatchRecord, 
    MatchStats, 
    fetchMatchRecords, 
    fetchMatchStats 
} from '../api/keyboardWarriorApi';

const WarriorDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [warrior, setWarrior] = useState<KeyboardWarrior | null>(null);
    const [matchRecords, setMatchRecords] = useState<MatchRecord[]>([]);
    const [matchStats, setMatchStats] = useState<MatchStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadWarrior = async () => {
            if (!id) {
                setError('유효하지 않은 ID입니다.');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const [warriorData, recordsData, statsData] = await Promise.all([
                    fetchWarriorById(parseInt(id)),
                    fetchMatchRecords(parseInt(id)),
                    fetchMatchStats(parseInt(id))
                ]);
                setWarrior(warriorData);
                setMatchRecords(recordsData);
                setMatchStats(statsData);
            } catch (err: any) {
                if (err.response?.status === 404) {
                    setError('해당 배틀러를 찾을 수 없습니다.');
                } else {
                    setError('데이터를 불러오는 중 오류가 발생했습니다.');
                }
                console.error('Error fetching warrior data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadWarrior();
    }, [id]);

    // 티어별 색상 정의
    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'SS': return 'text-purple-400 bg-purple-900/20 border-purple-500/30';
            case 'S': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
            case 'A': return 'text-blue-400 bg-blue-900/20 border-blue-500/30';
            case 'B': return 'text-green-400 bg-green-900/20 border-green-500/30';
            case 'C': return 'text-gray-400 bg-gray-900/20 border-gray-500/30';
            case 'D': return 'text-red-400 bg-red-900/20 border-red-500/30';
            default: return 'text-gray-400 bg-gray-900/20 border-gray-500/30';
        }
    };

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

    if (error || !warrior) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error || '배틀러 정보를 찾을 수 없습니다.'}</p>
                    <button 
                        onClick={() => navigate('/')} 
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                        메인으로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    // 프로필 이미지 URL 생성
    const profileImageUrl = warrior.profileImage.startsWith('http') 
        ? warrior.profileImage 
        : `http://localhost:8080${warrior.profileImage}`;

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* 뒤로가기 버튼 */}
            <button 
                onClick={() => navigate('/')}
                className="mb-6 flex items-center text-gray-400 hover:text-white transition-colors"
            >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                목록으로 돌아가기
            </button>

            {/* 메인 카드 */}
            <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
                {/* 헤더 섹션 */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                        {/* 프로필 이미지 */}
                        <div className="flex-shrink-0">
                            <img
                                src={profileImageUrl}
                                alt={`${warrior.nickname} 프로필`}
                                className="w-32 h-32 rounded-full object-cover border-4 border-gray-600 shadow-lg"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IGhlaWdodD0iMTI4IHZpZXdCb3g9IjAgMCAxMjggMTI4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgZmlsbD0iIzM3NDE1MSIvPgo8Y2lyY2xlIGN4PSI2NCIgY3k9IjQ4IiByPSIyNCIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMzIgOTZMNjQgNzJMODAgOTYiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSI4IiBmaWxsPSJub25lIi8+Cjwvc3ZnPg==';
                                }}
                            />
                        </div>

                        {/* 기본 정보 */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-4xl font-bold text-white mb-2">{warrior.nickname}</h1>
                            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start space-y-2 sm:space-y-0 sm:space-x-4">
                                <span className={`px-4 py-2 rounded-full text-lg font-bold border ${getTierColor(warrior.tier)}`}>
                                    {warrior.tier} 티어
                                </span>
                                <span className="text-2xl font-bold text-blue-400">
                                    {warrior.points.toLocaleString()} P
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 상세 정보 섹션 */}
                <div className="p-8">
                    {/* 코멘트 섹션 */}
                    {warrior.comment && (
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                                <svg className="w-6 h-6 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                배틀러 소개
                            </h2>
                            <div className="bg-gray-700 rounded-lg p-6 border-l-4 border-blue-500">
                                <p className="text-gray-300 text-lg leading-relaxed">{warrior.comment}</p>
                            </div>
                        </div>
                    )}

                    {/* 통계 섹션 */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                            <svg className="w-6 h-6 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            배틀러 통계
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="bg-gray-700 rounded-lg p-6 text-center border border-gray-600">
                                <div className="text-3xl font-bold text-blue-400 mb-2">{warrior.tier}</div>
                                <div className="text-gray-400">현재 티어</div>
                            </div>
                            <div className="bg-gray-700 rounded-lg p-6 text-center border border-gray-600">
                                <div className="text-3xl font-bold text-green-400 mb-2">{warrior.points.toLocaleString()}</div>
                                <div className="text-gray-400">총 포인트</div>
                            </div>
                            <div className="bg-gray-700 rounded-lg p-6 text-center border border-gray-600">
                                <div className="text-3xl font-bold text-yellow-400 mb-2">{matchStats?.totalMatches || 0}</div>
                                <div className="text-gray-400">총 경기</div>
                            </div>
                            <div className="bg-gray-700 rounded-lg p-6 text-center border border-gray-600">
                                <div className="text-3xl font-bold text-green-400 mb-2">{matchStats?.wins || 0}</div>
                                <div className="text-gray-400">승리</div>
                            </div>
                            <div className="bg-gray-700 rounded-lg p-6 text-center border border-gray-600">
                                <div className="text-3xl font-bold text-red-400 mb-2">{matchStats?.losses || 0}</div>
                                <div className="text-gray-400">패배</div>
                            </div>
                        </div>
                        
                        {/* 승률 표시 */}
                        {matchStats && matchStats.totalMatches > 0 && (
                            <div className="mt-4 bg-gray-700 rounded-lg p-4 border border-gray-600">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-300">승률</span>
                                    <span className="text-2xl font-bold text-purple-400">
                                        {matchStats.winRate.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="mt-2 w-full bg-gray-600 rounded-full h-2">
                                    <div 
                                        className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${matchStats.winRate}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 최근 전적 섹션 */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                            <svg className="w-6 h-6 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            최근 전적
                        </h2>
                        
                        {matchRecords.length > 0 ? (
                            <div className="space-y-3">
                                {matchRecords.slice(0, 5).map((record) => (
                                    <div key={record.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:bg-gray-650 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3">
                                                    <span className={`px-2 py-1 rounded text-sm font-semibold ${
                                                        record.result === 'WIN' ? 'bg-green-600 text-green-100' :
                                                        record.result === 'LOSE' ? 'bg-red-600 text-red-100' :
                                                        'bg-yellow-600 text-yellow-100'
                                                    }`}>
                                                        {record.result === 'WIN' ? '승' : record.result === 'LOSE' ? '패' : '무'}
                                                    </span>
                                                    <span className="text-white font-semibold">{record.score}</span>
                                                    <span className="text-gray-400">vs</span>
                                                    <span className="text-blue-400 font-semibold">{record.opponentName}</span>
                                                </div>
                                                <p className="text-sm text-gray-400 mt-1">{record.description}</p>
                                                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                                    <span>{record.matchDate}</span>
                                                    <span>{record.gameType}</span>
                                                    {record.pointsChange && (
                                                        <span className={`font-semibold ${
                                                            record.pointsChange > 0 ? 'text-green-400' : 
                                                            record.pointsChange < 0 ? 'text-red-400' : 'text-gray-400'
                                                        }`}>
                                                            {record.pointsChange > 0 ? '+' : ''}{record.pointsChange} P
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                {matchRecords.length > 5 && (
                                    <div className="text-center pt-4">
                                        <p className="text-gray-400 text-sm">
                                            총 {matchRecords.length}경기 중 최근 5경기 표시
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
                                <div className="text-center text-gray-400">
                                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-lg">아직 전적 기록이 없습니다.</p>
                                    <p className="text-sm mt-2">첫 번째 대전을 기록해보세요!</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                        <button 
                            onClick={() => navigate('/')}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                        >
                            목록으로 돌아가기
                        </button>
                        <button 
                            onClick={() => window.history.back()}
                            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                        >
                            이전 페이지
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WarriorDetailPage; 