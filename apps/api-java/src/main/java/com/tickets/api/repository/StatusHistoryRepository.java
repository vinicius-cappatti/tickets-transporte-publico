package com.tickets.api.repository;

import com.tickets.api.model.entity.StatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StatusHistoryRepository extends JpaRepository<StatusHistory, String> {
    
    List<StatusHistory> findByReportIdOrderByCreatedAtDesc(String reportId);
}
