package com.tickets.api.dto.report;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateReportDto {
    
    @NotBlank(message = "Título é obrigatório")
    private String title;
    
    @NotBlank(message = "Descrição é obrigatória")
    private String description;
    
    private String imageUrl;
    
    @NotNull(message = "ID do autor é obrigatório")
    private String authorId;
    
    @NotNull(message = "ID da localização é obrigatório")
    private String locationId;
    
    @NotNull(message = "ID da categoria é obrigatório")
    private String categoryId;
}
