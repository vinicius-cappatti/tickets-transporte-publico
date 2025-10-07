package com.tickets.api.repository;

import com.tickets.api.model.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, String> {
    
    List<Comment> findByReportIdOrderByCreatedAtAsc(String reportId);
}
