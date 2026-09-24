import { Field, InputType } from '@nestjs/graphql';
import { Transform, type TransformFnParams } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

const eliminarEspacios = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() : value;

@InputType({ description: 'Datos necesarios para crear un usuario.' })
export class CrearUsuarioInput {
  @Field()
  @Transform(eliminarEspacios)
  @IsString()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @MaxLength(120)
  nombre!: string;

  @Field()
  @Transform(eliminarEspacios)
  @IsEmail({}, { message: 'El email debe tener un formato válido.' })
  @MaxLength(180)
  email!: string;

  @Field(() => String, { nullable: true })
  @Transform(eliminarEspacios)
  @IsOptional()
  @IsString()
  @MaxLength(30)
  telefono?: string | null;
}

@InputType({ description: 'Campos que se pueden modificar en un usuario.' })
export class ActualizarUsuarioInput {
  @Field({ nullable: true })
  @Transform(eliminarEspacios)
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsString()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @MaxLength(120)
  nombre?: string;

  @Field({ nullable: true })
  @Transform(eliminarEspacios)
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsEmail({}, { message: 'El email debe tener un formato válido.' })
  @MaxLength(180)
  email?: string;

  @Field(() => String, { nullable: true })
  @Transform(eliminarEspacios)
  @IsOptional()
  @IsString()
  @MaxLength(30)
  telefono?: string | null;

  @Field(() => Boolean, { nullable: true })
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsBoolean()
  activo?: boolean;
}
