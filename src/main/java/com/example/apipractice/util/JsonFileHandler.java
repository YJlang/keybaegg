package com.example.apipractice.util;

import com.example.apipractice.domain.KeyboardWarrior;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.File;
import java.io.IOException;
import java.util.List;
//src/main/resources/mock_data.json
public class JsonFileHandler {
    private static final String RESOURCE_FILE = "mock_data.json";
    private static final String EXTERNAL_FILE = "./data/mock_data.json";
    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static List<KeyboardWarrior> readWarriors() throws IOException {
        // 먼저 외부 파일에서 읽기 시도
        File externalFile = new File(EXTERNAL_FILE);
        if (externalFile.exists()) {
            return objectMapper.readValue(externalFile, new TypeReference<>() {});
        }
        
        // 외부 파일이 없으면 클래스패스에서 읽기
        try {
            var inputStream = JsonFileHandler.class.getClassLoader().getResourceAsStream(RESOURCE_FILE);
            if (inputStream == null) return List.of();
            return objectMapper.readValue(inputStream, new TypeReference<>() {});
        } catch (Exception e) {
            return List.of();
        }
    }

    public static void writeWarriors(List<KeyboardWarrior> warriors) throws IOException {
        // 외부 디렉토리 생성
        File externalFile = new File(EXTERNAL_FILE);
        externalFile.getParentFile().mkdirs();
        
        // 외부 파일에 쓰기
        objectMapper.writerWithDefaultPrettyPrinter().writeValue(externalFile, warriors);
    }
}
