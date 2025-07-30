package com.example.apipractice.repository;

import com.example.apipractice.domain.KeyboardWarrior;
import com.example.apipractice.util.JsonFileHandler;
import org.springframework.stereotype.Repository;

import java.io.IOException;
import java.util.List;
import java.util.NoSuchElementException;

@Repository
public class KeyboardWarriorRepositoryImpl implements KeyboardWarriorRepository {

    @Override
    public List<KeyboardWarrior> findAll() throws IOException {
        return JsonFileHandler.readWarriors();
    }

    @Override
    public void save(KeyboardWarrior warrior) throws IOException {
        List<KeyboardWarrior> list = JsonFileHandler.readWarriors();
        int nextId = list.stream().mapToInt(KeyboardWarrior::getId).max().orElse(0) + 1;
        warrior.setId(nextId);
        list.add(warrior);
        JsonFileHandler.writeWarriors(list);
    }

    @Override
    public void update(int id, KeyboardWarrior warrior) throws IOException {
        List<KeyboardWarrior> list = JsonFileHandler.readWarriors();
        for (int i = 0; i < list.size(); i++) {
            if (list.get(i).getId() == id) {
                warrior.setId(id);
                list.set(i, warrior);
                JsonFileHandler.writeWarriors(list);
                return;
            }
        }
        throw new NoSuchElementException("해당 ID 없음");
    }

    @Override
    public void delete(int id) throws IOException {
        List<KeyboardWarrior> list = JsonFileHandler.readWarriors();
        list.removeIf(w -> w.getId() == id);
        JsonFileHandler.writeWarriors(list);
    }

    @Override
    public KeyboardWarrior findById(int id) throws IOException {
        List<KeyboardWarrior> list = JsonFileHandler.readWarriors();
        return list.stream()
                .filter(w -> w.getId() == id)
                .findFirst()
                .orElse(null);
    }
}
