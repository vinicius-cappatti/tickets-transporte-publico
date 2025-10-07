package com.tickets.api.model.enums;

public enum ReportStatus {
    PENDING,              // Pendente de análise
    IN_ANALYSIS,          // Em análise pelo administrador
    RESOLVED_PROVISIONAL, // Resolvido provisoriamente (aguardando confirmação)
    RESOLVED_CONFIRMED,   // Resolvido e confirmado pelo autor
    ARCHIVED              // Arquivado
}
