'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { createContext, useContext, useState, type ReactNode } from 'react';

type AlertDialogOptions = {
  title: string;
  description?: string;
  cancelText?: string;
  confirmText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  customLogo?: ReactNode;
  logoClasses?: string;
  classNames?: {
    content?: string;
    title?: string;
    description?: string;
    cancelButton?: string;
    confirmButton?: string;
  };
};

type AlertDialogContextType = {
  showDialog: (options: AlertDialogOptions) => void;
};

const AlertDialogContext = createContext<AlertDialogContextType | null>(null);

export const useCustomAlert = () => {
  const context = useContext(AlertDialogContext);
  if (!context) {
    throw new Error('useCustomAlert must be used within AlertDialogProvider');
  }
  return context.showDialog;
};

export const AlertDialogProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<AlertDialogOptions | null>(null);

  const showDialog = (opts: AlertDialogOptions) => {
    setOptions(opts);
    setOpen(true);
  };

  const handleConfirm = () => {
    options?.onConfirm?.();
    setOpen(false);
  };

  const handleCancel = () => {
    options?.onCancel?.();
    setOpen(false);
  };

  return (
    <AlertDialogContext.Provider value={{ showDialog }}>
      {children}

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogOverlay className="bg-black-40" />
        <AlertDialogContent className={cn('bg-white p-4 !rounded-2xl', options?.classNames?.content)}>
          <AlertDialogHeader>
            <AlertDialogTitle className={options?.classNames?.title}>
              <div className="flex items-center gap-2">
                {options?.customLogo && <div className={`h-10 w-10 flex justify-center items-center rounded-full ${options?.logoClasses}`}>{options.customLogo}</div>}
                {options?.title}
              </div>
            </AlertDialogTitle>
            {options?.description && <AlertDialogDescription className={cn('text-gray-800', options?.classNames?.description)}>{options.description}</AlertDialogDescription>}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={options?.classNames?.cancelButton} onClick={handleCancel}>
              {options?.cancelText || 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction className={options?.classNames?.confirmButton} onClick={handleConfirm}>
              {options?.confirmText || 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AlertDialogContext.Provider>
  );
};
