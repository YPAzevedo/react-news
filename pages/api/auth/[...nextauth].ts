import { query } from 'faunadb';
import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';

import { COLLECTIONS, fauna, INDEXES } from '../../../services/fauna';
import type { User } from '../../../services/fauna';

export default NextAuth({
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  callbacks: {
    async signIn(user) {
      const { email } = user;

      try {
        if (email) {
          // Create user if it doesn't exist
          await await fauna.query<User>(
            query.If(
              query.Not(
                query.Exists(
                  query.Match(
                    query.Index(INDEXES.USERS_BY_EMAIL),
                    query.Casefold(email)
                  )
                )
              ),
              query.Create(query.Collection(COLLECTIONS.USERS), {
                data: { email },
              }),
              query.Get(
                query.Match(
                  query.Index(INDEXES.USERS_BY_EMAIL),
                  query.Casefold(email)
                )
              )
            )
          );
        }

        return true;
      } catch {
        return false;
      }
    },
  },
});
