package com.tickets.api.dto.common;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class PageResponseDto<T> {
    private List<T> data;
    private long total;
    private int page;
    private int limit;
    private int totalPages;
}
