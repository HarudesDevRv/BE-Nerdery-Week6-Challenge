import { IsBoolean } from "class-validator";

export class UpdateProductStatusDto {
  @IsBoolean()
  readonly isActive!: boolean;
}
