package com.example.apipractice.security;

import com.example.apipractice.security.jwt.JwtAuthenticationFilter;
import com.example.apipractice.security.jwt.JwtTokenProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;

    public SecurityConfig(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 🔸 CORS 설정 추가
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList("http://localhost:3000")); // 프론트엔드 주소 또는 * 로 모두 허용 가능
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        config.setAllowCredentials(true); // 자격 증명 허용 (쿠키 등)

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config); // 모든 경로에 대해 적용
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .cors(Customizer.withDefaults()) // 🔹 CORS 활성화
                .csrf(csrf -> csrf.disable()) // CSRF 비활성화
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/users/register", "/api/users/login",
                                "/api/keyboard-warriors/allow", "/api/upload/**", "/api/test/**").permitAll()
                        .requestMatchers("/images/**", "/static/**", "/css/**", "/js/**", "/favicon.ico").permitAll() // 정적 리소스 허용
                        .anyRequest().authenticated()
                )
                .addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider), UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}
