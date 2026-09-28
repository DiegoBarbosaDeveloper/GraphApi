package com.mrcatordenes.service;

import com.mrcatordenes.model.Orden;
import com.mrcatordenes.repository.OrdenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrdenesService {
    private final OrdenRepository repository;
    
    public List<Orden> obtenerTodos() {
        return repository.findAll();
    }
    
    public Orden obtenerPorId(String id) {
        return repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Orden no encontrada: " + id));
    }
    
    @Transactional
    public Orden crear(String usuarioId) {
        Orden orden = Orden.builder()
            .usuarioId(usuarioId)
            .estado(Orden.EstadoOrden.PENDIENTE)
            .total(0.0)
            .build();
        return repository.save(orden);
    }
    
    @Transactional
    public Orden actualizar(String id, Orden.EstadoOrden estado) {
        Orden orden = obtenerPorId(id);
        if (estado != null) orden.setEstado(estado);
        return repository.save(orden);
    }
    
    @Transactional
    public boolean eliminar(String id) {
        if (!repository.existsById(id)) return false;
        repository.deleteById(id);
        return true;
    }
    
    @Transactional
    public Orden actualizarTotal(String id, Double total) {
        Orden orden = obtenerPorId(id);
        orden.setTotal(total);
        return repository.save(orden);
    }
}
