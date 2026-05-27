import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    
    // ---> Plasa de siguranță pentru WebSockets
    if (req && !req.headers) {
      req.headers = {}; 
    }
    // <---

    return req;
  }
}
