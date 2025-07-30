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

    public List<MatchRecord> getAllRecords() throws IOException {
        return repository.findAll();
    }

    public List<MatchRecord> getRecordsByWarriorId(int warriorId) throws IOException {
        return repository.findByWarriorId(warriorId);
    }

    public void addRecord(MatchRecord record) throws IOException {
        repository.save(record);
    }

    public void updateRecord(int id, MatchRecord record) throws IOException {
        repository.update(id, record);
    }

    public void deleteRecord(int id) throws IOException {
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