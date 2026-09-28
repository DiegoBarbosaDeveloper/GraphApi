package com.mrcatusuarios.service;

import com.mrcatusuarios.model.Usuario;
import com.mrcatusuarios.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuariosService {
    private final UsuarioRepository repository;
    
    public List<Usuario> obtenerTodos() {
        return repository.findAll();
    }
    
    public Usuario obtenerPorId(String id) {
        return repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + id));
    }
    
    @Transactional
    public Usuario crear(String nombre, String email, String telefono) {
        if (repository.existsByEmail(email.toLowerCase())) {
            throw new RuntimeException("El email ya está registrado: " + email);
        }
        Usuario usuario = Usuario.builder()
            .nombre(nombre)
            .email(email)
            .telefono(telefono)
            .activo(true)
            .build();
        return repository.save(usuario);
    }
    
    @Transactional
    public Usuario actualizar(String id, String nombre, String email, String telefono, Boolean activo) {
        Usuario usuario = obtenerPorId(id);
        if (nombre != null) usuario.setNombre(nombre);
        if (email != null) {
            if (!email.equalsIgnoreCase(usuario.getEmail()) && repository.existsByEmail(email.toLowerCase())) {
                throw new RuntimeException("El email ya está registrado: " + email);
            }
            usuario.setEmail(email);
        }
        if (telefono != null) usuario.setTelefono(telefono);
        if (activo != null) usuario.setActivo(activo);
        return repository.save(usuario);
    }
    
    @Transactional
    public boolean eliminar(String id) {
        if (!repository.existsById(id)) return false;
        repository.deleteById(id);
        return true;
    }
}
