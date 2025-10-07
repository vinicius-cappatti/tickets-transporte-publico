package com.tickets.api.dto.user;

import com.tickets.api.model.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateUserDto {
    
    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email deve ser válido")
    private String email;
    
    @NotBlank(message = "Nome é obrigatório")
    private String name;
    
    private UserRole role = UserRole.PEDESTRIAN;
}
