import { IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  readonly name!: string;

  @IsString()
  @IsOptional()
  readonly description!: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  readonly stock!: number;

  @IsNumber()
  @Min(0.01)
  @IsOptional()
  readonly price!: number;
}
