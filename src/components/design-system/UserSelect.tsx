import { Option, Select } from './ui';
import type { User } from '@/state/user/types';

interface UserSelectProps {
  users: User[];
  value?: string;
  error?: boolean;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
}
export function UserSelect({ users, ...props }: UserSelectProps) {
  return (
    <Select {...props}>
      <Option value="">Unassigned</Option>
      {users.map(user => (
        <Option key={user.id} value={user.id}>
          {user.name}
        </Option>
      ))}
    </Select>
  );
}
