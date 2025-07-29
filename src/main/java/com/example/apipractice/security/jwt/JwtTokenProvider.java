package com.example.apipractice.security.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {

    // 시크릿 키 (프로젝트 시작 시 생성한 키를 ENV 또는 properties에서 불러오는 게 이상적)
    private final Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256); // 간단하게 자동 생성

    // 토큰 유효 시간 (예: 1시간)
    private final long validityInMilliseconds = 3600000;

    // 토큰 생성 (로그인 성공 시 호출됨)
    public String createToken(String username) {
        Claims claims = Jwts.claims().setSubject(username); // 유저 정보를 담는 부분

        Date now = new Date();
        Date validity = new Date(now.getTime() + validityInMilliseconds);

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now) // 토큰 발행 시간
                .setExpiration(validity) // 만료 시간
                .signWith(key)
                .compact();
    }

    // 토큰에서 사용자 정보 추출
    public String getUsername(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    // 토큰 유효성 검사
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
