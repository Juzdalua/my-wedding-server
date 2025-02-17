import { NoProfanity } from '@/decorators/no-nsfw-prompt';
import { NoProfanityConstraint } from '@/validators/no-nsfw-prompt.constraint';
import { IsString, Validate } from 'class-validator';

export class CdtDto {
  @IsString()
  @NoProfanity({ message: 'Invalid prompt, contains forbidden words' })
  prompt: string;
}
