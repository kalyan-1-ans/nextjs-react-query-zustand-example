import InitialsAvatar from '@/components/design-system/InitialsAvatar';
import { NotificationPopover } from '@/components/NotificationPopover';
import { useLogoutMutation } from '@/state/auth';
import { useUnreadNotificationsQuery } from '@/state/notification';
import { useCurrentUserQuery } from '@/state/user';
import { BellIcon, ChevronDownIcon, PowerIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import {
  Badge,
  Button,
  IconButton,
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
  Navbar,
  Typography,
} from '@/components/design-system/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import React from 'react';

function ProfileMenu() {
  const { data: user } = useCurrentUserQuery();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const router = useRouter();
  const logoutMutation = useLogoutMutation();

  const handleLogoutMenuClick = () => {
    setIsMenuOpen(false);
    logoutMutation.mutate();
  };

  const handleProfileMenuClick = () => {
    setIsMenuOpen(false);
    router.push('/profile');
  };

  return (
    <Menu open={isMenuOpen} handler={setIsMenuOpen} placement="bottom-end">
      <MenuHandler>
        <Button
          aria-label="Open profile menu"
          variant="text"
          color="blue-gray"
          className="flex items-center gap-1 rounded-full py-0.5 pr-2 pl-0.5 lg:ml-auto"
        >
          <InitialsAvatar name={user?.name} size="40" />
          <ChevronDownIcon
            strokeWidth={2.5}
            className={`h-3 w-3 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
          />
        </Button>
      </MenuHandler>
      <MenuList className="p-1">
        <MenuItem onClick={handleProfileMenuClick} className={'flex items-center gap-2 rounded'}>
          {React.createElement(UserCircleIcon, {
            className: `h-4 w-4 text-black`,
            strokeWidth: 2,
          })}
          <Typography as="span" variant="small" className="font-normal" color={'black'}>
            Profile
          </Typography>
        </MenuItem>
        <MenuItem onClick={handleLogoutMenuClick} className={'flex items-center gap-2 rounded'}>
          {React.createElement(PowerIcon, {
            className: `h-4 w-4 text-black`,
            strokeWidth: 2,
          })}
          <Typography as="span" variant="small" className="font-normal" color={'black'}>
            Logout
          </Typography>
        </MenuItem>
      </MenuList>
    </Menu>
  );
}

interface WithBadgeProps {
  count: number;
  children: React.ReactNode;
}

const WithBadge: React.FC<WithBadgeProps> = ({ count, children }) => {
  if (!count) {
    return children;
  }
  return <Badge content={count || ''}>{children}</Badge>;
};

interface MainNavProps {
  withProfileMenu?: boolean;
}

export const MainNav = ({ withProfileMenu = true }: MainNavProps) => {
  const { data, isLoading } = useCurrentUserQuery();
  const { data: unreadData } = useUnreadNotificationsQuery();

  return (
    <Navbar className="min-w-full rounded-none h-28 flex items-center px-1 md:pl-4 md:pr-12">
      <div className="relative flex w-full items-center justify-between text-blue-gray-900">
        <Link href="/dashboard">
          <Typography className="mr-4 md:ml-2 cursor-pointer py-1.5 font-medium">
            <img className="mx-auto h-20" src="/logo.svg" alt="logo" />
          </Typography>
        </Link>
        {withProfileMenu && (
          <div className="flex gap-4 md:gap-8 justify-center items-center">
            <WithBadge count={unreadData?.length || 0}>
              <NotificationPopover>
                <IconButton variant="text" aria-label="Notifications">
                  <BellIcon color="black" className="h-6 w-6" />
                </IconButton>
              </NotificationPopover>
            </WithBadge>
            <div className="flex gap-4 justify-center items-center">
              {!isLoading && (
                <Typography color="blue-gray" variant="lead" className="hidden sm:block">
                  {data?.name}
                </Typography>
              )}
              <ProfileMenu />
            </div>
          </div>
        )}
      </div>
    </Navbar>
  );
};
