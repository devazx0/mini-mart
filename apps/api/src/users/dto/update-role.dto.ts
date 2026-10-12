import { IsEnum } from "class-validator";

export enum UpdatableRole {
  buyer = "buyer",
  seller = "seller",
  admin = "admin",
}

export class UpdateRoleDto {
  @IsEnum(UpdatableRole, { message: "role must be buyer, seller or admin" })
  role!: UpdatableRole;
}
