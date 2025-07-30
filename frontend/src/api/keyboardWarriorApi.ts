// src/api/keyboardWarriorApi.ts
import axios from './axios';

export interface KeyboardWarrior {
    id: number;
    nickname: string;
    tier: string;
    points: number;
    comment: string;
    profileImage: string;
}

// 전체 배틀러 리스트 조회
export const fetchWarriors = async (): Promise<KeyboardWarrior[]> => {
    const res = await axios.get('/api/keyboard-warriors/allow');
    return res.data;
};

// 실시간 랭킹 조회 (포인트 순 정렬)
export const fetchRanking = async (): Promise<KeyboardWarrior[]> => {
    const res = await axios.get('/api/keyboard-warriors/ranking');
    return res.data;
};

// 개별 배틀러 상세 조회
export const fetchWarriorById = async (id: number): Promise<KeyboardWarrior> => {
    const res = await axios.get(`/api/keyboard-warriors/${id}`);
    return res.data;
};

// 신규 배틀러 등록
export const createWarrior = async (warrior: Omit<KeyboardWarrior, 'id'>): Promise<KeyboardWarrior> => {
    const res = await axios.post('/api/keyboard-warriors', warrior);
    return res.data;
};

// 배틀러 정보 수정
export const updateWarrior = async (warrior: KeyboardWarrior): Promise<KeyboardWarrior> => {
    const res = await axios.put(`/api/keyboard-warriors/${warrior.id}`, warrior);
    return res.data;
};

// 배틀러 삭제
export const deleteWarrior = async (id: number): Promise<void> => {
    await axios.delete(`/api/keyboard-warriors/${id}`);
};

// 프로필 이미지 업로드
export const uploadProfileImage = async (file: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const res = await axios.post('/api/upload/profile-image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
};

// 전적 기록 관련 타입과 API
export interface MatchRecord {
    id: number;
    warriorId: number;
    opponentId: number;
    result: 'WIN' | 'LOSE' | 'DRAW';
    score: string;
    matchDate: string;
    gameType: string;
    description: string;
    opponentName?: string;
    pointsChange?: number;
}

export interface MatchStats {
    totalMatches: number;
    wins: number;
    losses: number;
    draws: number;
    winRate: number;
}

// 배틀러별 전적 조회
export const fetchMatchRecords = async (warriorId: number): Promise<MatchRecord[]> => {
    const res = await axios.get(`/api/match-records/warrior/${warriorId}`);
    return res.data;
};

// 배틀러별 전적 통계 조회
export const fetchMatchStats = async (warriorId: number): Promise<MatchStats> => {
    const res = await axios.get(`/api/match-records/warrior/${warriorId}/stats`);
    return res.data;
};

// 관리자용 전적 관리 API
export const fetchAllMatchRecords = async (): Promise<MatchRecord[]> => {
    const res = await axios.get('/api/match-records');
    return res.data;
};

export const createMatchRecord = async (record: Omit<MatchRecord, 'id'>): Promise<MatchRecord> => {
    const res = await axios.post('/api/match-records', record);
    return res.data;
};

export const updateMatchRecord = async (record: MatchRecord): Promise<MatchRecord> => {
    const res = await axios.put(`/api/match-records/${record.id}`, record);
    return res.data;
};

export const deleteMatchRecord = async (id: number): Promise<void> => {
    await axios.delete(`/api/match-records/${id}`);
};
