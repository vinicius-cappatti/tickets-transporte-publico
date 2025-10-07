package com.tickets.api.dto.user;

import com.tickets.api.model.enums.UserRole;
import lombok.Data;

import java.time.Instant;

@Data
public class UserResponseDto {
    private String id;
    private String email;
    private String name;
    private UserRole role;
    private Instant createdAt;
    private Instant updatedAt;
}
