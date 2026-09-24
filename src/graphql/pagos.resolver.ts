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
import { ActualizarPagoInput, CrearPagoInput } from '../pagos/pagos.input.js';
import { Pago } from '../pagos/pagos.model.js';
import { PagosService } from '../pagos/pagos.service.js';

const uuidPipe = new ParseUUIDPipe({ version: '4' });
const optionalUuidPipe = new ParseUUIDPipe({ version: '4', optional: true });

@Resolver(() => Pago)
export class PagosResolver {
  constructor(
    private readonly pagosService: PagosService,
    private readonly ordenesService: OrdenesService,
  ) {}

  @Query(() => [Pago], {
    description: 'Lista pagos; opcionalmente se filtran por orden.',
  })
  pagos(
    @Args('ordenId', { type: () => ID, nullable: true }, optionalUuidPipe)
    ordenId?: string | null,
  ): Pago[] {
    return this.pagosService.findAll(ordenId ?? undefined);
  }

  @Query(() => Pago, { description: 'Obtiene un pago por su id.' })
  pago(@Args('id', { type: () => ID }, uuidPipe) id: string): Pago {
    return this.pagosService.findOne(id);
  }

  @Mutation(() => Pago, { description: 'Crea un pago para una orden.' })
  crearPago(@Args('input') input: CrearPagoInput): Pago {
    return this.pagosService.create(input);
  }

  @Mutation(() => Pago, { description: 'Actualiza un pago.' })
  actualizarPago(
    @Args('id', { type: () => ID }, uuidPipe) id: string,
    @Args('input') input: ActualizarPagoInput,
  ): Pago {
    return this.pagosService.update(id, input);
  }

  @Mutation(() => Boolean, { description: 'Elimina un pago.' })
  eliminarPago(@Args('id', { type: () => ID }, uuidPipe) id: string): boolean {
    return this.pagosService.remove(id);
  }

  @ResolveField('orden', () => Orden)
  orden(@Parent() pago: Pago): Orden {
    return this.ordenesService.findOne(pago.ordenId);
  }
}
