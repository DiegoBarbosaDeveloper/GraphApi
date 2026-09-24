import { ParseUUIDPipe } from '@nestjs/common';
import {
  Args,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Orden } from '../ordenes/ordenes.model.js';
import { OrdenesService } from '../ordenes/ordenes.service.js';
import { Pedido } from '../pedidos/pedidos.model.js';
import { PedidosService } from '../pedidos/pedidos.service.js';
import {
  ActualizarUsuarioInput,
  CrearUsuarioInput,
} from '../usuarios/usuarios.input.js';
import { Usuario } from '../usuarios/usuarios.model.js';
import { UsuariosService } from '../usuarios/usuarios.service.js';

const uuidPipe = new ParseUUIDPipe({ version: '4' });

@Resolver(() => Usuario)
export class UsuariosResolver {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly pedidosService: PedidosService,
    private readonly ordenesService: OrdenesService,
  ) {}

  @Query(() => [Usuario], { description: 'Lista todos los usuarios.' })
  usuarios(): Usuario[] {
    return this.usuariosService.findAll();
  }

  @Query(() => Usuario, { description: 'Obtiene un usuario por su id.' })
  usuario(@Args('id', { type: () => ID }, uuidPipe) id: string): Usuario {
    return this.usuariosService.findOne(id);
  }

  @Mutation(() => Usuario, { description: 'Crea un usuario.' })
  crearUsuario(@Args('input') input: CrearUsuarioInput): Usuario {
    return this.usuariosService.create(input);
  }

  @Mutation(() => Usuario, { description: 'Actualiza un usuario.' })
  actualizarUsuario(
    @Args('id', { type: () => ID }, uuidPipe) id: string,
    @Args('input') input: ActualizarUsuarioInput,
  ): Usuario {
    return this.usuariosService.update(id, input);
  }

  @Mutation(() => Boolean, {
    description: 'Elimina un usuario sin pedidos ni órdenes.',
  })
  eliminarUsuario(
    @Args('id', { type: () => ID }, uuidPipe) id: string,
  ): boolean {
    return this.usuariosService.remove(id);
  }

  @ResolveField('pedidos', () => [Pedido])
  pedidos(@Parent() usuario: Usuario): Pedido[] {
    return this.pedidosService.findByUsuario(usuario.id);
  }

  @ResolveField('ordenes', () => [Orden])
  ordenes(@Parent() usuario: Usuario): Orden[] {
    return this.ordenesService.findByUsuario(usuario.id);
  }
}
