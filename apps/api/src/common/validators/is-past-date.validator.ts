import {
  registerDecorator,
  type ValidationOptions,
} from "class-validator";

export function IsPastDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: "isPastDate",
      target: object.constructor,
      propertyName,
      options: validationOptions ?? { message: "dob must be a date in the past" },
      validator: {
        validate(value: unknown): boolean {
          return value instanceof Date && !Number.isNaN(value.getTime()) && value < new Date();
        },
      },
    });
  };
}
