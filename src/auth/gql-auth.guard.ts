import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const graphqlContext = ctx.getContext();

    if (!graphqlContext.req) {
      const connectionParams = graphqlContext
        ?.connectionParams as
        | {
            Authorization?: string;
            authorization?: string;
          }
        | undefined;

      graphqlContext.headers = {
        authorization:
          connectionParams?.Authorization ?? connectionParams?.authorization,
      };

      return graphqlContext;
    }

    return graphqlContext.req;
  }
}
