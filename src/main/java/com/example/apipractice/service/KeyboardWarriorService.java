package com.example.apipractice.service;

import com.example.apipractice.domain.KeyboardWarrior;
import com.example.apipractice.repository.KeyboardWarriorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

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
}