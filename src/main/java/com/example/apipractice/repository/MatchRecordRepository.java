package com.example.apipractice.repository;

import com.example.apipractice.domain.MatchRecord;

import java.io.IOException;
import java.util.List;

public interface MatchRecordRepository {
    List<MatchRecord> findAll() throws IOException;
    List<MatchRecord> findByWarriorId(int warriorId) throws IOException;
    void save(MatchRecord record) throws IOException;
    void update(int id, MatchRecord record) throws IOException;
    void delete(int id) throws IOException;
    MatchRecord findById(int id) throws IOException;
} 