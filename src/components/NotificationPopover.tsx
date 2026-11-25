import {
  List,
  ListItem,
  ListItemPrefix,
  Popover,
  PopoverContent,
  PopoverHandler,
  Typography,
} from '@/components/design-system/ui';
import React, { useState } from 'react';
import { useNotificationsQuery, useMarkAsReadMutation } from '../state/notification';
import cx from 'classnames';
import { Notification, NotificationStatus } from '@/state/notification/types';

interface NotificationPopoverProps {
  children: React.ReactNode;
}
export const NotificationPopover = ({ children }: NotificationPopoverProps) => {
  const [isOpen, setOpen] = useState(false);
  const { data, isLoading } = useNotificationsQuery();
  const markAsReadMutation = useMarkAsReadMutation();

  const handleItemClick = (item: Notification) => {
    if (item.status === NotificationStatus.UNREAD) {
      markAsReadMutation.mutate(item.id);
    }
  };

  return (
    <Popover placement="bottom-end" open={isOpen} handler={setOpen}>
      <PopoverHandler>{children}</PopoverHandler>
      <PopoverContent className="w-96">
        <List>
          {isLoading && (
            <div className="max-w-full animate-pulse">
              <Typography as="div" className="mb-4 h-10 rounded-md bg-gray-300">
                &nbsp;
              </Typography>
              <Typography as="div" className="mb-4 h-10 rounded-md bg-gray-300">
                &nbsp;
              </Typography>
              <Typography as="div" className="mb-4 h-10 rounded-md bg-gray-300">
                &nbsp;
              </Typography>
            </div>
          )}
          {!isLoading &&
            data?.map(item => (
              <div key={item.id} className="border-b-2 border-gray-200 p-2">
                <ListItem onClick={() => handleItemClick(item)}>
                  {item.status === NotificationStatus.UNREAD && (
                    <ListItemPrefix>
                      <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                    </ListItemPrefix>
                  )}
                  <div
                    className={cx({
                      'text-gray-500': item.status === NotificationStatus.READ,
                    })}
                  >
                    {item.message}
                  </div>
                </ListItem>
              </div>
            ))}
          {!isLoading && data?.length === 0 && (
            <ListItem>
              <Typography>No notifications found</Typography>
            </ListItem>
          )}
        </List>
      </PopoverContent>
    </Popover>
  );
};
