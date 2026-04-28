
import { toast as sonnerToast } from 'sonner';

const getMessage = (msg: any): string => {
  if (!msg) return 'Something went wrong';

  if (typeof msg === 'string') return msg;

  if (msg?.message) return msg.message;

  if (msg?.data?.message) return msg.data.message;

  try {
    return JSON.stringify(msg);
  } catch {
    return 'Something went wrong';
  }
};

export const customToast = {
  success: (message: any) =>
    sonnerToast.success(getMessage(message), {
      style: { background: '#d1fadf', color: '#027a48', border: 'none' },
    }),

  error: (message: any) =>
    sonnerToast.error(getMessage(message), {
      style: { background: '#fee2e2', color: '#b91c1c', border: 'none' },
    }),

  warning: (message: any) =>
    sonnerToast(getMessage(message), {
      style: { background: '#fef9c3', color: '#92400e', border: 'none' },
    }),

  info: (message: any) =>
    sonnerToast(getMessage(message), {
      style: { background: '#dbeafe', color: '#1e40af', border: 'none' },
    }),
};