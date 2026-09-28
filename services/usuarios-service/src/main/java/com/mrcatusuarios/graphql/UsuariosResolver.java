package com.mrcatusuarios.graphql;

import com.mrcatusuarios.model.Usuario;
import com.mrcatusuarios.service.UsuariosService;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;
import java.util.List;

@Controller
@RequiredArgsConstructor
public class UsuariosResolver {
    private final UsuariosService service;
    
    @QueryMapping
    public List<Usuario> usuarios() {
        return service.obtenerTodos();
    }
    
    @QueryMapping
    public Usuario usuario(@Argument String id) {
        return service.obtenerPorId(id);
    }
    
    @MutationMapping
    public Usuario crearUsuario(@Argument String nombre, @Argument String email, @Argument String telefono) {
        return service.crear(nombre, email, telefono);
    }
    
    @MutationMapping
    public Usuario actualizarUsuario(@Argument String id, @Argument String nombre, 
                                      @Argument String email, @Argument String telefono, 
                                      @Argument Boolean activo) {
        return service.actualizar(id, nombre, email, telefono, activo);
    }
    
    @MutationMapping
    public boolean eliminarUsuario(@Argument String id) {
        return service.eliminar(id);
    }
}
