import {
  IsUUID,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  IsBoolean,
} from "class-validator";

export class GetProductDto {
  @IsUUID()
  @IsNotEmpty()
  readonly id!: string;
}

export class CreateProductDto {
  @IsString()
  readonly name!: string;

  @IsString()
  @IsOptional()
  readonly description!: string;

  @IsInt()
  @IsOptional()
  readonly stock!: number;

  @IsNumber()
  readonly price!: number;
}

export class UpdateProductDto {
  @IsString()
  readonly name!: string;

  @IsString()
  readonly description!: string;

  @IsInt()
  readonly stock!: number;

  @IsNumber()
  readonly price!: number;
}

export class UpdateProductStatusDto {
  @IsBoolean()
  readonly isActive!: boolean;
}
