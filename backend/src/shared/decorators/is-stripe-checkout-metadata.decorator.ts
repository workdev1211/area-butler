import { ValidateBy, ValidationOptions } from 'class-validator';
import Stripe from 'stripe';

const allowedPropertyKeyTypes = ['string'];
const allowedPropertyValueTypes = ['string', 'number', 'null'];

const getDataType = (data: unknown) => (data === null ? 'null' : typeof data);

export const IsStripeCheckoutMetadata = (
  validationOptions?: ValidationOptions,
): PropertyDecorator => {
  return ValidateBy(
    {
      name: 'isStripeCheckoutMetadata',
      validator: {
        validate: (metadata: Stripe.MetadataParam): boolean => {
          return Object.entries(metadata).every(
            ([key, value]) =>
              allowedPropertyKeyTypes.includes(getDataType(key)) &&
              allowedPropertyValueTypes.includes(getDataType(value)),
          );
        },
        defaultMessage: () =>
          'The provided metadata has incorrect data types of either its property names or values',
      },
    },
    validationOptions,
  );
};
