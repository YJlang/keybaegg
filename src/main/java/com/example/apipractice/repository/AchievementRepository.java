package com.example.apipractice.repository;

import com.example.apipractice.domain.Achievement;

import java.io.IOException;
import java.util.List;

public interface AchievementRepository {
    List<Achievement> findByWarriorId(int warriorId) throws IOException;
    void save(int warriorId, List<Achievement> achievements) throws IOException;
} 