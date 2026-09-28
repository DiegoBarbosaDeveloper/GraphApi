package com.mrcatordenes.repository;

import com.mrcatordenes.model.Orden;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrdenRepository extends JpaRepository<Orden, String> {
    List<Orden> findByUsuarioId(String usuarioId);
}
