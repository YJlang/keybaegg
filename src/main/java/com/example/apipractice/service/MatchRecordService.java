package com.example.apipractice.service;

import com.example.apipractice.domain.MatchRecord;
import com.example.apipractice.domain.KeyboardWarrior;
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
        List<MatchRecord> records = repository.findAll();
        return enrichRecordsWithOpponentNames(records);
    }

    public List<MatchRecord> getRecordsByWarriorId(int warriorId) throws IOException {
        List<MatchRecord> records = repository.findByWarriorId(warriorId);
        return enrichRecordsWithOpponentNames(records);
    }

    // 전적에 상대방 이름 추가하는 메서드
    private List<MatchRecord> enrichRecordsWithOpponentNames(List<MatchRecord> records) throws IOException {
        for (MatchRecord record : records) {
            setOpponentName(record);
        }
        return records;
    }

    // 개별 전적에 상대방 이름 설정하는 메서드
    private void setOpponentName(MatchRecord record) {
        try {
            KeyboardWarrior opponent = keyboardWarriorService.getById(record.getOpponentId());
            if (opponent != null) {
                record.setOpponentName(opponent.getNickname());
            } else {
                record.setOpponentName("알 수 없는 배틀러");
            }
        } catch (Exception e) {
            record.setOpponentName("알 수 없는 배틀러");
            System.err.println("상대방 정보 조회 실패 (ID: " + record.getOpponentId() + "): " + e.getMessage());
        }
    }

    public void addRecord(MatchRecord record) throws IOException {
        // 1. 상대방 이름 설정
        setOpponentName(record);
        
        // 2. 배틀러 전적 저장
        repository.save(record);
        
        // 3. 상대방 전적도 저장 (반대 결과로)
        MatchRecord opponentRecord = createOpponentRecord(record);
        repository.save(opponentRecord);
        
        // 4. 배틀러 포인트 변화 적용
        if (record.getPointsChange() != 0) {
            keyboardWarriorService.updateWarriorPoints(record.getWarriorId(), record.getPointsChange());
        }
        
        // 5. 상대방 포인트 변화 적용 (반대 값)
        if (record.getPointsChange() != 0) {
            keyboardWarriorService.updateWarriorPoints(record.getOpponentId(), -record.getPointsChange());
        }
        
        // 6. 업적 체크 및 해금 (배틀러)
        try {
            List<MatchRecord> allRecords = getRecordsByWarriorId(record.getWarriorId());
            achievementService.checkAndUnlockAchievements(record.getWarriorId(), record, allRecords);
        } catch (Exception e) {
            System.err.println("배틀러 업적 체크 중 오류: " + e.getMessage());
        }
        
        // 7. 업적 체크 및 해금 (상대방)
        try {
            List<MatchRecord> opponentRecords = getRecordsByWarriorId(record.getOpponentId());
            achievementService.checkAndUnlockAchievements(record.getOpponentId(), opponentRecord, opponentRecords);
        } catch (Exception e) {
            System.err.println("상대방 업적 체크 중 오류: " + e.getMessage());
        }
    }
    
    // 상대방 전적 생성 메서드
    private MatchRecord createOpponentRecord(MatchRecord originalRecord) {
        String opponentResult;
        switch (originalRecord.getResult()) {
            case "WIN":
                opponentResult = "LOSE";
                break;
            case "LOSE":
                opponentResult = "WIN";
                break;
            case "DRAW":
                opponentResult = "DRAW";
                break;
            default:
                opponentResult = "DRAW";
        }
        
        return MatchRecord.builder()
                .warriorId(originalRecord.getOpponentId())
                .opponentId(originalRecord.getWarriorId())
                .result(opponentResult)
                .score(originalRecord.getScore())
                .matchDate(originalRecord.getMatchDate())
                .gameType(originalRecord.getGameType())
                .description(originalRecord.getDescription())
                .pointsChange(-originalRecord.getPointsChange()) // 반대 포인트 변화
                .build();
    }

    public void updateRecord(int id, MatchRecord record) throws IOException {
        // 기존 전적 조회하여 포인트 변화 차이 계산
        MatchRecord oldRecord = repository.findById(id);
        if (oldRecord != null) {
            // 기존 배틀러 포인트 변화를 되돌리고 새로운 포인트 변화 적용
            if (oldRecord.getPointsChange() != 0) {
                keyboardWarriorService.updateWarriorPoints(oldRecord.getWarriorId(), -oldRecord.getPointsChange());
            }
            
            // 기존 상대방 포인트 변화를 되돌리기
            if (oldRecord.getPointsChange() != 0) {
                keyboardWarriorService.updateWarriorPoints(oldRecord.getOpponentId(), oldRecord.getPointsChange());
            }
            
            // 기존 상대방 전적도 삭제
            List<MatchRecord> allRecords = repository.findAll();
            allRecords.stream()
                    .filter(r -> r.getWarriorId() == oldRecord.getOpponentId() && 
                                r.getOpponentId() == oldRecord.getWarriorId() &&
                                r.getMatchDate().equals(oldRecord.getMatchDate()) &&
                                r.getScore().equals(oldRecord.getScore()))
                    .findFirst()
                    .ifPresent(opponentRecord -> {
                        try {
                            repository.delete(opponentRecord.getId());
                        } catch (IOException e) {
                            System.err.println("상대방 전적 삭제 중 오류: " + e.getMessage());
                        }
                    });
        }
        
        // 상대방 이름 설정
        setOpponentName(record);
        
        // 새로운 배틀러 전적 업데이트
        repository.update(id, record);
        
        // 새로운 상대방 전적 생성 및 저장
        MatchRecord opponentRecord = createOpponentRecord(record);
        repository.save(opponentRecord);
        
        // 새로운 배틀러 포인트 변화 적용
        if (record.getPointsChange() != 0) {
            keyboardWarriorService.updateWarriorPoints(record.getWarriorId(), record.getPointsChange());
        }
        
        // 새로운 상대방 포인트 변화 적용
        if (record.getPointsChange() != 0) {
            keyboardWarriorService.updateWarriorPoints(record.getOpponentId(), -record.getPointsChange());
        }
    }

    public void deleteRecord(int id) throws IOException {
        // 삭제 전에 기존 전적 조회하여 포인트 변화 되돌리기
        MatchRecord record = repository.findById(id);
        if (record != null) {
            // 배틀러 포인트 변화 되돌리기
            if (record.getPointsChange() != 0) {
                keyboardWarriorService.updateWarriorPoints(record.getWarriorId(), -record.getPointsChange());
            }
            
            // 상대방 포인트 변화 되돌리기
            if (record.getPointsChange() != 0) {
                keyboardWarriorService.updateWarriorPoints(record.getOpponentId(), record.getPointsChange());
            }
            
            // 상대방 전적도 삭제
            List<MatchRecord> allRecords = repository.findAll();
            allRecords.stream()
                    .filter(r -> r.getWarriorId() == record.getOpponentId() && 
                                r.getOpponentId() == record.getWarriorId() &&
                                r.getMatchDate().equals(record.getMatchDate()) &&
                                r.getScore().equals(record.getScore()))
                    .findFirst()
                    .ifPresent(opponentRecord -> {
                        try {
                            repository.delete(opponentRecord.getId());
                        } catch (IOException e) {
                            System.err.println("상대방 전적 삭제 중 오류: " + e.getMessage());
                        }
                    });
        }
        
        // 배틀러 전적 삭제
        repository.delete(id);
    }

    public MatchRecord getRecordById(int id) throws IOException {
        MatchRecord record = repository.findById(id);
        if (record != null) {
            try {
                KeyboardWarrior opponent = keyboardWarriorService.getById(record.getOpponentId());
                if (opponent != null) {
                    record.setOpponentName(opponent.getNickname());
                } else {
                    record.setOpponentName("알 수 없는 배틀러");
                }
            } catch (Exception e) {
                record.setOpponentName("알 수 없는 배틀러");
                System.err.println("상대방 정보 조회 실패 (ID: " + record.getOpponentId() + "): " + e.getMessage());
            }
        }
        return record;
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

    // 기존 전적 데이터의 상대방 이름을 업데이트하는 메서드 (데이터 마이그레이션용)
    public void migrateOpponentNames() throws IOException {
        List<MatchRecord> allRecords = repository.findAll();
        boolean hasChanges = false;
        
        for (MatchRecord record : allRecords) {
            if (record.getOpponentName() == null) {
                setOpponentName(record);
                hasChanges = true;
            }
        }
        
        if (hasChanges) {
            // 변경사항이 있으면 파일에 다시 저장
            for (MatchRecord record : allRecords) {
                repository.update(record.getId(), record);
            }
            System.out.println("전적 데이터의 상대방 이름 마이그레이션이 완료되었습니다.");
        }
    }
} 