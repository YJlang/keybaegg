package com.example.apipractice.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Achievement {
    private String id;
    private String name;
    private String description;
    private String icon;
    private String category; // VICTORY, RANKING, GAME, SPECIAL
    private int requirement; // 달성 조건 (예: 10연승, 100승 등)
    private LocalDate unlockedAt; // 해금 날짜 (null이면 미해금)
    private boolean unlocked; // 해금 여부
    
    // isUnlocked getter (호환성을 위해)
    public boolean isUnlocked() {
        return unlocked;
    }
    
    // setUnlocked setter (호환성을 위해)
    public void setUnlocked(boolean unlocked) {
        this.unlocked = unlocked;
    }
} 