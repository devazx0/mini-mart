import { IsIn, IsString } from "class-validator";

export class UpdateFulfillmentDto {
  @IsString()
  @IsIn(["processing", "shipped", "delivered", "completed"])
  status!: string;
}
