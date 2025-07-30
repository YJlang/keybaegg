package com.example.apipractice.security.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String requestURI = request.getRequestURI();
        System.out.println("JWT Filter - Request URI: " + requestURI);

        // 헤더에서 "Authorization: Bearer <token>" 추출
        String header = request.getHeader("Authorization");
        System.out.println("JWT Filter - Authorization header: " + (header != null ? header.substring(0, Math.min(20, header.length())) + "..." : "null"));

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7); // "Bearer " 제거

            if (jwtTokenProvider.validateToken(token)) {
                String username = jwtTokenProvider.getUsername(token);
                System.out.println("JWT Filter - Valid token for user: " + username);

                // 인증 객체 생성 (실제로는 DB에서 유저 정보를 조회해야 함)
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(username, null, Collections.emptyList());

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken); // 인증 정보 저장
                System.out.println("JWT Filter - Authentication set for user: " + username);
            } else {
                System.out.println("JWT Filter - Invalid token");
            }
        } else {
            System.out.println("JWT Filter - No valid Authorization header");
        }

        filterChain.doFilter(request, response);
    }
}