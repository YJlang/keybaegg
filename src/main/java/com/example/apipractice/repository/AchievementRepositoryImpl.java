package com.example.apipractice.repository;

import com.example.apipractice.domain.Achievement;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Repository
public class AchievementRepositoryImpl implements AchievementRepository {

    private final ObjectMapper objectMapper;
    private static final String ACHIEVEMENTS_DIR = "achievements";

    @Autowired
    public AchievementRepositoryImpl(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public List<Achievement> findByWarriorId(int warriorId) throws IOException {
        try {
            File file = getAchievementFile(warriorId);
            if (!file.exists()) {
                return new ArrayList<>();
            }
            
            List<Achievement> achievements = objectMapper.readValue(file, new TypeReference<List<Achievement>>() {});
            return achievements;
        } catch (Exception e) {
            // 파일이 없거나 읽기 실패 시 빈 리스트 반환
            return new ArrayList<>();
        }
    }

    @Override
    public void save(int warriorId, List<Achievement> achievements) throws IOException {
        try {
            File file = getAchievementFile(warriorId);
            // 디렉토리가 없으면 생성
            file.getParentFile().mkdirs();
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(file, achievements);
        } catch (Exception e) {
            throw new IOException("업적 데이터 저장 중 오류 발생", e);
        }
    }

    private File getAchievementFile(int warriorId) {
        return new File("./src/main/resources/" + ACHIEVEMENTS_DIR + "/warrior_" + warriorId + "_achievements.json");
    }
} 