import { ValidationArguments } from 'class-validator/types/validation/ValidationArguments';

export const getEnumValidMessage = ({
  property,
  constraints,
}: ValidationArguments) => {
  const correctValues = Object.values(constraints[0])
    .map((value: string) => value.toLowerCase())
    .join(', ');

  return `${property} must be one of the following values: ${correctValues}`;
};
