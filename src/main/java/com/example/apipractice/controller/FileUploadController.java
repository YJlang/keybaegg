package com.example.apipractice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    // 절대 경로로 변경
    private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/src/main/resources/static/images/profiles/";

    @PostMapping("/profile-image")
    public ResponseEntity<ImageUploadResponse> uploadProfileImage(@RequestParam("image") MultipartFile file) {
        try {
            // 파일이 비어있는지 확인
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new ImageUploadResponse("업로드할 파일이 없습니다.", null));
            }

            // 파일 확장자 검증
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null) {
                return ResponseEntity.badRequest()
                    .body(new ImageUploadResponse("파일명이 없습니다.", null));
            }

            if (!isValidImageFile(originalFilename)) {
                return ResponseEntity.badRequest()
                    .body(new ImageUploadResponse("지원하지 않는 이미지 형식입니다. (JPG, PNG, GIF, SVG, WEBP만 허용)", null));
            }

            // 파일 크기 검증 (5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest()
                    .body(new ImageUploadResponse("파일 크기는 5MB 이하여야 합니다.", null));
            }

            // 업로드 디렉토리 생성
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                boolean created = uploadDir.mkdirs();
                if (!created) {
                    System.err.println("디렉토리 생성 실패: " + UPLOAD_DIR);
                    return ResponseEntity.internalServerError()
                        .body(new ImageUploadResponse("업로드 디렉토리를 생성할 수 없습니다.", null));
                }
            }

            // 고유한 파일명 생성
            String fileExtension = getFileExtension(originalFilename);
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
            
            // 파일 저장
            Path filePath = Paths.get(UPLOAD_DIR + uniqueFilename);
            Files.copy(file.getInputStream(), filePath);

            // 파일이 실제로 저장되었는지 확인
            if (!Files.exists(filePath)) {
                System.err.println("파일 저장 실패: " + filePath.toAbsolutePath());
                return ResponseEntity.internalServerError()
                    .body(new ImageUploadResponse("파일 저장에 실패했습니다.", null));
            }

            // 응답 URL 생성
            String imageUrl = "/images/profiles/" + uniqueFilename;

            System.out.println("이미지 업로드 성공: " + imageUrl);
            System.out.println("저장 경로: " + filePath.toAbsolutePath());
            System.out.println("파일 크기: " + Files.size(filePath) + " bytes");
            System.out.println("파일 존재 여부: " + Files.exists(filePath));

            return ResponseEntity.ok(new ImageUploadResponse("이미지 업로드 성공", imageUrl));

        } catch (IOException e) {
            System.err.println("이미지 업로드 오류: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(new ImageUploadResponse("이미지 업로드 중 오류가 발생했습니다: " + e.getMessage(), null));
        } catch (Exception e) {
            System.err.println("예상치 못한 오류: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(new ImageUploadResponse("예상치 못한 오류가 발생했습니다: " + e.getMessage(), null));
        }
    }

    private boolean isValidImageFile(String filename) {
        String extension = getFileExtension(filename).toLowerCase();
        return extension.equals(".jpg") || extension.equals(".jpeg") || 
               extension.equals(".png") || extension.equals(".gif") || 
               extension.equals(".svg") || extension.equals(".webp");
    }

    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        return lastDotIndex > 0 ? filename.substring(lastDotIndex) : "";
    }

    public static class ImageUploadResponse {
        private String message;
        private String imageUrl;

        public ImageUploadResponse(String message, String imageUrl) {
            this.message = message;
            this.imageUrl = imageUrl;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public String getImageUrl() {
            return imageUrl;
        }

        public void setImageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
        }
    }
} 