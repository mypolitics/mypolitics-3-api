import { RemoteGraphQLDataSource } from '@apollo/gateway';
import { GATEWAY_BUILD_SERVICE } from '@nestjs/graphql';
import { Module } from '@nestjs/common';
import { Cookies, Headers } from '../../constants';

const APOLLO_SERVICE_QUERY = 'query __ApolloGetServiceDefinition__ { _service { sdl } }';

class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  async willSendRequest({ request, context }) {
    // delay initial service query to wait for local services
    if (request?.query === APOLLO_SERVICE_QUERY) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    if (!context.req) {
      return;
    }

    if (context.req.respondent) {
      const respondentData = Buffer.from(
        JSON.stringify(context.req.respondent),
      ).toString('base64');
      request.http.headers.set(Headers.RESPONDENT, respondentData);
    }

    if (Object.keys(context.req.cookies).includes(Cookies.JWT)) {
      const jwt = context.req.cookies[Cookies.JWT];
      request.http.headers.set(Cookies.JWT, jwt);
    }

    const setHeaders = (names: string[]) =>
      names.forEach(name => {
        const value = context.req.headers[name];

        if (value) {
          request.http.headers.set(name, value);
        }
      });

    setHeaders([Headers.RESPONDENT, 'set-cookie']);
  }
  didReceiveResponse({ response, context }) {
    if (!context.res) {
      return response;
    }

    const setHeaders = (names: string[]) =>
      names.forEach(name => {
        const value = response.http.headers.get(name);
        if (!value) {
          return;
        }

        context.res.setHeader(name, value);
      });

    setHeaders(['set-cookie']);

    return response;
  }
}

@Module({
  providers: [
    {
      provide: AuthenticatedDataSource,
      useValue: AuthenticatedDataSource,
    },
    {
      provide: GATEWAY_BUILD_SERVICE,
      useFactory: AuthenticatedDataSource => {
        return ({ url }) => new AuthenticatedDataSource({ url });
      },
      inject: [AuthenticatedDataSource],
    },
  ],
  exports: [GATEWAY_BUILD_SERVICE],
})
export class BuildServiceModule {}
