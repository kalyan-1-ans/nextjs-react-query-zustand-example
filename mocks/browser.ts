import { delay, http } from 'msw';
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

const contentReadDelay = http.get(
  ({ request }) => new URL(request.url).pathname.startsWith('/api/'),
  async () => {
    await delay(2_000);
  },
);

export const worker = setupWorker(contentReadDelay, ...handlers);
