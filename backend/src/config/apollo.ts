import { ApolloServer } from '@apollo/server';
import { buildSchema } from 'type-graphql';
import { container } from './container';

// Resolvers
import { HelloResolver } from '../resolvers/HelloResolver';
import { PlayerResolver } from '../resolvers/PlayerResolver';
import { TeamResolver } from '../resolvers/TeamResolver';
import { LineupResolver } from '../resolvers/LineupResolver';
import { EvaluationResolver } from '../resolvers/EvaluationResolver';
import { TrainingResolver } from '../resolvers/TrainingResolver';
import { ExerciseResolver } from '../resolvers/ExerciseResolver';
import { AuthResolver } from '../resolvers/auth.resolver';
// import { UserResolver } from '../resolvers/UserResolver';

/**
 * Apollo Server Configuration
 * Creates and configures the GraphQL server with type-graphql
 */
export async function createApolloServer(): Promise<ApolloServer> {
  // Build TypeGraphQL schema
  const schema = await buildSchema({
    resolvers: [
      HelloResolver,
      AuthResolver,
      PlayerResolver,
      TeamResolver,
      LineupResolver,
      EvaluationResolver,
      TrainingResolver,
      ExerciseResolver,
      // TODO: Enable UserResolver once auth is implemented
      // UserResolver,
    ],
    container: { get: (cls) => container.resolve(cls) },
    validate: true,
    emitSchemaFile: process.env.NODE_ENV === 'development' ? './schema.gql' : false,
  });

  // Create Apollo Server
  const server = new ApolloServer({
    schema,
    formatError: (formattedError, error) => {
      // Log errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('GraphQL Error:', error);
      }

      // Return formatted error
      return formattedError;
    },
  });

  await server.start();
  console.log('🚀 Apollo Server initialized');

  return server;
}
