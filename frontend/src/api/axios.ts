// src/api/axios.ts
import axios from 'axios';
import { getToken, removeToken } from '../auth/token';

const instance = axios.create({
    baseURL: window.location.origin, // 현재 도메인 자동 감지
    headers: { 'Content-Type': 'application/json' },
});

instance.interceptors.request.use(
    (config) => {
        const token = getToken();
        console.log('Request to:', config.url);
        console.log('Token exists:', !!token);
        if (token) {
            config.headers!['Authorization'] = `Bearer ${token}`;
            console.log('Authorization header set:', `Bearer ${token.substring(0, 20)}...`);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 응답 인터셉터 추가
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        // 401 Unauthorized 또는 403 Forbidden 에러 시 토큰 제거
        if (error.response?.status === 401 || error.response?.status === 403) {
            console.log('인증 에러 발생, 토큰 제거');
            removeToken();
            
            // 현재 페이지가 로그인 페이지가 아닌 경우에만 리다이렉트
            if (window.location.pathname !== '/login') {
                // 로그인 페이지로 리다이렉트
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default instance;
