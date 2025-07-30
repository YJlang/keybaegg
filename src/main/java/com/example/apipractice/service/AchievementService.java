package com.example.apipractice.service;

import com.example.apipractice.domain.Achievement;
import com.example.apipractice.domain.MatchRecord;
import com.example.apipractice.domain.WarriorAchievements;
import com.example.apipractice.repository.AchievementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AchievementService {

    private final AchievementRepository repository;

    // 모든 업적 정의 (말싸움 배틀 전용)
    private static final List<Achievement> ALL_ACHIEVEMENTS = List.of(
        // 승리 관련 업적
        new Achievement("first_win", "첫 논쟁 승리", "첫 번째 말싸움에서 승리했습니다", "🥇", "VICTORY", 1, null, false),
        new Achievement("winning_streak_3", "논쟁 연승", "3연속 말싸움에서 승리했습니다", "🔥", "VICTORY", 3, null, false),
        new Achievement("winning_streak_5", "논쟁 중급자", "5연속 말싸움에서 승리했습니다", "🔥🔥", "VICTORY", 5, null, false),
        new Achievement("winning_streak_10", "논쟁왕", "10연속 말싸움에서 승리했습니다", "🔥🔥🔥", "VICTORY", 10, null, false),
        new Achievement("total_wins_10", "논쟁 초보", "총 10번의 말싸움에서 승리했습니다", "🏆", "VICTORY", 10, null, false),
        new Achievement("total_wins_50", "논쟁 중급", "총 50번의 말싸움에서 승리했습니다", "🏆🏆", "VICTORY", 50, null, false),
        new Achievement("total_wins_100", "논쟁 마스터", "총 100번의 말싸움에서 승리했습니다", "🏆🏆🏆", "VICTORY", 100, null, false),
        
        // 순위 관련 업적
        new Achievement("reach_rank_1", "최고의 논쟁가", "말싸움 랭킹 1위에 등극했습니다", "👑", "RANKING", 1, null, false),
        new Achievement("reach_rank_3", "상위 논쟁가", "말싸움 랭킹 3위 안에 진입했습니다", "🥉", "RANKING", 3, null, false),
        new Achievement("reach_rank_10", "상위 10위", "말싸움 랭킹 10위 안에 진입했습니다", "⭐", "RANKING", 10, null, false),
        new Achievement("tier_upgrade", "티어 상승", "상위 티어로 승급했습니다", "⬆️", "RANKING", 1, null, false),
        
        // 플랫폼 관련 업적
        new Achievement("platform_variety_3", "다재다능", "3가지 플랫폼에서 말싸움 승리를 달성했습니다", "💬", "PLATFORM", 3, null, false),
        new Achievement("platform_variety_5", "플랫폼 마스터", "5가지 플랫폼에서 말싸움 승리를 달성했습니다", "💬💬", "PLATFORM", 5, null, false),
        new Achievement("kakao_master", "카카오톡 논쟁왕", "카카오톡에서 10번의 말싸움에서 승리했습니다", "💬", "PLATFORM", 10, null, false),
        new Achievement("discord_master", "디스코드 논쟁왕", "디스코드에서 10번의 말싸움에서 승리했습니다", "🎧", "PLATFORM", 10, null, false),
        new Achievement("youtube_master", "유튜브 논쟁왕", "유튜브 댓글에서 10번의 말싸움에서 승리했습니다", "📺", "PLATFORM", 10, null, false),
        new Achievement("twitter_master", "트위터 논쟁왕", "트위터에서 10번의 말싸움에서 승리했습니다", "🐦", "PLATFORM", 10, null, false),
        
        // 특별 업적
        new Achievement("comeback_king", "역전 논쟁왕", "연속 3번의 말싸움에서 역전승을 달성했습니다", "💪", "SPECIAL", 3, null, false),
        new Achievement("perfect_win", "완벽한 논쟁", "상대방을 완전히 설득시켜 승리했습니다", "💎", "SPECIAL", 1, null, false),
        new Achievement("long_debate", "장기 논쟁", "2시간 이상의 말싸움을 진행했습니다", "⏰", "SPECIAL", 120, null, false),
        new Achievement("fact_checker", "팩트체커", "10번의 말싸움에서 사실 확인으로 승리했습니다", "🔍", "SPECIAL", 10, null, false),
        new Achievement("logic_master", "논리의 달인", "논리적 오류를 지적하여 20번 승리했습니다", "🧠", "SPECIAL", 20, null, false),
        new Achievement("calm_debater", "냉정한 논쟁가", "감정적 대응 없이 30번의 말싸움에서 승리했습니다", "😌", "SPECIAL", 30, null, false),
        new Achievement("topic_master", "주제 마스터", "정치, 경제, 사회 등 다양한 주제에서 승리했습니다", "📚", "SPECIAL", 5, null, false),
        new Achievement("respect_earner", "존중받는 논쟁가", "상대방으로부터 존중받으며 승리했습니다", "🤝", "SPECIAL", 10, null, false)
    );

    // 배틀러의 업적 조회
    public WarriorAchievements getWarriorAchievements(int warriorId) throws IOException {
        List<Achievement> achievements = repository.findByWarriorId(warriorId);
        
        // 업적이 없으면 기본 업적 목록 생성
        if (achievements.isEmpty()) {
            achievements = new ArrayList<>(ALL_ACHIEVEMENTS);
            repository.save(warriorId, achievements);
        }
        
        int unlockedCount = (int) achievements.stream().filter(Achievement::isUnlocked).count();
        
        return new WarriorAchievements(warriorId, achievements, achievements.size(), unlockedCount);
    }

    // 전적 등록 시 업적 체크 및 해금
    public List<Achievement> checkAndUnlockAchievements(int warriorId, MatchRecord newRecord, List<MatchRecord> allRecords) throws IOException {
        List<Achievement> newlyUnlocked = new ArrayList<>();
        WarriorAchievements warriorAchievements = getWarriorAchievements(warriorId);
        
        for (Achievement achievement : warriorAchievements.getAchievements()) {
            if (!achievement.isUnlocked() && checkAchievementCondition(achievement, allRecords, newRecord)) {
                achievement.setUnlocked(true);
                achievement.setUnlockedAt(LocalDate.now());
                newlyUnlocked.add(achievement);
            }
        }
        
        // 새로 해금된 업적이 있으면 저장
        if (!newlyUnlocked.isEmpty()) {
            repository.save(warriorId, warriorAchievements.getAchievements());
        }
        
        return newlyUnlocked;
    }

    // 업적 조건 체크
    private boolean checkAchievementCondition(Achievement achievement, List<MatchRecord> allRecords, MatchRecord newRecord) {
        switch (achievement.getId()) {
            case "first_win":
                return allRecords.stream().anyMatch(r -> "WIN".equals(r.getResult()));
                
            case "winning_streak_3":
            case "winning_streak_5":
            case "winning_streak_10":
                return checkWinningStreak(allRecords, achievement.getRequirement());
                
            case "total_wins_10":
            case "total_wins_50":
            case "total_wins_100":
                long totalWins = allRecords.stream().filter(r -> "WIN".equals(r.getResult())).count();
                return totalWins >= achievement.getRequirement();
                
            case "reach_rank_1":
            case "reach_rank_3":
            case "reach_rank_10":
                // 순위 체크는 별도 서비스에서 처리
                return false;
                
            case "game_variety_3":
            case "game_variety_5":
                long uniqueGames = allRecords.stream()
                    .filter(r -> "WIN".equals(r.getResult()))
                    .map(MatchRecord::getGameType)
                    .distinct()
                    .count();
                return uniqueGames >= achievement.getRequirement();
                
            case "kakao_master":
                long kakaoWins = allRecords.stream()
                    .filter(r -> "WIN".equals(r.getResult()) && "카카오톡".equals(r.getGameType()))
                    .count();
                return kakaoWins >= achievement.getRequirement();
                
            case "discord_master":
                long discordWins = allRecords.stream()
                    .filter(r -> "WIN".equals(r.getResult()) && "디스코드".equals(r.getGameType()))
                    .count();
                return discordWins >= achievement.getRequirement();
                
            default:
                return false;
        }
    }

    // 연승 체크
    private boolean checkWinningStreak(List<MatchRecord> records, int requiredStreak) {
        int currentStreak = 0;
        
        // 최근 경기부터 역순으로 체크
        for (int i = records.size() - 1; i >= 0; i--) {
            MatchRecord record = records.get(i);
            if ("WIN".equals(record.getResult())) {
                currentStreak++;
                if (currentStreak >= requiredStreak) {
                    return true;
                }
            } else {
                break; // 연승이 끊어짐
            }
        }
        
        return false;
    }

    // 관리자: 업적 해금/해제 토글
    public WarriorAchievements toggleAchievement(int warriorId, String achievementId) throws IOException {
        WarriorAchievements warriorAchievements = getWarriorAchievements(warriorId);
        
        for (Achievement achievement : warriorAchievements.getAchievements()) {
            if (achievement.getId().equals(achievementId)) {
                if (achievement.isUnlocked()) {
                    achievement.setUnlocked(false);
                    achievement.setUnlockedAt(null);
                } else {
                    achievement.setUnlocked(true);
                    achievement.setUnlockedAt(LocalDate.now());
                }
                break;
            }
        }
        
        repository.save(warriorId, warriorAchievements.getAchievements());
        return getWarriorAchievements(warriorId);
    }

    // 관리자: 모든 업적 해금
    public WarriorAchievements unlockAllAchievements(int warriorId) throws IOException {
        WarriorAchievements warriorAchievements = getWarriorAchievements(warriorId);
        
        for (Achievement achievement : warriorAchievements.getAchievements()) {
            achievement.setUnlocked(true);
            achievement.setUnlockedAt(LocalDate.now());
        }
        
        repository.save(warriorId, warriorAchievements.getAchievements());
        return getWarriorAchievements(warriorId);
    }

    // 관리자: 모든 업적 해제
    public WarriorAchievements lockAllAchievements(int warriorId) throws IOException {
        WarriorAchievements warriorAchievements = getWarriorAchievements(warriorId);
        
        for (Achievement achievement : warriorAchievements.getAchievements()) {
            achievement.setUnlocked(false);
            achievement.setUnlockedAt(null);
        }
        
        repository.save(warriorId, warriorAchievements.getAchievements());
        return getWarriorAchievements(warriorId);
    }

    // 관리자: 특정 업적 해금
    public WarriorAchievements unlockAchievement(int warriorId, String achievementId) throws IOException {
        WarriorAchievements warriorAchievements = getWarriorAchievements(warriorId);
        
        for (Achievement achievement : warriorAchievements.getAchievements()) {
            if (achievement.getId().equals(achievementId) && !achievement.isUnlocked()) {
                achievement.setUnlocked(true);
                achievement.setUnlockedAt(LocalDate.now());
                break;
            }
        }
        
        repository.save(warriorId, warriorAchievements.getAchievements());
        return getWarriorAchievements(warriorId);
    }

    // 관리자: 특정 업적 해제
    public WarriorAchievements lockAchievement(int warriorId, String achievementId) throws IOException {
        WarriorAchievements warriorAchievements = getWarriorAchievements(warriorId);
        
        for (Achievement achievement : warriorAchievements.getAchievements()) {
            if (achievement.getId().equals(achievementId) && achievement.isUnlocked()) {
                achievement.setUnlocked(false);
                achievement.setUnlockedAt(null);
                break;
            }
        }
        
        repository.save(warriorId, warriorAchievements.getAchievements());
        return getWarriorAchievements(warriorId);
    }
} 