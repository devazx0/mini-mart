import {
  IsDate,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";
import { Transform, Type } from "class-transformer";
import { IsPastDate } from "../../common/validators/is-past-date.validator";

export enum SignupRole {
  buyer = "buyer",
  seller = "seller",
}

export class SignupDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  firstName!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  lastName!: string;

  @IsEmail()
  @MaxLength(255)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value,
  )
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: "password must contain at least one letter and one number",
  })
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @Type(() => Date)
  @IsDate()
  @IsPastDate()
  dob!: Date;

  @IsOptional()
  @IsEnum(SignupRole, { message: "role must be buyer or seller" })
  role?: SignupRole;
}
