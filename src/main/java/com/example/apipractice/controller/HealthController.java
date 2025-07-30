package com.example.apipractice.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping("/")
    public String health() {
        return "Keyboard Warrior API is running!";
    }

    @GetMapping("/health")
    public String healthCheck() {
        return "OK";
    }
} 