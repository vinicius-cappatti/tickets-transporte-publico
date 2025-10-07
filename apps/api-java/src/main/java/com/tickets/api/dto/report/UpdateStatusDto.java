package com.tickets.api.dto.report;

import com.tickets.api.model.enums.ReportStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateStatusDto {
    @NotNull
    private ReportStatus status;
    private String comment;
    private String updatedBy; // user id
}
