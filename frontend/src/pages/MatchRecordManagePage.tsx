// src/pages/MatchRecordManagePage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MatchRecord,
    fetchAllMatchRecords,
    createMatchRecord,
    updateMatchRecord,
    deleteMatchRecord,
    KeyboardWarrior,
    fetchWarriors
} from '../api/keyboardWarriorApi';
import { isAuthenticated } from '../auth/token';

const GAME_TYPES = ['1v1', '2v2', 'Tournament', 'League'];
const RESULTS = ['WIN', 'LOSE', 'DRAW'];

const MatchRecordManagePage: React.FC = () => {
    const [matchRecords, setMatchRecords] = useState<MatchRecord[]>([]);
    const [warriors, setWarriors] = useState<KeyboardWarrior[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    // 신규/수정용 상태
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [currentWarriorId, setCurrentWarriorId] = useState<number>(0);
    const [currentOpponentId, setCurrentOpponentId] = useState<number>(0);
    const [currentResult, setCurrentResult] = useState<'WIN' | 'LOSE' | 'DRAW'>('WIN');
    const [currentScore, setCurrentScore] = useState('');
    const [currentGameType, setCurrentGameType] = useState('1v1');
    const [currentDescription, setCurrentDescription] = useState('');
    const [currentPointsChange, setCurrentPointsChange] = useState(0);
    const [currentMatchDate, setCurrentMatchDate] = useState('');

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }
        loadData();
    }, [navigate]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [recordsData, warriorsData] = await Promise.all([
                fetchAllMatchRecords(),
                fetchWarriors()
            ]);
            setMatchRecords(recordsData);
            setWarriors(warriorsData);
        } catch (err) {
            setError('데이터를 불러오는 중 오류가 발생했습니다.');
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setIsEditing(null);
        setCurrentWarriorId(0);
        setCurrentOpponentId(0);
        setCurrentResult('WIN');
        setCurrentScore('');
        setCurrentGameType('1v1');
        setCurrentDescription('');
        setCurrentPointsChange(0);
        setCurrentMatchDate('');
    };

    const handleSave = async () => {
        if (!currentWarriorId || !currentOpponentId) {
            alert('배틀러와 상대방을 선택해주세요.');
            return;
        }

        if (!currentScore.trim()) {
            alert('스코어를 입력해주세요.');
            return;
        }

        if (!currentMatchDate) {
            alert('경기 날짜를 선택해주세요.');
            return;
        }

        try {
            setSaving(true);
            setError(null);

            const recordData = {
                warriorId: currentWarriorId,
                opponentId: currentOpponentId,
                result: currentResult,
                score: currentScore.trim(),
                gameType: currentGameType,
                description: currentDescription.trim(),
                pointsChange: currentPointsChange,
                matchDate: currentMatchDate // LocalDate 형식
            };

            if (isEditing) {
                await updateMatchRecord({
                    id: isEditing,
                    ...recordData
                });
            } else {
                await createMatchRecord(recordData);
            }

            resetForm();
            loadData();
        } catch (err) {
            setError('저장 중 오류가 발생했습니다.');
            console.error('Error saving record:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (record: MatchRecord) => {
        setIsEditing(record.id);
        setCurrentWarriorId(record.warriorId);
        setCurrentOpponentId(record.opponentId);
        setCurrentResult(record.result);
        setCurrentScore(record.score);
        setCurrentGameType(record.gameType);
        setCurrentDescription(record.description);
        setCurrentPointsChange(record.pointsChange || 0);
        setCurrentMatchDate(record.matchDate.split('T')[0]); // 날짜만 추출
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('정말로 이 전적 기록을 삭제하시겠습니까?')) {
            return;
        }

        try {
            setError(null);
            await deleteMatchRecord(id);
            loadData();
        } catch (err) {
            setError('삭제 중 오류가 발생했습니다.');
            console.error('Error deleting record:', err);
        }
    };

    const getWarriorName = (id: number) => {
        const warrior = warriors.find(w => w.id === id);
        return warrior ? warrior.nickname : `ID: ${id}`;
    };

    const getResultColor = (result: string) => {
        switch (result) {
            case 'WIN': return 'text-green-400';
            case 'LOSE': return 'text-red-400';
            case 'DRAW': return 'text-yellow-400';
            default: return 'text-gray-400';
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
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            <h1 className="text-4xl font-bold text-center text-white mb-8">전적 관리</h1>

            {/* 등록/수정 폼 */}
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-6">
                    {isEditing ? '전적 수정' : '새 전적 등록'}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">배틀러</label>
                        <select
                            value={currentWarriorId}
                            onChange={(e) => setCurrentWarriorId(parseInt(e.target.value))}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
                        >
                            <option value={0}>배틀러 선택</option>
                            {warriors.map(warrior => (
                                <option key={warrior.id} value={warrior.id}>{warrior.nickname}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">상대방</label>
                        <select
                            value={currentOpponentId}
                            onChange={(e) => setCurrentOpponentId(parseInt(e.target.value))}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
                        >
                            <option value={0}>상대방 선택</option>
                            {warriors.map(warrior => (
                                <option key={warrior.id} value={warrior.id}>{warrior.nickname}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">결과</label>
                        <select
                            value={currentResult}
                            onChange={(e) => setCurrentResult(e.target.value as 'WIN' | 'LOSE' | 'DRAW')}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
                        >
                            {RESULTS.map(result => (
                                <option key={result} value={result}>{result}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">스코어</label>
                        <input
                            type="text"
                            value={currentScore}
                            onChange={(e) => setCurrentScore(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
                            placeholder="예: 3-1"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">게임 타입</label>
                        <select
                            value={currentGameType}
                            onChange={(e) => setCurrentGameType(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
                        >
                            {GAME_TYPES.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">포인트 변화</label>
                        <input
                            type="number"
                            value={currentPointsChange}
                            onChange={(e) => setCurrentPointsChange(parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
                            placeholder="0"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">경기 날짜</label>
                        <input
                            type="date"
                            value={currentMatchDate}
                            onChange={(e) => setCurrentMatchDate(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    
                    <div className="lg:col-span-3">
                        <label className="block text-sm font-medium text-gray-300 mb-2">경기 설명</label>
                        <textarea
                            value={currentDescription}
                            onChange={(e) => setCurrentDescription(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
                            placeholder="경기에 대한 설명을 입력하세요"
                        />
                    </div>
                </div>
                
                <div className="mt-4 flex justify-end space-x-3">
                    {isEditing && (
                        <button 
                            onClick={resetForm} 
                            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition-colors"
                            disabled={saving}
                        >
                            취소
                        </button>
                    )}
                    <button 
                        onClick={handleSave} 
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={saving}
                    >
                        {saving ? '저장 중...' : (isEditing ? '수정 완료' : '등록')}
                    </button>
                </div>
            </div>

            {/* 전적 목록 테이블 */}
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="p-4 text-left text-sm font-semibold text-gray-300">ID</th>
                                <th className="p-4 text-left text-sm font-semibold text-gray-300">배틀러</th>
                                <th className="p-4 text-left text-sm font-semibold text-gray-300">vs</th>
                                <th className="p-4 text-left text-sm font-semibold text-gray-300">상대방</th>
                                <th className="p-4 text-left text-sm font-semibold text-gray-300">결과</th>
                                <th className="p-4 text-left text-sm font-semibold text-gray-300">스코어</th>
                                <th className="p-4 text-left text-sm font-semibold text-gray-300">게임타입</th>
                                <th className="p-4 text-left text-sm font-semibold text-gray-300">날짜</th>
                                <th className="p-4 text-left text-sm font-semibold text-gray-300">포인트</th>
                                <th className="p-4 text-left text-sm font-semibold text-gray-300">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {matchRecords.length > 0 ? (
                                matchRecords.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-750">
                                        <td className="p-4 text-white">#{record.id}</td>
                                        <td className="p-4 text-white">{getWarriorName(record.warriorId)}</td>
                                        <td className="p-4 text-gray-400">vs</td>
                                        <td className="p-4 text-blue-400">{getWarriorName(record.opponentId)}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-sm font-semibold ${getResultColor(record.result)}`}>
                                                {record.result}
                                            </span>
                                        </td>
                                        <td className="p-4 text-white">{record.score}</td>
                                        <td className="p-4 text-gray-300">{record.gameType}</td>
                                        <td className="p-4 text-gray-300">{new Date(record.matchDate).toLocaleDateString('ko-KR')}</td>
                                        <td className="p-4">
                                            <span className={`font-semibold ${
                                                (record.pointsChange || 0) > 0 ? 'text-green-400' : 
                                                (record.pointsChange || 0) < 0 ? 'text-red-400' : 'text-gray-400'
                                            }`}>
                                                {(record.pointsChange || 0) > 0 ? '+' : ''}{record.pointsChange || 0}
                                            </span>
                                        </td>
                                        <td className="p-4 flex space-x-2">
                                            <button 
                                                onClick={() => handleEdit(record)} 
                                                className="text-yellow-400 hover:text-yellow-300 transition-colors"
                                                disabled={saving}
                                            >
                                                수정
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(record.id)} 
                                                className="text-red-500 hover:text-red-400 transition-colors"
                                                disabled={saving}
                                            >
                                                삭제
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={10} className="p-8 text-center text-gray-400">
                                        등록된 전적 기록이 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MatchRecordManagePage; 