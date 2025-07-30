package com.example.apipractice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/check-images")
    public ResponseEntity<String> checkImages() {
        try {
            String uploadDir = System.getProperty("user.dir") + "/src/main/resources/static/images/profiles/";
            Path dirPath = Paths.get(uploadDir);
            
            if (!Files.exists(dirPath)) {
                return ResponseEntity.ok("업로드 디렉토리가 존재하지 않습니다: " + uploadDir);
            }
            
            File dir = dirPath.toFile();
            File[] files = dir.listFiles();
            
            if (files == null || files.length == 0) {
                return ResponseEntity.ok("업로드 디렉토리가 비어있습니다: " + uploadDir);
            }
            
            StringBuilder result = new StringBuilder();
            result.append("업로드된 파일들:\n");
            for (File file : files) {
                result.append("- ").append(file.getName()).append(" (").append(file.length()).append(" bytes)\n");
            }
            
            return ResponseEntity.ok(result.toString());
        } catch (Exception e) {
            return ResponseEntity.ok("에러 발생: " + e.getMessage());
        }
    }

    @GetMapping("/auth-status")
    public ResponseEntity<String> checkAuthStatus() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            return ResponseEntity.ok("인증됨 - 사용자: " + auth.getName() + ", 권한: " + auth.getAuthorities());
        } else {
            return ResponseEntity.ok("인증되지 않음 - 사용자: " + (auth != null ? auth.getName() : "null"));
        }
    }
} 