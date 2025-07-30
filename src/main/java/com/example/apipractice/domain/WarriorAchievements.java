package com.example.apipractice.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WarriorAchievements {
    private int warriorId;
    private List<Achievement> achievements;
    private int totalAchievements;
    private int unlockedAchievements;
} 