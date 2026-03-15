import { Resolver, Query, Mutation, Arg, ID } from 'type-graphql';
import { injectable, inject } from 'tsyringe';
import { UserService } from '../services/UserService';

@injectable()
@Resolver()
export class UserResolver {
  constructor(@inject(UserService) private userService: UserService) {}

  @Query(() => String)
  async hello(): Promise<string> {
    return 'VolleyCoaching GraphQL API';
  }

  @Query(() => String, { nullable: true })
  async user(@Arg('id', () => ID) id: string) {
    return this.userService.getUserById(id);
  }
}
