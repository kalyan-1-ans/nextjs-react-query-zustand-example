import { useToastState } from './store';
import { Toast } from './Toast';

export const ToastContainer = () => {
  const { toasts } = useToastState();

  return (
    <div className="fixed z-[100] top-5 right-5 flex flex-col gap-4">
      {toasts.map(({ id, message }) => (
        <Toast key={id} id={id} message={message} />
      ))}
    </div>
  );
};
