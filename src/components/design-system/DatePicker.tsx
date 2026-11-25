import { format } from 'date-fns';
import { Input } from './ui';

export default function DatePicker({
  value,
  onChange,
  ...props
}: {
  label: string;
  value?: Date;
  onChange: (value?: Date) => void;
  error?: boolean;
  disabled?: boolean;
}) {
  return (
    <Input
      {...props}
      type="date"
      value={value ? format(value, 'yyyy-MM-dd') : ''}
      onChange={event =>
        onChange(event.target.value ? new Date(`${event.target.value}T00:00:00`) : undefined)
      }
    />
  );
}
