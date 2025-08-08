package com.example.apipractice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://35.202.228.224", "http://35.202.228.224:80", "http://www.taja.me.kr", "http://taja.me.kr", "http://keybae.store", "http://www.keybae.store", "http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
        
        System.out.println("CORS 설정 등록됨: /api/** -> http://www.taja.me.kr, http://taja.me.kr, http://keybae.store");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 정적 리소스 핸들러 - 업로드된 이미지와 기본 이미지 모두 서빙
        registry.addResourceHandler("/images/**")
                .addResourceLocations(
                    "classpath:/static/images/",  // 기본 이미지
                    "file:./data/images/"         // 업로드된 이미지
                )
                .setCachePeriod(3600); // 1시간 캐시
        
        System.out.println("정적 리소스 핸들러 등록됨: /images/** -> classpath:/static/images/ + file:./data/images/");
    }
} 