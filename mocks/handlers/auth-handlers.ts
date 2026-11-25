import { http, HttpResponse } from 'msw';
import { z } from 'zod';
import { db } from '../data/db';

export const authHandlers = [
  http.post('*/api/login', async ({ request }) => {
    const parsed = z
      .object({ email: z.string().email(), password: z.string() })
      .safeParse(await request.json());
    const user =
      parsed.success &&
      db.users.find(
        user => user.email === parsed.data.email && user.password === parsed.data.password,
      );
    return user
      ? HttpResponse.json({ accessToken: `demo-token-${user.id}`, currentUserId: user.id })
      : HttpResponse.json({ errorMessage: 'Invalid email or password' }, { status: 401 });
  }),
  http.post('*/api/logout', () => new HttpResponse(null, { status: 204 })),
];
