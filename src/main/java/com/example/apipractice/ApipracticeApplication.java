package com.example.apipractice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@EnableTransactionManagement
@SpringBootApplication
public class ApipracticeApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApipracticeApplication.class, args);
    }

}
