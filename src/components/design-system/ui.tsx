'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import cx from 'classnames';
import React from 'react';

type BoxProps = React.HTMLAttributes<HTMLDivElement> & {
  color?: string;
  shadow?: boolean;
  variant?: string;
};
export function Card({ className, color, shadow = true, variant: _variant, ...props }: BoxProps) {
  return (
    <div
      {...props}
      className={cx(
        'rounded-xl',
        color !== 'transparent' && 'bg-white border border-gray-200',
        shadow && 'shadow-sm',
        className,
      )}
    />
  );
}
export function CardBody({ className, ...props }: BoxProps) {
  return <Card {...props} shadow={false} color="transparent" className={cx('p-6', className)} />;
}
export const CardFooter = CardBody;
export function CardHeader({ className, ...props }: BoxProps) {
  return <Card {...props} className={cx('mx-4 -mt-6 p-6 bg-gray-900 text-white', className)} />;
}
export function Navbar({ className, ...props }: BoxProps) {
  return <div {...props} className={cx('border-b border-gray-200 bg-white', className)} />;
}
export function Typography({
  as,
  variant = 'paragraph',
  color,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  as?: React.ElementType;
  variant?: string;
  color?: string;
}) {
  const Component = as ?? (/^h[1-6]$/.test(variant) ? (variant as React.ElementType) : 'p');
  const sizes: Record<string, string> = {
    h1: 'text-4xl font-bold',
    h2: 'text-3xl font-semibold',
    h3: 'text-2xl font-semibold',
    h4: 'text-xl font-semibold',
    h5: 'text-lg font-semibold',
    h6: 'font-semibold',
    lead: 'text-lg',
    small: 'text-sm',
  };
  return (
    <Component
      {...props}
      className={cx(
        sizes[variant],
        color === 'white' ? 'text-white' : color === 'gray' ? 'text-gray-600' : undefined,
        className,
      )}
    />
  );
}
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: string;
  color?: string;
  size?: string;
  loading?: boolean;
  fullWidth?: boolean;
};
export function Button({
  variant,
  color: _color,
  size,
  loading,
  fullWidth,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        size === 'sm' ? 'px-3 py-2 text-xs' : 'px-5 py-3 text-sm',
        variant === 'text'
          ? 'hover:bg-gray-100 text-gray-800'
          : variant === 'outlined'
            ? 'border border-gray-600 text-gray-800 hover:bg-gray-100'
            : 'bg-gray-900 text-white hover:bg-gray-700',
        fullWidth && 'w-full',
        className,
      )}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
}
export function IconButton(props: ButtonProps) {
  return <Button {...props} className={cx('!p-2 shrink-0', props.className)} />;
}
export function Spinner({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      {...props}
      aria-hidden="true"
      className={cx(
        'inline-block h-5 w-5 rounded-full border-2 border-current border-r-transparent animate-spin',
        className,
      )}
    />
  );
}
type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: boolean;
  containerProps?: React.HTMLAttributes<HTMLLabelElement>;
  labelProps?: React.HTMLAttributes<HTMLSpanElement>;
};
export function Input({
  label,
  error,
  containerProps,
  labelProps,
  className,
  size: _size,
  ...props
}: Omit<InputProps, 'size'> & { size?: string }) {
  return (
    <label {...containerProps} className={cx('block w-full', containerProps?.className)}>
      {label && (
        <span
          {...labelProps}
          className={cx('mb-1 block text-sm font-medium text-gray-700', labelProps?.className)}
        >
          {label}
        </span>
      )}
      <input
        {...props}
        aria-invalid={error || undefined}
        className={cx(
          'w-full rounded-md border bg-white px-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100',
          error ? 'border-red-500' : 'border-gray-300',
          className,
        )}
      />
    </label>
  );
}
export function Textarea({
  label,
  error,
  containerProps,
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: boolean;
  containerProps?: React.HTMLAttributes<HTMLLabelElement>;
}) {
  return (
    <label {...containerProps} className={cx('block w-full', containerProps?.className)}>
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <textarea
        {...props}
        aria-invalid={error || undefined}
        className={cx(
          'w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500',
          error ? 'border-red-500' : 'border-gray-300',
          className,
        )}
      />
    </label>
  );
}
export function Select({
  label,
  error,
  containerProps,
  selected: _selected,
  className,
  onChange,
  children,
  ...props
}: Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> & {
  label?: string;
  error?: boolean;
  containerProps?: React.HTMLAttributes<HTMLLabelElement>;
  selected?: () => React.ReactNode;
  onChange?: (value: string) => void;
}) {
  const labelId = React.useId();
  return (
    <label {...containerProps} className={cx('block w-full', containerProps?.className)}>
      <span id={labelId} className="mb-1 block text-sm font-medium">
        {label}
      </span>
      <select
        {...props}
        aria-labelledby={labelId}
        aria-invalid={error || undefined}
        onChange={event => onChange?.(event.target.value)}
        className={cx(
          'w-full rounded-md border bg-white px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500',
          error ? 'border-red-500' : 'border-gray-300',
          className,
        )}
      >
        {children}
      </select>
    </label>
  );
}
export function Option(props: React.OptionHTMLAttributes<HTMLOptionElement>) {
  return <option {...props} />;
}
export function Dialog({
  open,
  handler,
  children,
  className,
  size,
  dismiss,
}: {
  open: boolean;
  handler: () => void;
  children: React.ReactNode;
  className?: string;
  size?: string;
  dismiss?: { outsidePress?: boolean };
}) {
  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={value => {
        if (!value) handler();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/50" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          onPointerDownOutside={event => {
            if (dismiss?.outsidePress === false) event.preventDefault();
          }}
          className={cx(
            'fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[calc(100%_-_2rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl bg-white shadow-xl focus:outline-none',
            size === 'sm' ? 'max-w-2xl' : 'max-w-xl',
            className,
          )}
        >
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx('relative p-5', className)} />;
}
export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <DialogPrimitive.Title asChild>{children}</DialogPrimitive.Title>;
}
export function DialogBody({
  divider,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { divider?: boolean }) {
  return <div {...props} className={cx('p-5', divider && 'border-y', className)} />;
}
export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx('flex justify-end p-5', className)} />;
}
export function Popover({
  open,
  handler,
  children,
  placement: _placement,
  offset: _offset,
}: {
  open?: boolean;
  handler?: (open: boolean) => void;
  children: React.ReactNode;
  placement?: string;
  offset?: number;
}) {
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={handler}>
      {children}
    </PopoverPrimitive.Root>
  );
}
export function PopoverHandler({ children }: { children: React.ReactNode }) {
  return <PopoverPrimitive.Trigger asChild>{children}</PopoverPrimitive.Trigger>;
}
export function PopoverContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        {...props}
        sideOffset={8}
        align="end"
        className={cx(
          'z-[60] max-h-[70vh] max-w-[calc(100vw_-_2rem)] overflow-y-auto rounded-lg border bg-white p-4 shadow-xl',
          className,
        )}
      />
    </PopoverPrimitive.Portal>
  );
}
export function Menu({
  open,
  handler,
  children,
  placement: _placement,
}: {
  open: boolean;
  handler: (open: boolean) => void;
  children: React.ReactNode;
  placement?: string;
}) {
  return (
    <Dropdown.Root open={open} onOpenChange={handler}>
      {children}
    </Dropdown.Root>
  );
}
export function MenuHandler({ children }: { children: React.ReactNode }) {
  return <Dropdown.Trigger asChild>{children}</Dropdown.Trigger>;
}
export function MenuList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Dropdown.Portal>
      <Dropdown.Content
        {...props}
        align="end"
        sideOffset={8}
        className={cx('z-[60] min-w-40 rounded-lg border bg-white p-1 shadow-lg', className)}
      />
    </Dropdown.Portal>
  );
}
export function MenuItem({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Dropdown.Item>) {
  return (
    <Dropdown.Item
      {...props}
      onClick={onClick}
      className={cx('cursor-pointer p-3 outline-none focus:bg-gray-100', className)}
    />
  );
}
export function List({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx('flex flex-col gap-1', className)} />;
}
export function ListItem({
  selected,
  disabled,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
  return (
    <button
      {...props}
      type="button"
      disabled={disabled}
      aria-current={selected ? 'page' : undefined}
      className={cx(
        'flex items-center gap-3 rounded-md p-3 text-left hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed',
        selected && 'bg-gray-200',
        className,
      )}
    />
  );
}
export function ListItemPrefix(props: React.HTMLAttributes<HTMLSpanElement>) {
  return <span {...props} />;
}
export function Chip({
  value,
  className,
}: {
  value: string;
  className?: string;
  variant?: string;
  size?: string;
  color?: string;
}) {
  return (
    <span className={cx('rounded bg-gray-300 px-2 py-1 text-xs font-medium', className)}>
      {value}
    </span>
  );
}
export function Badge({
  content,
  children,
}: {
  content: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="relative inline-flex">
      {children}
      <span className="absolute -right-2 -top-2 rounded-full bg-red-600 px-1.5 text-xs text-white">
        {content}
      </span>
    </span>
  );
}
export function Avatar({
  variant: _variant,
  size: _size,
  alt = '',
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & { variant?: string; size?: string }) {
  return (
    <img {...props} alt={alt} className={cx('h-10 w-10 rounded-full object-cover', className)} />
  );
}
export function Breadcrumbs({ className, children }: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cx(
        "flex flex-wrap items-center gap-3 text-sm text-gray-600 [&>*+*]:before:content-['/'] [&>*+*]:before:mr-3",
        className,
      )}
    >
      {children}
    </nav>
  );
}
export function Alert({
  open = true,
  onClose,
  className,
  children,
  animate: _animate,
  variant: _variant,
  color: _color,
}: {
  open?: boolean;
  onClose?: () => void;
  className?: string;
  children: React.ReactNode;
  animate?: unknown;
  variant?: string;
  color?: string;
}) {
  return open ? (
    <div role="status" className={cx('rounded-lg bg-gray-900 p-4 text-white', className)}>
      {children}
      {onClose && (
        <button onClick={onClose} aria-label="Dismiss notification" className="ml-4">
          ×
        </button>
      )}
    </div>
  ) : null;
}
