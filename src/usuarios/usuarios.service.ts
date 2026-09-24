import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InMemoryStoreService } from '../store/in-memory-store.service.js';
import { ActualizarUsuarioInput, CrearUsuarioInput } from './usuarios.input.js';
import { Usuario } from './usuarios.model.js';

@Injectable()
export class UsuariosService {
  constructor(private readonly store: InMemoryStoreService) {}

  findAll(): Usuario[] {
    return [...this.store.usuarios.values()];
  }

  findOne(id: string): Usuario {
    const usuario = this.store.usuarios.get(id);

    if (!usuario) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado.`);
    }

    return usuario;
  }

  create(input: CrearUsuarioInput): Usuario {
    const nombre = this.normalizarTextoObligatorio(
      input.nombre,
      'El nombre no puede estar vacío.',
    );
    const email = this.normalizarTextoObligatorio(
      input.email,
      'El email no puede estar vacío.',
    ).toLowerCase();
    const telefono = this.normalizarTextoOpcional(input.telefono);
    this.assertEmailAvailable(email);

    const ahora = new Date();
    const usuario: Usuario = {
      id: randomUUID(),
      nombre,
      email,
      telefono,
      activo: true,
      pedidos: [],
      ordenes: [],
      creadoEn: ahora,
      actualizadoEn: ahora,
    };

    this.store.usuarios.set(usuario.id, usuario);
    return usuario;
  }

  update(id: string, input: ActualizarUsuarioInput): Usuario {
    const usuario = this.findOne(id);
    const nombre =
      input.nombre === undefined
        ? undefined
        : this.normalizarTextoObligatorio(
            input.nombre,
            'El nombre no puede estar vacío.',
          );
    const email =
      input.email === undefined
        ? undefined
        : this.normalizarTextoObligatorio(
            input.email,
            'El email no puede estar vacío.',
          ).toLowerCase();
    const telefono = this.normalizarTextoOpcional(input.telefono);

    if (email !== undefined) {
      this.assertEmailAvailable(email, id);
    }

    if (nombre !== undefined) {
      usuario.nombre = nombre;
    }

    if (email !== undefined) {
      usuario.email = email;
    }

    if (telefono !== undefined) {
      usuario.telefono = telefono;
    }

    if (input.activo !== undefined) {
      usuario.activo = input.activo;
    }

    usuario.actualizadoEn = new Date();
    return usuario;
  }

  remove(id: string): boolean {
    this.findOne(id);

    if (this.tienePedidos(id) || this.tieneOrdenes(id)) {
      throw new ConflictException(
        'No se puede eliminar un usuario que tiene pedidos u órdenes asociados.',
      );
    }

    return this.store.usuarios.delete(id);
  }

  private normalizarTextoObligatorio(valor: string, mensaje: string): string {
    const texto = valor.trim();

    if (!texto) {
      throw new BadRequestException(mensaje);
    }

    return texto;
  }

  private normalizarTextoOpcional(
    valor: string | null | undefined,
  ): string | null | undefined {
    if (valor === undefined || valor === null) {
      return valor;
    }

    return valor.trim() || null;
  }

  private assertEmailAvailable(email: string, usuarioId?: string): void {
    const emailEnUso = [...this.store.usuarios.values()].some(
      (usuario) => usuario.email === email && usuario.id !== usuarioId,
    );

    if (emailEnUso) {
      throw new ConflictException('Ya existe un usuario con ese email.');
    }
  }

  private tieneOrdenes(usuarioId: string): boolean {
    return [...this.store.ordenes.values()].some(
      (orden) => orden.usuarioId === usuarioId,
    );
  }

  private tienePedidos(usuarioId: string): boolean {
    return [...this.store.pedidos.values()].some(
      (pedido) => pedido.usuarioId === usuarioId,
    );
  }
}
