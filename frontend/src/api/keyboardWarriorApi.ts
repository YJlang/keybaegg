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
