import { Field, ID, ObjectType, InputType, Float, Int } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@ObjectType()
@Entity('pedidos')
export class Pedido {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  producto: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  descripcion: string;

  @Field(() => Int)
  @Column()
  cantidad: number;

  @Field(() => Float)
  @Column()
  precioUnitario: number;

  @Field(() => Float)
  @Column()
  subtotal: number;

  @Field()
  @Column()
  usuarioId: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  ordenId: string;

  @Field()
  @CreateDateColumn()
  creadoEn: Date;

  @Field()
  @UpdateDateColumn()
  actualizadoEn: Date;
}

@InputType()
export class CrearPedidoInput {
  @Field()
  producto: string;

  @Field({ nullable: true })
  descripcion?: string;

  @Field(() => Int)
  cantidad: number;

  @Field(() => Float)
  precioUnitario: number;

  @Field()
  usuarioId: string;

  @Field({ nullable: true })
  ordenId?: string;
}

@InputType()
export class ActualizarPedidoInput {
  @Field({ nullable: true })
  producto?: string;

  @Field({ nullable: true })
  descripcion?: string;

  @Field(() => Int, { nullable: true })
  cantidad?: number;

  @Field(() => Float, { nullable: true })
  precioUnitario?: number;

  @Field({ nullable: true })
  ordenId?: string;
}
