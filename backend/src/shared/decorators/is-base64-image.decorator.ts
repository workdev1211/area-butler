import { registerDecorator, isString, isBase64 } from 'class-validator';

export const isBase64Image = (value: unknown): boolean => {
  if (!isString(value)) {
    return false;
  }

  const matchedData = value.match(/^data:(.*);base64,(.*)/);

  if (!Array.isArray(matchedData)) {
    return false;
  }

  return (
    ['image/jpeg', 'image/png'].includes(matchedData[1]) &&
    isBase64(matchedData[2])
  );
};

export const IsBase64Image = (): ((
  obj: object,
  propertyName: string,
) => void) => {
  return (obj: object, propertyName: string): void => {
    registerDecorator({
      propertyName,
      name: 'isBase64Image',
      target: obj.constructor,
      validator: {
        validate: (value: unknown): boolean => isBase64Image(value),
        defaultMessage(): string {
          return `${propertyName} should be a base64 encoded image.`;
        },
      },
    });
  };
};
