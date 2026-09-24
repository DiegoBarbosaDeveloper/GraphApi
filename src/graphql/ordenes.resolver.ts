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
import {
  ActualizarOrdenInput,
  CrearOrdenInput,
} from '../ordenes/ordenes.input.js';
import { Orden } from '../ordenes/ordenes.model.js';
import { OrdenesService } from '../ordenes/ordenes.service.js';
import { Pedido } from '../pedidos/pedidos.model.js';
import { PedidosService } from '../pedidos/pedidos.service.js';
import { Pago } from '../pagos/pagos.model.js';
import { PagosService } from '../pagos/pagos.service.js';
import { Usuario } from '../usuarios/usuarios.model.js';
import { UsuariosService } from '../usuarios/usuarios.service.js';

const uuidPipe = new ParseUUIDPipe({ version: '4' });

@Resolver(() => Orden)
export class OrdenesResolver {
  constructor(
    private readonly ordenesService: OrdenesService,
    private readonly pedidosService: PedidosService,
    private readonly pagosService: PagosService,
    private readonly usuariosService: UsuariosService,
  ) {}

  @Query(() => [Orden], { description: 'Lista todas las ordenes.' })
  ordenes(): Orden[] {
    return this.ordenesService.findAll();
  }

  @Query(() => Orden, { description: 'Obtiene una orden por su id.' })
  orden(@Args('id', { type: () => ID }, uuidPipe) id: string): Orden {
    return this.ordenesService.findOne(id);
  }

  @Mutation(() => Orden, { description: 'Crea una orden.' })
  crearOrden(@Args('input') input: CrearOrdenInput): Orden {
    return this.ordenesService.create(input);
  }

  @Mutation(() => Orden, { description: 'Actualiza el estado de una orden.' })
  actualizarOrden(
    @Args('id', { type: () => ID }, uuidPipe) id: string,
    @Args('input') input: ActualizarOrdenInput,
  ): Orden {
    return this.ordenesService.update(id, input);
  }

  @Mutation(() => Boolean, {
    description: 'Elimina una orden que no tenga pedidos ni pagos.',
  })
  eliminarOrden(@Args('id', { type: () => ID }, uuidPipe) id: string): boolean {
    return this.ordenesService.remove(id);
  }

  @ResolveField('usuario', () => Usuario)
  usuario(@Parent() orden: Orden): Usuario {
    return this.usuariosService.findOne(orden.usuarioId);
  }

  @ResolveField('pedidos', () => [Pedido])
  pedidos(@Parent() orden: Orden): Pedido[] {
    return this.pedidosService.findByOrden(orden.id);
  }

  @ResolveField('pagos', () => [Pago])
  pagos(@Parent() orden: Orden): Pago[] {
    return this.pagosService.findByOrden(orden.id);
  }
}
