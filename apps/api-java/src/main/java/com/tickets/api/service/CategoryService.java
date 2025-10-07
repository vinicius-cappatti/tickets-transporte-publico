package com.tickets.api.service;

import com.tickets.api.dto.category.CategoryResponseDto;
import com.tickets.api.dto.category.CreateCategoryDto;
import com.tickets.api.exception.ConflictException;
import com.tickets.api.exception.ResourceNotFoundException;
import com.tickets.api.model.entity.Category;
import com.tickets.api.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional
    public CategoryResponseDto create(CreateCategoryDto dto) {
        if (categoryRepository.existsByName(dto.getName())) {
            throw new ConflictException("Categoria já existe");
        }

        Category category = Category.builder()
                .name(dto.getName())
                .type(dto.getType())
                .description(dto.getDescription())
                .build();

        Category saved = categoryRepository.save(category);
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponseDto> findAll() {
        return categoryRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryResponseDto findById(String id) {
        Category cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));
        return mapToDto(cat);
    }

    @Transactional
    public CategoryResponseDto update(String id, CreateCategoryDto dto) {
        Category cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));

        if (!cat.getName().equals(dto.getName()) && categoryRepository.existsByName(dto.getName())) {
            throw new ConflictException("Nome de categoria já em uso");
        }

        cat.setName(dto.getName());
        cat.setType(dto.getType());
        cat.setDescription(dto.getDescription());

        Category updated = categoryRepository.save(cat);
        return mapToDto(updated);
    }

    @Transactional
    public void delete(String id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Categoria não encontrada");
        }
        categoryRepository.deleteById(id);
    }

    private CategoryResponseDto mapToDto(Category c) {
        CategoryResponseDto dto = new CategoryResponseDto();
        dto.setId(c.getId());
        dto.setName(c.getName());
        dto.setType(c.getType());
        dto.setDescription(c.getDescription());
        dto.setCreatedAt(c.getCreatedAt());
        dto.setUpdatedAt(c.getUpdatedAt());
        return dto;
    }
}
