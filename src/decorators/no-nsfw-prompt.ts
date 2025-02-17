import { NoProfanityConstraint } from '@/validators/no-nsfw-prompt.constraint';
import { ValidationOptions, registerDecorator } from 'class-validator';

export function NoProfanity(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'noProfanity',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: NoProfanityConstraint
    });
  };
}
