package com.tickets.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tickets.api.dto.report.CreateReportDto;
import com.tickets.api.dto.report.ReportResponseDto;
import com.tickets.api.dto.report.UpdateStatusDto;
import com.tickets.api.model.enums.ReportStatus;
import com.tickets.api.service.ReportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReportControllerTest {

    private MockMvc mockMvc;

    private ObjectMapper mapper = new ObjectMapper();

    @Mock
    private ReportService reportService;

    @InjectMocks
    private ReportController reportController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(reportController).build();
    }

    @Test
    void postCreate_shouldReturn201() throws Exception {
        CreateReportDto dto = new CreateReportDto();
        dto.setAuthorId("u1");
        dto.setLocationId("l1");
        dto.setCategoryId("c1");
        dto.setTitle("t");
        dto.setDescription("d");

        ReportResponseDto resDto = new ReportResponseDto();
        resDto.setId("r1");

        when(reportService.create(any(CreateReportDto.class))).thenReturn(resDto);

        mockMvc.perform(post("/reports")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("r1"));
    }

    @Test
    void patchStatus_shouldReturn200() throws Exception {
        UpdateStatusDto dto = new UpdateStatusDto();
        dto.setUpdatedBy("u2");
        dto.setStatus(ReportStatus.RESOLVED_CONFIRMED);

        ReportResponseDto res = new ReportResponseDto();
        res.setId("r2");
        res.setStatus(ReportStatus.RESOLVED_CONFIRMED);

        when(reportService.updateStatus(any(), any(UpdateStatusDto.class))).thenReturn(res);

        mockMvc.perform(patch("/reports/r2/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RESOLVED_CONFIRMED"));
    }
}
