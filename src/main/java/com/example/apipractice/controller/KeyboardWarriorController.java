package com.example.apipractice.controller;

import com.example.apipractice.domain.KeyboardWarrior;
import com.example.apipractice.service.KeyboardWarriorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/keyboard-warriors")
@RequiredArgsConstructor
public class KeyboardWarriorController {

    private final KeyboardWarriorService service;

    @GetMapping("/allow")
    public ResponseEntity<List<KeyboardWarrior>> getAll() throws IOException {
        return ResponseEntity.ok(service.getAll());
    }

    @PostMapping
    public ResponseEntity<Void> add(@RequestBody KeyboardWarrior warrior) throws IOException {
        service.add(warrior);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> update(@PathVariable int id, @RequestBody KeyboardWarrior warrior) throws IOException {
        service.update(id, warrior);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) throws IOException {
        service.delete(id);
        return ResponseEntity.ok().build();
    }
}
