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
import {
  ActualizarPedidoInput,
  CrearPedidoInput,
} from '../pedidos/pedidos.input.js';
import { Pedido } from '../pedidos/pedidos.model.js';
import { PedidosService } from '../pedidos/pedidos.service.js';
import { Usuario } from '../usuarios/usuarios.model.js';
import { UsuariosService } from '../usuarios/usuarios.service.js';

const uuidPipe = new ParseUUIDPipe({ version: '4' });
const optionalUuidPipe = new ParseUUIDPipe({ version: '4', optional: true });

@Resolver(() => Pedido)
export class PedidosResolver {
  constructor(
    private readonly pedidosService: PedidosService,
    private readonly usuariosService: UsuariosService,
    private readonly ordenesService: OrdenesService,
  ) {}

  @Query(() => [Pedido], {
    description:
      'Lista pedidos; opcionalmente se filtran por usuario y/o orden.',
  })
  pedidos(
    @Args('usuarioId', { type: () => ID, nullable: true }, optionalUuidPipe)
    usuarioId?: string | null,
    @Args('ordenId', { type: () => ID, nullable: true }, optionalUuidPipe)
    ordenId?: string | null,
  ): Pedido[] {
    return this.pedidosService.findAll(
      usuarioId ?? undefined,
      ordenId ?? undefined,
    );
  }

  @Query(() => Pedido, { description: 'Obtiene un pedido por su id.' })
  pedido(@Args('id', { type: () => ID }, uuidPipe) id: string): Pedido {
    return this.pedidosService.findOne(id);
  }

  @Mutation(() => Pedido, { description: 'Crea un pedido en una orden.' })
  crearPedido(@Args('input') input: CrearPedidoInput): Pedido {
    return this.pedidosService.create(input);
  }

  @Mutation(() => Pedido, { description: 'Actualiza un pedido.' })
  actualizarPedido(
    @Args('id', { type: () => ID }, uuidPipe) id: string,
    @Args('input') input: ActualizarPedidoInput,
  ): Pedido {
    return this.pedidosService.update(id, input);
  }

  @Mutation(() => Boolean, { description: 'Elimina un pedido.' })
  eliminarPedido(
    @Args('id', { type: () => ID }, uuidPipe) id: string,
  ): boolean {
    return this.pedidosService.remove(id);
  }

  @ResolveField('usuario', () => Usuario)
  usuario(@Parent() pedido: Pedido): Usuario {
    return this.usuariosService.findOne(pedido.usuarioId);
  }

  @ResolveField('orden', () => Orden)
  orden(@Parent() pedido: Pedido): Orden {
    return this.ordenesService.findOne(pedido.ordenId);
  }
}
