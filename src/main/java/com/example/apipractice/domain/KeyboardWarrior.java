package com.example.apipractice.domain;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KeyboardWarrior {
    private int id;
    private String nickname;
    private String tier;
    private int points;
    private String comment;
    private String profileImage;
}
