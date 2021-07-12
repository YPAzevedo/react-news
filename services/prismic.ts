import Prismic from '@prismicio/client';

export function getPrismicClient(req?: unknown) {
  return Prismic.client(process.env.PRISMIC_API_ENDPOINT ?? '', {
    req,
    accessToken: process.env.PRISMIC_ACCESS_TOKEN ?? '',
  });
}
