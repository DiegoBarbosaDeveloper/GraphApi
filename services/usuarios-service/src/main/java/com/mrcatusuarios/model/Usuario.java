package com.mrcatusuarios.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {
    @Id
    private String id;
    
    @Column(nullable = false)
    private String nombre;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    private String telefono;
    
    @Column(nullable = false)
    private Boolean activo;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime creadoEn;
    
    @Column(nullable = false)
    private LocalDateTime actualizadoEn;
    
    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID().toString();
        creadoEn = LocalDateTime.now();
        actualizadoEn = LocalDateTime.now();
        if (activo == null) activo = true;
        if (email != null) email = email.toLowerCase();
    }
    
    @PreUpdate
    protected void onUpdate() {
        actualizadoEn = LocalDateTime.now();
        if (email != null) email = email.toLowerCase();
    }
}
