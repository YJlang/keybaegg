package com.example.apipractice.controller;

import com.example.apipractice.domain.Achievement;
import com.example.apipractice.domain.WarriorAchievements;
import com.example.apipractice.service.AchievementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/achievements")
@RequiredArgsConstructor
public class AchievementController {

    private final AchievementService achievementService;

    // 배틀러의 업적 조회 (공개)
    @GetMapping("/warrior/{warriorId}")
    public ResponseEntity<WarriorAchievements> getWarriorAchievements(@PathVariable int warriorId) throws IOException {
        WarriorAchievements achievements = achievementService.getWarriorAchievements(warriorId);
        return ResponseEntity.ok(achievements);
    }

    // 관리자: 업적 해금/해제
    @PostMapping("/warrior/{warriorId}/toggle/{achievementId}")
    public ResponseEntity<WarriorAchievements> toggleAchievement(
            @PathVariable int warriorId, 
            @PathVariable String achievementId) throws IOException {
        WarriorAchievements achievements = achievementService.toggleAchievement(warriorId, achievementId);
        return ResponseEntity.ok(achievements);
    }

    // 관리자: 모든 업적 해금
    @PostMapping("/warrior/{warriorId}/unlock-all")
    public ResponseEntity<WarriorAchievements> unlockAllAchievements(@PathVariable int warriorId) throws IOException {
        WarriorAchievements achievements = achievementService.unlockAllAchievements(warriorId);
        return ResponseEntity.ok(achievements);
    }

    // 관리자: 모든 업적 해제
    @PostMapping("/warrior/{warriorId}/lock-all")
    public ResponseEntity<WarriorAchievements> lockAllAchievements(@PathVariable int warriorId) throws IOException {
        WarriorAchievements achievements = achievementService.lockAllAchievements(warriorId);
        return ResponseEntity.ok(achievements);
    }

    // 관리자: 특정 업적 해금
    @PostMapping("/warrior/{warriorId}/unlock/{achievementId}")
    public ResponseEntity<WarriorAchievements> unlockAchievement(
            @PathVariable int warriorId, 
            @PathVariable String achievementId) throws IOException {
        WarriorAchievements achievements = achievementService.unlockAchievement(warriorId, achievementId);
        return ResponseEntity.ok(achievements);
    }

    // 관리자: 특정 업적 해제
    @PostMapping("/warrior/{warriorId}/lock/{achievementId}")
    public ResponseEntity<WarriorAchievements> lockAchievement(
            @PathVariable int warriorId, 
            @PathVariable String achievementId) throws IOException {
        WarriorAchievements achievements = achievementService.lockAchievement(warriorId, achievementId);
        return ResponseEntity.ok(achievements);
    }
} 