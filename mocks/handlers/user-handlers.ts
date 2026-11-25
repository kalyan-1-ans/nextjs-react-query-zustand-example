import { http, HttpResponse } from 'msw';
import { z } from 'zod';
import { db, saveDb } from '../data/db';
import type { User } from '../../src/state/user/types';
const publicUser = ({ id, email, name }: User) => ({ id, email, name });

export const userHandlers = [
  http.get('*/api/users', () => HttpResponse.json(db.users.map(publicUser))),
  http.get('*/api/users/:id', ({ params }) => {
    const user = db.users.find(user => user.id === params.id);
    return user
      ? HttpResponse.json(publicUser(user))
      : HttpResponse.json({ errorMessage: 'User not found' }, { status: 404 });
  }),
  http.patch('*/api/users/:id', async ({ params, request }) => {
    const user = db.users.find(user => user.id === params.id);
    if (!user) return HttpResponse.json({ errorMessage: 'User not found' }, { status: 404 });
    const parsed = z.object({ name: z.string().trim().min(1) }).safeParse(await request.json());
    if (!parsed.success)
      return HttpResponse.json({ errorMessage: 'Name is required' }, { status: 400 });
    user.name = parsed.data.name;
    saveDb();
    return HttpResponse.json(publicUser(user));
  }),
];
