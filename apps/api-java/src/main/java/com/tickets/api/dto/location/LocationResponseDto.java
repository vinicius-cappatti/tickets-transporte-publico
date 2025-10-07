package com.tickets.api.dto.location;

import lombok.Data;

import java.time.Instant;

@Data
public class LocationResponseDto {
    private String id;
    private String name;
    private String address;
    private Double latitude;
    private Double longitude;
    private String type;
    private String description;
    private Instant createdAt;
    private Instant updatedAt;
    private String adminId;
    private String adminName;
}
