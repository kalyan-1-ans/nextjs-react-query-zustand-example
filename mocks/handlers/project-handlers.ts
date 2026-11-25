import { http, HttpResponse } from 'msw';
import { db } from '../data/db';

export const projectHandlers = [
  http.get('*/api/projects', () => HttpResponse.json(db.projects)),
  http.get('*/api/projects/:id', ({ params }) => {
    const project = db.projects.find(project => project.id === params.id);
    return project
      ? HttpResponse.json(project)
      : HttpResponse.json({ errorMessage: 'Project not found' }, { status: 404 });
  }),
];
