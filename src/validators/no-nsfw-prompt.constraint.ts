import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
@ValidatorConstraint({ async: false })
export class NoProfanityConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (typeof value !== 'string') {
      return false;
    }

    const forbiddenWords = ['sexy', 'sex', 'fuck', 'boob', 'nsfw', 'dick', 'threesome', 'pussy'];
    // return !forbiddenWords.some((word) => value.toLowerCase().includes(word));

    const sanitizedValue = value.replace(/\s+/g, '').toLowerCase();
    return !forbiddenWords.some((word) => sanitizedValue.includes(word));
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} contains forbidden words`;
  }
}
