import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { LoginInput } from './input';
import { LoginResultModel } from './model';
import { AuthApiService } from '../../auth/auth-api.service';

@Resolver()
export class AuthResolver {
  constructor(private readonly authApi: AuthApiService) {}

  @Mutation(() => LoginResultModel)
  login(@Args('data') data: LoginInput): Promise<LoginResultModel> {
    return this.authApi.login(data);
  }
}
