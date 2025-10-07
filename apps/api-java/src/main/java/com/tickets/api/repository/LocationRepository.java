package com.tickets.api.repository;

import com.tickets.api.model.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LocationRepository extends JpaRepository<Location, String> {
    
    List<Location> findByNameContainingIgnoreCase(String name);
    
    List<Location> findByType(String type);
}
