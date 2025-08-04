package com.example.apipractice.repository;

import com.example.apipractice.domain.MatchRecord;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.NoSuchElementException;

@Repository
public class MatchRecordRepositoryImpl implements MatchRecordRepository {

    private static final String RESOURCE_FILE = "match_records.json";
    private static final String EXTERNAL_FILE = "./data/match_records.json";
    private final ObjectMapper objectMapper;

    @Autowired
    public MatchRecordRepositoryImpl(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public List<MatchRecord> findAll() throws IOException {
        // 먼저 외부 파일에서 읽기 시도
        File externalFile = new File(EXTERNAL_FILE);
        if (externalFile.exists()) {
            return objectMapper.readValue(externalFile, new TypeReference<List<MatchRecord>>() {});
        }
        
        // 외부 파일이 없으면 클래스패스에서 읽기
        try {
            var inputStream = getClass().getClassLoader().getResourceAsStream(RESOURCE_FILE);
            if (inputStream == null) {
                return List.of();
            }
            return objectMapper.readValue(inputStream, new TypeReference<List<MatchRecord>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }

    @Override
    public List<MatchRecord> findByWarriorId(int warriorId) throws IOException {
        List<MatchRecord> allRecords = findAll();
        return allRecords.stream()
                .filter(record -> record.getWarriorId() == warriorId)
                .sorted((a, b) -> b.getMatchDate().compareTo(a.getMatchDate())) // 최신순 정렬
                .toList();
    }

    @Override
    public void save(MatchRecord record) throws IOException {
        List<MatchRecord> records = findAll();
        int nextId = records.stream().mapToInt(MatchRecord::getId).max().orElse(0) + 1;
        record.setId(nextId);
        records.add(record);
        writeToFile(records);
    }

    @Override
    public void update(int id, MatchRecord record) throws IOException {
        List<MatchRecord> records = findAll();
        for (int i = 0; i < records.size(); i++) {
            if (records.get(i).getId() == id) {
                record.setId(id);
                records.set(i, record);
                writeToFile(records);
                return;
            }
        }
        throw new NoSuchElementException("해당 ID의 전적 기록이 없습니다: " + id);
    }

    @Override
    public void delete(int id) throws IOException {
        List<MatchRecord> records = findAll();
        records.removeIf(record -> record.getId() == id);
        writeToFile(records);
    }

    @Override
    public MatchRecord findById(int id) throws IOException {
        List<MatchRecord> records = findAll();
        return records.stream()
                .filter(record -> record.getId() == id)
                .findFirst()
                .orElse(null);
    }

    private void writeToFile(List<MatchRecord> records) throws IOException {
        // 외부 디렉토리 생성
        File externalFile = new File(EXTERNAL_FILE);
        externalFile.getParentFile().mkdirs();
        
        // 외부 파일에 쓰기
        objectMapper.writerWithDefaultPrettyPrinter().writeValue(externalFile, records);
    }
} 