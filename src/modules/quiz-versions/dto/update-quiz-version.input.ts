import { Field, InputType } from '@nestjs/graphql';
import { QuizAxisInput } from './quiz-axis.input';
import { QuizVersion } from '../entities/quiz-version.entity';
import { QuizCompassModeInput } from './quiz-compass-mode.input';
import { Ideology } from '../../ideologies/entities/ideology.entity';
import { Question } from '../../questions/entities/question.entity';
import { Party } from '../../parties/entities/party.entity';

@InputType()
export class UpdateQuizVersionInput {
  @Field({ nullable: true })
  publishedOn?: Date;

  @Field(() => [QuizAxisInput], { nullable: true })
  axes?: [QuizAxisInput];

  @Field(() => String, { nullable: true })
  parent?: QuizVersion;

  @Field(() => [QuizCompassModeInput], { nullable: 'items' })
  compassModes?: QuizCompassModeInput[];

  @Field(() => [String], { nullable: 'items' })
  traits: Ideology[];

  @Field(() => [String], { nullable: 'items' })
  questions: Question[];

  @Field(() => [String], { nullable: 'items' })
  ideologies: Ideology[];

  @Field(() => [String], { nullable: 'items' })
  parties: Party[];
}
