package com.example.apipractice.service;

import com.example.apipractice.domain.KeyboardWarrior;
import com.example.apipractice.repository.KeyboardWarriorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.Comparator;

@Service
@RequiredArgsConstructor
public class KeyboardWarriorService {

    private final KeyboardWarriorRepository repository;

    public List<KeyboardWarrior> getAll() throws IOException {
        return repository.findAll();
    }

    public void add(KeyboardWarrior warrior) throws IOException {
        repository.save(warrior);
    }

    public void update(int id, KeyboardWarrior warrior) throws IOException {
        repository.update(id, warrior);
    }

    public void delete(int id) throws IOException {
        repository.delete(id);
    }

    public KeyboardWarrior getById(int id) throws IOException {
        return repository.findById(id);
    }

    // 포인트 계산 및 순위 업데이트
    public void updateWarriorPoints(int warriorId, int pointsChange) throws IOException {
        KeyboardWarrior warrior = repository.findById(warriorId);
        if (warrior != null) {
            warrior.setPoints(warrior.getPoints() + pointsChange);
            repository.update(warriorId, warrior);
        }
    }

    // 전체 배틀러 포인트 재계산
    public void recalculateAllPoints() throws IOException {
        List<KeyboardWarrior> warriors = repository.findAll();
        // 여기서 전적 데이터를 기반으로 포인트를 재계산할 수 있습니다
        // 현재는 기존 포인트를 유지합니다
    }

    // 순위별로 정렬된 배틀러 목록 (실시간 랭킹용)
    public List<KeyboardWarrior> getRankedWarriors() throws IOException {
        List<KeyboardWarrior> warriors = repository.findAll();
        
        // 티어별 정렬 (SS > S > A > B > C > D) 후 포인트 순으로 정렬
        warriors.sort(Comparator
            .comparing(KeyboardWarrior::getTier, (tier1, tier2) -> {
                // 티어 우선순위 정의
                String[] tierOrder = {"SS", "S", "A", "B", "C", "D"};
                int index1 = -1, index2 = -1;
                
                for (int i = 0; i < tierOrder.length; i++) {
                    if (tierOrder[i].equals(tier1)) index1 = i;
                    if (tierOrder[i].equals(tier2)) index2 = i;
                }
                
                // 알 수 없는 티어는 맨 뒤로
                if (index1 == -1) index1 = tierOrder.length;
                if (index2 == -1) index2 = tierOrder.length;
                
                return Integer.compare(index1, index2); // 낮은 인덱스가 높은 티어
            })
            .thenComparing(KeyboardWarrior::getPoints, Comparator.reverseOrder()) // 같은 티어 내에서는 포인트 높은 순
        );
        
        return warriors;
    }

    // 티어별 배틀러 목록 (기존 기능 유지)
    public List<KeyboardWarrior> getWarriorsByTier() throws IOException {
        return repository.findAll();
    }
}