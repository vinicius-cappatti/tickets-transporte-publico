package com.tickets.api.service;

import com.tickets.api.dto.report.CreateReportDto;
import com.tickets.api.dto.report.ReportResponseDto;
import com.tickets.api.dto.report.UpdateStatusDto;
import com.tickets.api.exception.ResourceNotFoundException;
import com.tickets.api.model.entity.Category;
import com.tickets.api.model.entity.Location;
import com.tickets.api.model.entity.Report;
import com.tickets.api.model.entity.StatusHistory;
import com.tickets.api.model.entity.User;
import com.tickets.api.model.enums.ReportStatus;
import com.tickets.api.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ReportServiceTest {

    @Mock
    private ReportRepository reportRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private LocationRepository locationRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private StatusHistoryRepository statusHistoryRepository;

    @InjectMocks
    private ReportService reportService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void create_shouldSaveReportAndReturnDto() {
        // Arrange
        User user = new User(); 
        user.setId("u1"); 
        user.setName("User 1");
        
        Location loc = new Location(); 
        loc.setId("l1"); 
        loc.setName("Loc");
        
        Category cat = new Category(); 
        cat.setId("c1"); 
        cat.setName("Cat");

        when(userRepository.findById("u1")).thenReturn(Optional.of(user));
        when(locationRepository.findById("l1")).thenReturn(Optional.of(loc));
        when(categoryRepository.findById("c1")).thenReturn(Optional.of(cat));

        Report saved = Report.builder()
                .id("r1")
                .title("t")
                .description("d")
                .author(user)
                .location(loc)
                .category(cat)
                .status(ReportStatus.PENDING)
                .build();

        when(reportRepository.save(any(Report.class))).thenReturn(saved);

        CreateReportDto dto = new CreateReportDto();
        dto.setAuthorId("u1");
        dto.setLocationId("l1");
        dto.setCategoryId("c1");
        dto.setTitle("t");
        dto.setDescription("d");

        // Act
        ReportResponseDto res = reportService.create(dto);

        // Assert
        assertNotNull(res);
        assertEquals("r1", res.getId());
        assertEquals("t", res.getTitle());
        verify(statusHistoryRepository, times(1)).save(any(StatusHistory.class));
    }

    @Test
    void findById_notFound_shouldThrow() {
        // Arrange
        when(reportRepository.findById("nope")).thenReturn(Optional.empty());
        
        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> reportService.findById("nope"));
    }

    @Test
    void updateStatus_shouldSaveNewStatus() {
        // Arrange
    User updater = new User();
    updater.setId("u-2");
    updater.setName("Admin");
    Location loc2 = new Location(); loc2.setId("l2"); loc2.setName("Loc 2");
    Category cat2 = new Category(); cat2.setId("c2"); cat2.setName("Cat 2");

    Report report = Report.builder()
        .id("r-2")
        .title("t")
        .description("d")
        .author(updater)
        .location(loc2)
        .category(cat2)
        .status(ReportStatus.PENDING)
        .build();

        when(reportRepository.findById(report.getId())).thenReturn(Optional.of(report));
        when(userRepository.findById(updater.getId())).thenReturn(Optional.of(updater));
        when(reportRepository.save(any(Report.class))).thenAnswer(inv -> inv.getArgument(0));

        UpdateStatusDto dto = new UpdateStatusDto();
        dto.setUpdatedBy(updater.getId());
    dto.setStatus(ReportStatus.RESOLVED_CONFIRMED);
        dto.setComment("Fixed");

        // Act
        ReportResponseDto res = reportService.updateStatus(report.getId(), dto);

        // Assert
        assertNotNull(res);
    assertEquals(ReportStatus.RESOLVED_CONFIRMED, res.getStatus());
        verify(statusHistoryRepository, times(1)).save(any(StatusHistory.class));
        verify(reportRepository, times(1)).save(any(Report.class));
    }

    @Test
    void findAll_returnsPaged() {
        // Arrange
    User author = new User(); author.setId("a1"); author.setName("Author");
    Location loc = new Location(); loc.setId("l1"); loc.setName("Loc");
    Category cat = new Category(); cat.setId("c1"); cat.setName("Cat");
    Report r = Report.builder()
        .id("r-3")
        .title("t")
        .description("d")
        .author(author)
        .location(loc)
        .category(cat)
        .build();
        Page<Report> page = new PageImpl<>(List.of(r), PageRequest.of(0, 10), 1);

        when(reportRepository.findByFilters(null, null, null, null, PageRequest.of(0, 10)))
                .thenReturn(page);

        // Act
        var res = reportService.findAll(1, 10, null, null, null, null);

        // Assert
        assertNotNull(res);
        assertEquals(1, res.getTotal());
    }
}