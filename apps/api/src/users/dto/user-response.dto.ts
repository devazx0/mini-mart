import { Exclude } from "class-transformer";

export class UserResponseDto {
  id!: string;
  firstName!: string;
  lastName!: string;
  email!: string;
  phone!: string | null;
  dob!: Date;
  role!: string;
  createdAt!: Date;
  updatedAt!: Date;

  @Exclude()
  password?: never;
}
