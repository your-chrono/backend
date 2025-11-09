import { ApolloServerPluginInlineTraceDisabled } from '@apollo/server/plugin/disabled';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';

import { AuthResolver } from './auth/auth.resolver';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { UserResolver } from './user/user.resolver';
import { DictionaryModule } from '../dicionary/dictionary.module';
import { RoleResolver } from './dictionary/role.resolver';
import { ProfileResolver } from './user/profile.resolver';
import { SlotModule } from '../slot/slot.module';
import { SlotResolver } from './slot/slot.resolver';
import { BookingModule } from '../booking/booking.module';
import { BookingResolver } from './booking/booking.resolver';

@Module({})
export class GraphqlApiModule {
  static register(): DynamicModule {
    return {
      module: GraphqlApiModule,
      imports: [
        GraphQLModule.forRootAsync<ApolloFederationDriverConfig>({
          driver: ApolloFederationDriver,
          imports: [],
          inject: [],
          useFactory: () => ({
            context: ({ req, res }: { req: Request; res: Response }) => ({
              req,
              res,
            }),
            playground: false,
            driver: ApolloFederationDriver,
            fieldResolverEnhancers: ['guards'],
            autoSchemaFile: {
              path: join(process.cwd(), 'src/schema.gql'),
              federation: 2,
            },
            sortSchema: true,
            introspection: true,
            plugins: [
              ApolloServerPluginLandingPageLocalDefault(),
              ApolloServerPluginInlineTraceDisabled(),
            ],
          }),
        }),
        ConfigModule,
        CqrsModule,
        AuthModule,
        UserModule,
        SlotModule,
        BookingModule,
        DictionaryModule,
      ],
      providers: [
        AuthResolver,
        UserResolver,
        RoleResolver,
        ProfileResolver,
        SlotResolver,
        BookingResolver,
      ],
    };
  }
}
