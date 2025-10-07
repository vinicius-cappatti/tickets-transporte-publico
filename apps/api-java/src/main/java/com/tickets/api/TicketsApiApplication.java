package com.tickets.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class TicketsApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(TicketsApiApplication.class, args);
        System.out.println("🚀 API rodando em http://localhost:" + 
            System.getProperty("server.port", "3000"));
    }
}
