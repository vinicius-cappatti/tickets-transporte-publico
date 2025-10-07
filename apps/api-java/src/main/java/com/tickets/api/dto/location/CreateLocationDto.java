package com.tickets.api.dto.location;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateLocationDto {
    @NotBlank(message = "Nome é obrigatório")
    private String name;

    @NotBlank(message = "Endereço é obrigatório")
    private String address;

    @NotNull(message = "Latitude é obrigatória")
    private Double latitude;

    @NotNull(message = "Longitude é obrigatória")
    private Double longitude;

    @NotBlank(message = "Tipo é obrigatório")
    private String type;

    private String description;
}
