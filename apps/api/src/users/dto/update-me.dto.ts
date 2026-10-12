import {
  IsDate,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { Transform, Type } from "class-transformer";
import { IsPastDate } from "../../common/validators/is-past-date.validator";

export class UpdateMeDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @IsPastDate()
  dob?: Date;
}
