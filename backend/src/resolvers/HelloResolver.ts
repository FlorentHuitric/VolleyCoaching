import { Query, Resolver } from 'type-graphql';

@Resolver()
export class HelloResolver {
  @Query(() => String)
  hello(): string {
    return '🏐 VolleyCoaching API is running!';
  }

  @Query(() => String)
  status(): string {
    return JSON.stringify({
      service: 'volleycoaching-backend',
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  }
}
