import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Party } from '../../parties/entities/party.entity';
import { QuizLicense } from '../enums/quiz-license.enum';
import { Types } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from '../../users/entities/user.entity';
import { Language } from '../../../shared/enums/language.enum';

@ObjectType()
@Schema()
class QuizFeatures {
  @Field(() => Boolean)
  compass?: boolean;

  @Field(() => Boolean)
  traits?: boolean;

  @Field(() => Int)
  axesNumber?: number;

  @Field(() => Int)
  questionsNumber?: number;

  @Field(() => Boolean)
  parties?: boolean;

  @Prop(mongoose.Schema.Types.Boolean)
  @Field(() => Boolean, { defaultValue: false })
  politiciansResults: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Party' }] })
  @Field(() => [Party], { nullable: 'items' })
  authorizedParties: Party[];
}

@ObjectType()
@Schema()
class QuizStatistics {
  @Prop(mongoose.Schema.Types.Number)
  @Field(() => Int)
  surveysNumber: number;
}

@ObjectType()
@Schema()
class QuizVotes {
  @Prop({
    type: [{ type: Types.ObjectId, ref: 'User' }],
    default: [],
  })
  @Field(() => [User])
  voters: User[];

  @Prop({
    type: mongoose.Schema.Types.Number,
    default: 0,
  })
  @Field(() => Int)
  value: number;
}

@ObjectType()
@Schema()
export class QuizMeta {
  @Prop(raw(QuizFeatures))
  @Field(() => QuizFeatures)
  features: QuizFeatures;

  @Prop(raw(QuizStatistics))
  @Field(() => QuizStatistics)
  statistics: QuizStatistics;

  @Prop(raw(QuizVotes))
  @Field(() => QuizVotes)
  votes: QuizVotes;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  @Field(() => [User])
  authors: User[];

  @Prop(mongoose.Schema.Types.String)
  @Field(() => QuizLicense)
  license: QuizLicense;

  @Prop({
    type: raw([mongoose.Schema.Types.String]),
    default: [Language.POLISH],
  })
  @Field(() => [Language])
  languages: Language[];
}

export const QuizMetaSchema = SchemaFactory.createForClass(QuizMeta);
