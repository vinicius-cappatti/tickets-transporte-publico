package com.tickets.api.dto.category;

import com.tickets.api.model.enums.CategoryType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateCategoryDto {

    @NotBlank(message = "Nome é obrigatório")
    private String name;

    @NotNull(message = "Tipo é obrigatório")
    private CategoryType type;

    private String description;
}
