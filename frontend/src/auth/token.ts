// src/auth/token.ts
const TOKEN_KEY = 'jwt_token';
const TOKEN_EXPIRY_KEY = 'jwt_token_expiry';

export const saveToken = (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    // 토큰 만료 시간 설정 (1시간 - 백엔드와 동일)
    const expiryTime = new Date().getTime() + (60 * 60 * 1000);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
};

export const getToken = (): string | null => {
    const token = localStorage.getItem(TOKEN_KEY);
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    
    if (!token || !expiry) {
        return null;
    }
    
    // 토큰 만료 체크
    if (new Date().getTime() > parseInt(expiry)) {
        removeToken();
        return null;
    }
    
    return token;
};

export const removeToken = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
};

export const isAuthenticated = (): boolean => {
    const token = getToken();
    return !!token;
};
