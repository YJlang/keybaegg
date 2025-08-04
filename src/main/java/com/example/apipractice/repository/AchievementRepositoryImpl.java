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
    private static final String EXTERNAL_ACHIEVEMENTS_DIR = "./data/achievements";

    @Autowired
    public AchievementRepositoryImpl(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public List<Achievement> findByWarriorId(int warriorId) throws IOException {
        try {
            // 먼저 외부 파일에서 읽기 시도
            File externalFile = getExternalAchievementFile(warriorId);
            if (externalFile.exists()) {
                return objectMapper.readValue(externalFile, new TypeReference<List<Achievement>>() {});
            }
            
            // 외부 파일이 없으면 클래스패스에서 읽기
            var inputStream = getClass().getClassLoader().getResourceAsStream(
                ACHIEVEMENTS_DIR + "/warrior_" + warriorId + "_achievements.json"
            );
            if (inputStream == null) {
                return new ArrayList<>();
            }
            
            return objectMapper.readValue(inputStream, new TypeReference<List<Achievement>>() {});
        } catch (Exception e) {
            // 파일이 없거나 읽기 실패 시 빈 리스트 반환
            return new ArrayList<>();
        }
    }

    @Override
    public void save(int warriorId, List<Achievement> achievements) throws IOException {
        try {
            File file = getExternalAchievementFile(warriorId);
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

    private File getExternalAchievementFile(int warriorId) {
        return new File(EXTERNAL_ACHIEVEMENTS_DIR + "/warrior_" + warriorId + "_achievements.json");
    }
} 