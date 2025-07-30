package com.example.apipractice.domain;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchRecord {
    private int id;
    private int warriorId;
    private int opponentId;
    private String result; // WIN, LOSE, DRAW
    private String score; // "3-1", "2-2" 등
    private LocalDate matchDate;
    private String gameType; // 1v1, 2v2, Tournament
    private String description; // 전적 설명
    
    // 추가 정보 (선택사항)
    private String opponentName; // 상대방 닉네임 (조회 시 사용)
    private int pointsChange; // 포인트 변화량
} 