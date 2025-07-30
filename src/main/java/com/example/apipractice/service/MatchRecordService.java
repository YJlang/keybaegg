package com.example.apipractice.service;

import com.example.apipractice.domain.MatchRecord;
import com.example.apipractice.repository.MatchRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MatchRecordService {

    private final MatchRecordRepository repository;
    private final AchievementService achievementService;
    private final KeyboardWarriorService keyboardWarriorService;

    public List<MatchRecord> getAllRecords() throws IOException {
        return repository.findAll();
    }

    public List<MatchRecord> getRecordsByWarriorId(int warriorId) throws IOException {
        return repository.findByWarriorId(warriorId);
    }

    public void addRecord(MatchRecord record) throws IOException {
        repository.save(record);
        
        // 포인트 변화가 있으면 배틀러 포인트 업데이트
        if (record.getPointsChange() != 0) {
            keyboardWarriorService.updateWarriorPoints(record.getWarriorId(), record.getPointsChange());
        }
        
        // 업적 체크 및 해금 (비동기로 처리할 수도 있음)
        try {
            List<MatchRecord> allRecords = getRecordsByWarriorId(record.getWarriorId());
            achievementService.checkAndUnlockAchievements(record.getWarriorId(), record, allRecords);
        } catch (Exception e) {
            // 업적 체크 실패는 전적 등록에 영향을 주지 않도록 함
            System.err.println("업적 체크 중 오류: " + e.getMessage());
        }
    }

    public void updateRecord(int id, MatchRecord record) throws IOException {
        // 기존 전적 조회하여 포인트 변화 차이 계산
        MatchRecord oldRecord = repository.findById(id);
        if (oldRecord != null) {
            // 기존 포인트 변화를 되돌리고 새로운 포인트 변화 적용
            if (oldRecord.getPointsChange() != 0) {
                keyboardWarriorService.updateWarriorPoints(oldRecord.getWarriorId(), -oldRecord.getPointsChange());
            }
        }
        
        repository.update(id, record);
        
        // 새로운 포인트 변화 적용
        if (record.getPointsChange() != 0) {
            keyboardWarriorService.updateWarriorPoints(record.getWarriorId(), record.getPointsChange());
        }
    }

    public void deleteRecord(int id) throws IOException {
        // 삭제 전에 기존 전적 조회하여 포인트 변화 되돌리기
        MatchRecord record = repository.findById(id);
        if (record != null && record.getPointsChange() != 0) {
            keyboardWarriorService.updateWarriorPoints(record.getWarriorId(), -record.getPointsChange());
        }
        
        repository.delete(id);
    }

    public MatchRecord getRecordById(int id) throws IOException {
        return repository.findById(id);
    }

    // 전적 통계 계산
    public MatchStats calculateStats(int warriorId) throws IOException {
        List<MatchRecord> records = repository.findByWarriorId(warriorId);
        
        int totalMatches = records.size();
        int wins = (int) records.stream().filter(r -> "WIN".equals(r.getResult())).count();
        int losses = (int) records.stream().filter(r -> "LOSE".equals(r.getResult())).count();
        int draws = (int) records.stream().filter(r -> "DRAW".equals(r.getResult())).count();
        
        double winRate = totalMatches > 0 ? (double) wins / totalMatches * 100 : 0;
        
        return new MatchStats(totalMatches, wins, losses, draws, winRate);
    }

    public static class MatchStats {
        private final int totalMatches;
        private final int wins;
        private final int losses;
        private final int draws;
        private final double winRate;

        public MatchStats(int totalMatches, int wins, int losses, int draws, double winRate) {
            this.totalMatches = totalMatches;
            this.wins = wins;
            this.losses = losses;
            this.draws = draws;
            this.winRate = winRate;
        }

        public int getTotalMatches() { return totalMatches; }
        public int getWins() { return wins; }
        public int getLosses() { return losses; }
        public int getDraws() { return draws; }
        public double getWinRate() { return winRate; }
    }
} 