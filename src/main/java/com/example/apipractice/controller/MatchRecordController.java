package com.example.apipractice.controller;

import com.example.apipractice.domain.MatchRecord;
import com.example.apipractice.service.MatchRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/match-records")
@RequiredArgsConstructor
public class MatchRecordController {

    private final MatchRecordService service;

    // 배틀러별 전적 조회 (공개)
    @GetMapping("/warrior/{warriorId}")
    public ResponseEntity<List<MatchRecord>> getRecordsByWarriorId(@PathVariable int warriorId) throws IOException {
        List<MatchRecord> records = service.getRecordsByWarriorId(warriorId);
        return ResponseEntity.ok(records);
    }

    // 배틀러별 전적 통계 조회 (공개)
    @GetMapping("/warrior/{warriorId}/stats")
    public ResponseEntity<MatchRecordService.MatchStats> getWarriorStats(@PathVariable int warriorId) throws IOException {
        MatchRecordService.MatchStats stats = service.calculateStats(warriorId);
        return ResponseEntity.ok(stats);
    }

    // 전체 전적 조회 (관리자용)
    @GetMapping
    public ResponseEntity<List<MatchRecord>> getAllRecords() throws IOException {
        List<MatchRecord> records = service.getAllRecords();
        return ResponseEntity.ok(records);
    }

    // 전적 등록 (관리자용)
    @PostMapping
    public ResponseEntity<Void> addRecord(@RequestBody MatchRecord record) throws IOException {
        service.addRecord(record);
        return ResponseEntity.ok().build();
    }

    // 전적 수정 (관리자용)
    @PutMapping("/{id}")
    public ResponseEntity<Void> updateRecord(@PathVariable int id, @RequestBody MatchRecord record) throws IOException {
        service.updateRecord(id, record);
        return ResponseEntity.ok().build();
    }

    // 전적 삭제 (관리자용)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecord(@PathVariable int id) throws IOException {
        service.deleteRecord(id);
        return ResponseEntity.ok().build();
    }

    // 개별 전적 조회 (관리자용)
    @GetMapping("/{id}")
    public ResponseEntity<MatchRecord> getRecordById(@PathVariable int id) throws IOException {
        MatchRecord record = service.getRecordById(id);
        if (record == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(record);
    }

    // 데이터 마이그레이션 (관리자용)
    @PostMapping("/migrate-opponent-names")
    public ResponseEntity<Map<String, String>> migrateOpponentNames() throws IOException {
        service.migrateOpponentNames();
        Map<String, String> response = new HashMap<>();
        response.put("message", "상대방 이름 마이그레이션이 완료되었습니다.");
        return ResponseEntity.ok(response);
    }
} 