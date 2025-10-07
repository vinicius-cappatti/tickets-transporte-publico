package com.tickets.api.repository;

import com.tickets.api.model.entity.Category;
import com.tickets.api.model.enums.CategoryType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, String> {
    
    Optional<Category> findByName(String name);
    
    List<Category> findByType(CategoryType type);
    
    boolean existsByName(String name);
}
