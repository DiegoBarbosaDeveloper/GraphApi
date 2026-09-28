package com.mrcatordenes.graphql;

import com.mrcatordenes.model.Orden;
import com.mrcatordenes.service.OrdenesService;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;
import java.util.List;

@Controller
@RequiredArgsConstructor
public class OrdenesResolver {
    private final OrdenesService service;
    
    @QueryMapping
    public List<Orden> ordenes() {
        return service.obtenerTodos();
    }
    
    @QueryMapping
    public Orden orden(@Argument String id) {
        return service.obtenerPorId(id);
    }
    
    @MutationMapping
    public Orden crearOrden(@Argument String usuarioId) {
        return service.crear(usuarioId);
    }
    
    @MutationMapping
    public Orden actualizarOrden(@Argument String id, @Argument String estado) {
        Orden.EstadoOrden estadoOrden = estado != null ? Orden.EstadoOrden.valueOf(estado) : null;
        return service.actualizar(id, estadoOrden);
    }
    
    @MutationMapping
    public boolean eliminarOrden(@Argument String id) {
        return service.eliminar(id);
    }
}
