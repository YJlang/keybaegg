package com.example.apipractice.util;

import com.example.apipractice.domain.KeyboardWarrior;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.File;
import java.io.IOException;
import java.util.List;
//src/main/resources/mock_data.json
public class JsonFileHandler {
    private static final String FILE_PATH = "./src/main/resources/mock_data.json/";
    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static List<KeyboardWarrior> readWarriors() throws IOException {
        File file = new File(FILE_PATH);
        if (!file.exists()) return List.of();
        return objectMapper.readValue(file, new TypeReference<>() {});
    }

    public static void writeWarriors(List<KeyboardWarrior> warriors) throws IOException {
        objectMapper.writerWithDefaultPrettyPrinter().writeValue(new File(FILE_PATH), warriors);
    }
}
