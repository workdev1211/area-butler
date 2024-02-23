import { registerDecorator } from 'class-validator';

type TValidatorFunction = (value: unknown) => boolean;
type TValidatorFunctions = TValidatorFunction | TValidatorFunction[];

export const IsOneOfTypes = (
  validators: TValidatorFunctions[],
  allowedTypes: string[],
): ((obj: object, propertyName: string) => void) => {
  return (obj: object, propertyName: string): void => {
    registerDecorator({
      propertyName,
      name: 'isOneOfTypes',
      target: obj.constructor,
      validator: {
        validate(value: unknown): boolean | Promise<boolean> {
          return validators.some((validate) =>
            Array.isArray(validate)
              ? validate.every((nestedValidate) => nestedValidate(value))
              : validate(value),
          );
        },
        defaultMessage(): string {
          return `${propertyName} can only be one of the following types: ${allowedTypes.join(
            ', ',
          )}.`;
        },
      },
    });
  };
};
