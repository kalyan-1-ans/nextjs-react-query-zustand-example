import { http, HttpResponse } from 'msw';
import { db, saveDb } from '../data/db';
import { NotificationStatus } from '../../src/state/notification/types';

export const notificationHandlers = [
  http.get('*/api/:userId/notifications', ({ params }) =>
    HttpResponse.json(
      db.notifications.filter(notification => notification.userId === params.userId),
    ),
  ),
  http.patch('*/api/notifications/:notificationId/read', ({ params }) => {
    const notification = db.notifications.find(
      notification => notification.id === params.notificationId,
    );
    if (!notification)
      return HttpResponse.json({ errorMessage: 'Notification not found' }, { status: 404 });
    notification.status = NotificationStatus.READ;
    saveDb();
    return HttpResponse.json(notification);
  }),
];
