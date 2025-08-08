// src/pages/ManagePage.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    KeyboardWarrior,
    fetchWarriors,
    createWarrior,
    updateWarrior,
    deleteWarrior,
    uploadProfileImage,
} from '../api/keyboardWarriorApi';
import { isAuthenticated } from '../auth/token';

const TIERS = ['SS', 'S', 'A', 'B', 'C', 'D'];

const ManagePage: React.FC = () => {
    const [warriors, setWarriors] = useState<KeyboardWarrior[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    // 신규/수정용 상태
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [currentNickname, setCurrentNickname] = useState('');
    const [currentTier, setCurrentTier] = useState(TIERS[0]);
    const [currentPoints, setCurrentPoints] = useState(0);
    const [currentComment, setCurrentComment] = useState('');
    const [currentProfileImage, setCurrentProfileImage] = useState('/images/profiles/default.svg');
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // 인증 상태 확인
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }
        loadWarriors();
    }, [navigate]);

    const loadWarriors = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchWarriors();
            setWarriors(data);
        } catch (err) {
            setError('데이터를 불러오는 중 오류가 발생했습니다.');
            console.error('Error loading warriors:', err);
        } finally {
            setLoading(false);
        }
    };

    // 티어별로 정렬된 배틀러 목록 생성
    const sortedWarriors = TIERS.flatMap(tier => 
        warriors
            .filter(warrior => warrior.tier === tier)
            .sort((a, b) => b.points - a.points) // 포인트 높은 순으로 정렬
    );

    // 티어별 색상 정의
    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'SS': return 'bg-purple-600 text-purple-100';
            case 'S': return 'bg-yellow-600 text-yellow-100';
            case 'A': return 'bg-blue-600 text-blue-100';
            case 'B': return 'bg-green-600 text-green-100';
            case 'C': return 'bg-gray-600 text-gray-100';
            case 'D': return 'bg-red-600 text-red-100';
            default: return 'bg-gray-600 text-gray-100';
        }
    };

    // 티어별 섹션 색상
    const getTierSectionColor = (tier: string) => {
        switch (tier) {
            case 'SS': return 'border-purple-500/30 bg-purple-900/10';
            case 'S': return 'border-yellow-500/30 bg-yellow-900/10';
            case 'A': return 'border-blue-500/30 bg-blue-900/10';
            case 'B': return 'border-green-500/30 bg-green-900/10';
            case 'C': return 'border-gray-500/30 bg-gray-900/10';
            case 'D': return 'border-red-500/30 bg-red-900/10';
            default: return 'border-gray-500/30 bg-gray-900/10';
        }
    };

    const resetForm = () => {
        setIsEditing(null);
        setCurrentNickname('');
        setCurrentTier(TIERS[0]);
        setCurrentPoints(0);
        setCurrentComment('');
        setCurrentProfileImage('/images/profiles/default.svg');
        setSelectedImageFile(null);
        setImagePreview(null);
    };

    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // 파일 크기 체크 (5MB 제한)
            if (file.size > 5 * 1024 * 1024) {
                alert('파일 크기는 5MB 이하여야 합니다.');
                return;
            }

            // 파일 타입 체크
            if (!file.type.startsWith('image/')) {
                alert('이미지 파일만 업로드 가능합니다.');
                return;
            }

            setSelectedImageFile(file);
            
            // 미리보기 생성
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!currentNickname.trim()) {
            alert('닉네임을 입력하세요.');
            return;
        }

        if (currentPoints < 0) {
            alert('포인트는 0 이상이어야 합니다.');
            return;
        }

        try {
            setSaving(true);
            setError(null);

            let imageUrl = currentProfileImage;

            // 새 이미지가 선택된 경우 업로드
            if (selectedImageFile) {
                const uploadResult = await uploadProfileImage(selectedImageFile);
                imageUrl = uploadResult.imageUrl;
            }

            const warriorData = {
                nickname: currentNickname.trim(),
                tier: currentTier,
                points: currentPoints,
                comment: currentComment.trim(),
                profileImage: imageUrl,
            };

            if (isEditing) {
                // 수정
                await updateWarrior({
                    id: isEditing,
                    ...warriorData,
                });
            } else {
                // 신규 등록
                await createWarrior(warriorData);
            }

            resetForm();
            loadWarriors(); // 목록 새로고침
        } catch (err) {
            setError('저장 중 오류가 발생했습니다.');
            console.error('Error saving warrior:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (warrior: KeyboardWarrior) => {
        setIsEditing(warrior.id);
        setCurrentNickname(warrior.nickname);
        setCurrentTier(warrior.tier);
        setCurrentPoints(warrior.points);
        setCurrentComment(warrior.comment);
        setCurrentProfileImage(warrior.profileImage);
        setSelectedImageFile(null);
        setImagePreview(null);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('정말로 이 배틀러를 삭제하시겠습니까?')) {
            return;
        }

        try {
            setError(null);
            await deleteWarrior(id);
            loadWarriors(); // 목록 새로고침
        } catch (err) {
            setError('삭제 중 오류가 발생했습니다.');
            console.error('Error deleting warrior:', err);
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
            <h1 className="text-4xl font-bold text-center text-white mb-8">배틀러 관리</h1>

            {/* 등록/수정 폼 */}
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-6">
                    {isEditing ? '배틀러 수정' : '새 배틀러 등록'}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">닉네임</label>
                        <input
                            type="text"
                            value={currentNickname}
                            onChange={(e) => setCurrentNickname(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
                            placeholder="닉네임을 입력하세요"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">티어</label>
                        <select
                            value={currentTier}
                            onChange={(e) => setCurrentTier(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
                        >
                            {TIERS.map(tier => (
                                <option key={tier} value={tier}>{tier}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">포인트</label>
                        <input
                            type="number"
                            value={currentPoints}
                            onChange={(e) => setCurrentPoints(parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
                            placeholder="0"
                            min="0"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">프로필 이미지</label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">코멘트</label>
                        <textarea
                            value={currentComment}
                            onChange={(e) => setCurrentComment(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
                            placeholder="코멘트를 입력하세요"
                        />
                    </div>
                </div>

                {/* 이미지 미리보기 */}
                {(imagePreview || currentProfileImage !== '/images/profiles/default.svg') && (
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">미리보기</label>
                        <img
                            src={imagePreview || `${process.env.REACT_APP_API_BASE_URL || 'http://35.202.228.224'}${currentProfileImage}`}
                            alt="프로필 미리보기"
                            className="w-20 h-20 rounded-full object-cover border-2 border-gray-600"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjMzc0MTUxIi8+CjxjaXJjbGUgY3g9IjQwIiBjeT0iMzAiIHI9IjE1IiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0yMCA2MEw0MCA0NUw2MCA2MCIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjUiIGZpbGw9Im5vbmUiLz4KPC9zdmc+';
                            }}
                        />
                    </div>
                )}
                
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

            {/* 배틀러 목록 테이블 */}
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="p-4 text-left text-sm font-semibold text-gray-300">프로필</th>
                                <th className="p-4 text-left text-sm font-semibold text-gray-300">닉네임</th>
                                <th className="p-4 text-left text-sm font-semibold text-gray-300">티어</th>
                                <th className="p-4 text-left text-sm font-semibold text-gray-300">포인트</th>
                                <th className="p-4 text-left text-sm font-semibold text-gray-300">코멘트</th>
                                <th className="p-4 text-left text-sm font-semibold text-gray-300">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {sortedWarriors.length > 0 ? (
                                sortedWarriors.map((warrior, index) => {
                                    const isFirstInTier = index === 0 || sortedWarriors[index - 1].tier !== warrior.tier;
                                    
                                    return (
                                        <React.Fragment key={warrior.id}>
                                            {/* 티어 구분선 */}
                                            {isFirstInTier && (
                                                <tr className={`${getTierSectionColor(warrior.tier)}`}>
                                                    <td colSpan={6} className="p-3">
                                                        <div className="flex items-center justify-between">
                                                            <h3 className={`text-lg font-bold ${getTierColor(warrior.tier).replace('bg-', 'text-').replace(' text-', '')}`}>
                                                                {warrior.tier} 티어 ({sortedWarriors.filter(w => w.tier === warrior.tier).length}명)
                                                            </h3>
                                                            <span className="text-sm text-gray-400">
                                                                평균 {Math.round(sortedWarriors.filter(w => w.tier === warrior.tier).reduce((sum, w) => sum + w.points, 0) / sortedWarriors.filter(w => w.tier === warrior.tier).length).toLocaleString()} P
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                            <tr className="hover:bg-gray-750">
                                                <td className="p-4">
                                                    <img
                                                        src={`${process.env.REACT_APP_API_BASE_URL || 'http://35.202.228.224'}${warrior.profileImage}`}
                                                        alt={`${warrior.nickname} 프로필`}
                                                        className="w-12 h-12 rounded-full object-cover border border-gray-600"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjMzc0MTUxIi8+CjxjaXJjbGUgY3g9IjI0IiBjeT0iMTgiIHI9IjkiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEyIDM2TDI0IDI3TDM2IDM2IiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMyIgZmlsbD0ibm9uZSIvPgo8L3N2Zz4=';
                                                        }}
                                                    />
                                                </td>
                                                <td className="p-4 text-white">{warrior.nickname}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-sm font-semibold ${getTierColor(warrior.tier)}`}>
                                                        {warrior.tier}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-white">{warrior.points.toLocaleString()} P</td>
                                                <td className="p-4 text-gray-300 truncate max-w-xs">{warrior.comment}</td>
                                                <td className="p-4 flex space-x-2">
                                                    <button 
                                                        onClick={() => handleEdit(warrior)} 
                                                        className="text-yellow-400 hover:text-yellow-300 transition-colors"
                                                        disabled={saving}
                                                    >
                                                        수정
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(warrior.id)} 
                                                        className="text-red-500 hover:text-red-400 transition-colors"
                                                        disabled={saving}
                                                    >
                                                        삭제
                                                    </button>
                                                </td>
                                            </tr>
                                        </React.Fragment>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-400">
                                        등록된 배틀러가 없습니다.
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

export default ManagePage;
