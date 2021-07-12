import { Client } from 'faunadb';

export type User = {
  ref: {
    id: string;
  };
  data: {
    email: string;
    customerId?: string;
  };
};

export type Subscription = {
  ref: {
    id: string;
  };
  data: {
    id: string;
    userId: string;
    status: string;
    price_id: string;
  };
};

export const COLLECTIONS = {
  USERS: 'users',
  SUBSCRIPTIONS: 'subscriptions',
};

export const INDEXES = {
  USERS_BY_EMAIL: 'users_by_email',
  USERS_BY_CUSTOMER_ID: 'users_by_customerId',
  SUBSCRIPTIONS_BY_ID: 'subscriptions_by_id',
};

export const fauna = new Client({ secret: process.env.FAUNA_DB_KEY ?? '' });
