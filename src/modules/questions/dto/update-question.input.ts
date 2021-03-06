import { Field, InputType } from '@nestjs/graphql';
import { TextTranslationInput } from '../../../shared/entities/text-translation.entity';
import { QuestionEffectsInput } from './question-effects.input';

@InputType()
export class UpdateQuestionInput {
  @Field(() => TextTranslationInput)
  text: TextTranslationInput;

  @Field(() => QuestionEffectsInput)
  effects: QuestionEffectsInput;
}
