// src/pages/AchievementManagePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { fetchWarriorAchievements, unlockAllAchievements, lockAllAchievements, toggleAchievement, Achievement } from '../api/keyboardWarriorApi';

interface Warrior {
  id: number;
  nickname: string;
  tier: string;
  points: number;
}

const AchievementManagePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [warrior, setWarrior] = useState<Warrior | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);
  const [showLockedOnly, setShowLockedOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'ALL', name: '전체', icon: '🎯', color: 'bg-gray-500' },
    { id: 'VICTORY', name: '승리', icon: '🏆', color: 'bg-yellow-500' },
    { id: 'RANKING', name: '랭킹', icon: '👑', color: 'bg-purple-500' },
    { id: 'PLATFORM', name: '플랫폼', icon: '💬', color: 'bg-blue-500' },
    { id: 'SPECIAL', name: '특별', icon: '💎', color: 'bg-pink-500' }
  ];

  const loadAchievements = useCallback(async () => {
    try {
      setLoading(true);
      console.log('업적 로딩 시작:', id);
      
      // 백엔드 서버가 실행되지 않은 경우를 위한 더미 데이터
      const dummyAchievements: Achievement[] = [
        {
          id: "first_win",
          name: "첫 논쟁 승리",
          description: "첫 번째 말싸움에서 승리했습니다",
          icon: "🥇",
          category: "VICTORY",
          requirement: 1,
          unlockedAt: null,
          unlocked: false
        },
        {
          id: "winning_streak_3",
          name: "논쟁 연승",
          description: "3연속 말싸움에서 승리했습니다",
          icon: "🔥",
          category: "VICTORY",
          requirement: 3,
          unlockedAt: null,
          unlocked: false
        },
        {
          id: "reach_rank_1",
          name: "최고의 논쟁가",
          description: "말싸움 랭킹 1위에 등극했습니다",
          icon: "👑",
          category: "RANKING",
          requirement: 1,
          unlockedAt: null,
          unlocked: false
        },
        {
          id: "platform_variety_3",
          name: "다재다능",
          description: "3가지 플랫폼에서 말싸움 승리를 달성했습니다",
          icon: "💬",
          category: "PLATFORM",
          requirement: 3,
          unlockedAt: null,
          unlocked: false
        },
        {
          id: "fact_checker",
          name: "팩트체커",
          description: "10번의 말싸움에서 사실 확인으로 승리했습니다",
          icon: "🔍",
          category: "SPECIAL",
          requirement: 10,
          unlockedAt: null,
          unlocked: false
        }
      ];
      
      try {
        const data = await fetchWarriorAchievements(parseInt(id!));
        console.log('업적 로딩 성공:', data);
        setAchievements(data.achievements);
      } catch (apiError) {
        console.log('API 호출 실패, 더미 데이터 사용:', apiError);
        setAchievements(dummyAchievements);
      }
    } catch (error) {
      console.error('업적 로드 실패:', error);
      setError('업적을 불러오는데 실패했습니다.');
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadWarriorInfo = useCallback(async () => {
    try {
      // 실제로는 워리어 정보를 가져오는 API 호출
      // 임시로 하드코딩된 데이터 사용
      setWarrior({
        id: parseInt(id!),
        nickname: `배틀러 ${id}`,
        tier: 'SS',
        points: 999
      });
    } catch (error) {
      console.error('워리어 정보 로드 실패:', error);
    }
  }, [id]);

  useEffect(() => {
    console.log('AchievementManagePage useEffect 실행, id:', id);
    if (id) {
      loadAchievements();
      loadWarriorInfo();
    }
  }, [id, loadAchievements, loadWarriorInfo]);

  const handleUnlockAll = async () => {
    try {
      const response = await unlockAllAchievements(parseInt(id!));
      setAchievements(response.achievements);
    } catch (error) {
      console.error('전체 해금 실패:', error);
    }
  };

  const handleLockAll = async () => {
    try {
      const response = await lockAllAchievements(parseInt(id!));
      setAchievements(response.achievements);
    } catch (error) {
      console.error('전체 잠금 실패:', error);
    }
  };

  const handleToggleAchievement = async (achievementId: string) => {
    try {
      const response = await toggleAchievement(parseInt(id!), achievementId);
      setAchievements(response.achievements);
    } catch (error) {
      console.error('업적 토글 실패:', error);
    }
  };

  const filteredAchievements = achievements.filter(achievement => {
    const matchesCategory = selectedCategory === 'ALL' || achievement.category === selectedCategory;
    const matchesSearch = achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = (showUnlockedOnly && achievement.unlocked) ||
                         (showLockedOnly && !achievement.unlocked) ||
                         (!showUnlockedOnly && !showLockedOnly);
    
    return matchesCategory && matchesSearch && matchesStatus;
  });

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const progressPercentage = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">업적을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">오류 발생</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              loadAchievements();
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* 헤더 섹션 */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {warrior?.nickname}의 업적 관리
                </h1>
                <p className="text-gray-300">배틀러의 업적 상태를 관리하세요</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-white font-semibold">{warrior?.tier} 티어</p>
                <p className="text-gray-300">{warrior?.points} 포인트</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-lg">{warrior?.nickname.charAt(0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 진행률 섹션 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">업적 진행률</h2>
            <span className="text-2xl font-bold text-white">
              {unlockedCount} / {totalCount}
            </span>
          </div>
          <div className="relative">
            <div className="w-full bg-gray-700 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 h-4 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {progressPercentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 컨트롤 섹션 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-6">
          {/* 검색 및 필터 */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="업적 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setShowUnlockedOnly(!showUnlockedOnly); setShowLockedOnly(false); }}
                className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                  showUnlockedOnly 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                해금된 업적
              </button>
              <button
                onClick={() => { setShowLockedOnly(!showLockedOnly); setShowUnlockedOnly(false); }}
                className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                  showLockedOnly 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                잠긴 업적
              </button>
            </div>
          </div>

          {/* 카테고리 필터 */}
          <div className="flex flex-wrap gap-3 mb-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                  selectedCategory === category.id
                    ? `${category.color} text-white shadow-lg`
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <span className="text-lg">{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>

          {/* 일괄 관리 버튼 */}
          <div className="flex gap-4">
            <button
              onClick={handleUnlockAll}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              🎉 모든 업적 해금
            </button>
            <button
              onClick={handleLockAll}
              className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              🔒 모든 업적 잠금
            </button>
          </div>
        </div>
      </div>

      {/* 업적 그리드 */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        {filteredAchievements.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">업적을 찾을 수 없습니다</h3>
            <p className="text-gray-400">검색 조건을 변경해보세요</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`relative group cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  achievement.unlocked 
                    ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-400/50' 
                    : 'bg-white/5 border-white/10'
                } backdrop-blur-sm rounded-2xl p-6 border hover:border-white/30`}
                onClick={() => handleToggleAchievement(achievement.id)}
              >
                {/* 해금 상태 배지 */}
                <div className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center ${
                  achievement.unlocked 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-600 text-gray-300'
                }`}>
                  {achievement.unlocked ? '✓' : '🔒'}
                </div>

                {/* 업적 아이콘 */}
                <div className="text-center mb-4">
                  <div className={`text-4xl mb-2 ${achievement.unlocked ? 'animate-pulse' : 'opacity-50'}`}>
                    {achievement.icon}
                  </div>
                  <h3 className={`text-lg font-bold ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`}>
                    {achievement.name}
                  </h3>
                </div>

                {/* 업적 설명 */}
                <p className={`text-sm mb-4 text-center ${achievement.unlocked ? 'text-gray-200' : 'text-gray-500'}`}>
                  {achievement.description}
                </p>

                {/* 카테고리 및 요구사항 */}
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    achievement.unlocked 
                      ? 'bg-green-500/30 text-green-200' 
                      : 'bg-gray-600/50 text-gray-400'
                  }`}>
                    {categories.find(c => c.id === achievement.category)?.name}
                  </span>
                  <span className={`text-sm font-semibold ${
                    achievement.unlocked ? 'text-green-300' : 'text-gray-400'
                  }`}>
                    요구: {achievement.requirement}
                  </span>
                </div>

                {/* 해금 날짜 */}
                {achievement.unlocked && achievement.unlockedAt && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-green-300 text-center">
                      해금일: {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {/* 호버 효과 */}
                <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
                  achievement.unlocked 
                    ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10' 
                    : 'bg-gradient-to-br from-gray-500/10 to-gray-600/10'
                } opacity-0 group-hover:opacity-100`}></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementManagePage; 