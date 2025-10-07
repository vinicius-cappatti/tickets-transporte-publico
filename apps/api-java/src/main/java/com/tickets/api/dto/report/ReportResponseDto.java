package com.tickets.api.dto.report;

import com.tickets.api.model.enums.ReportStatus;
import lombok.Data;

import java.time.Instant;

@Data
public class ReportResponseDto {
    private String id;
    private String title;
    private String description;
    private ReportStatus status;
    private String imageUrl;
    private Instant createdAt;
    private Instant updatedAt;
    
    // Relações simplificadas
    private String authorId;
    private String authorName;
    private String locationId;
    private String locationName;
    private String categoryId;
    private String categoryName;
}
