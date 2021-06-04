import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Headers } from '../../constants';

@Injectable()
export class RespondentGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const { req } = GqlExecutionContext.create(context).getContext();
      const respondentObject = Buffer.from(req.headers[Headers.RESPONDENT], 'base64').toString();
      req.respondent = JSON.parse(respondentObject);

      if (!req.respondent) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }
}
