package com.tickets.api.controller;

import com.tickets.api.dto.common.PageResponseDto;
import com.tickets.api.dto.report.CreateReportDto;
import com.tickets.api.dto.report.ReportResponseDto;
import com.tickets.api.dto.report.UpdateStatusDto;
import com.tickets.api.model.enums.ReportStatus;
import com.tickets.api.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    public ResponseEntity<ReportResponseDto> create(@Valid @RequestBody CreateReportDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reportService.create(dto));
    }

    @GetMapping
    public ResponseEntity<PageResponseDto<ReportResponseDto>> findAll(
            @RequestParam(value = "page", required = false) Integer page,
            @RequestParam(value = "limit", required = false) Integer limit,
            @RequestParam(value = "status", required = false) ReportStatus status,
            @RequestParam(value = "locationId", required = false) String locationId,
            @RequestParam(value = "categoryId", required = false) String categoryId,
            @RequestParam(value = "authorId", required = false) String authorId
    ) {
        return ResponseEntity.ok(reportService.findAll(page, limit, status, locationId, categoryId, authorId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReportResponseDto> findById(@PathVariable String id) {
        return ResponseEntity.ok(reportService.findById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ReportResponseDto> updateStatus(@PathVariable String id, @Valid @RequestBody UpdateStatusDto dto) {
        return ResponseEntity.ok(reportService.updateStatus(id, dto));
    }
}
