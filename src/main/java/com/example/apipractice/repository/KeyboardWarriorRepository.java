package com.example.apipractice.repository;

import com.example.apipractice.domain.KeyboardWarrior;

import java.io.IOException;
import java.util.List;

public interface KeyboardWarriorRepository {
    List<KeyboardWarrior> findAll() throws IOException;
    void save(KeyboardWarrior warrior) throws IOException;
    void update(int id, KeyboardWarrior warrior) throws IOException;
    void delete(int id) throws IOException;
}
