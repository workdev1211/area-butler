import { registerDecorator, ValidationOptions } from 'class-validator';
import { ValidationArguments } from 'class-validator/types/validation/ValidationArguments';

export const IsNumberOrString =
  (validationOptions?: ValidationOptions) =>
  (object: any, propertyName: string) => {
    registerDecorator({
      name: 'IsNumberOrString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: string | number): boolean {
          return typeof value === 'string' || typeof value === 'number';
        },
        defaultMessage({ value }: ValidationArguments): string {
          return `${value} must be a number or a string`;
        },
      },
    });
  };
