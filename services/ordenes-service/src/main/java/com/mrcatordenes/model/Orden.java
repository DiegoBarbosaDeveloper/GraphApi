package com.mrcatordenes.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ordenes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Orden {
    @Id
    private String id;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoOrden estado;
    
    @Column(nullable = false)
    private String usuarioId;
    
    @Column(nullable = false)
    private Double total;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime creadoEn;
    
    @Column(nullable = false)
    private LocalDateTime actualizadoEn;
    
    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID().toString();
        creadoEn = LocalDateTime.now();
        actualizadoEn = LocalDateTime.now();
        if (estado == null) estado = EstadoOrden.PENDIENTE;
        if (total == null) total = 0.0;
    }
    
    @PreUpdate
    protected void onUpdate() {
        actualizadoEn = LocalDateTime.now();
    }
    
    public enum EstadoOrden {
        PENDIENTE, PAGADA, COMPLETADA, CANCELADA
    }
}
