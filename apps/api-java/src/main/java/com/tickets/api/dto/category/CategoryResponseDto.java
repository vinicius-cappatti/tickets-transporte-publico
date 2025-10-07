package com.tickets.api.dto.category;

import com.tickets.api.model.enums.CategoryType;
import lombok.Data;

import java.time.Instant;

@Data
public class CategoryResponseDto {
    private String id;
    private String name;
    private CategoryType type;
    private String description;
    private Instant createdAt;
    private Instant updatedAt;
}
