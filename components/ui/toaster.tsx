'use client';

import {
  Toaster as ChakraToaster,
  Toast,
  createToaster,
} from '@chakra-ui/react';
import type { ReactNode } from 'react';

export const toaster = createToaster({
  placement: 'top-end',
  duration: 3000,
});

export const centerToaster = createToaster({
  placement: 'top',
  duration: 3000,
});

const typeStyles: Record<
  string,
  { bg: string; color: string }
> = {
  success: { bg: 'green.solid', color: 'white' },
  error: { bg: 'red.solid', color: 'white' },
  warning: { bg: 'orange.solid', color: 'white' },
};

const renderToast = (toast: {
  id?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: ReactNode;
  description?: ReactNode;
  closable?: boolean;
}) => {
  const palette = toast.type ? typeStyles[toast.type] : undefined;
  return (
    <Toast.Root
      key={toast.id}
      width="sm"
      maxWidth="90vw"
      bg={palette?.bg ?? 'bg.panel'}
      color={palette?.color ?? 'fg'}
      boxShadow="xl"
      borderRadius="l2"
      p="4"
      display="flex"
      alignItems="flex-start"
      gap="3"
    >
      {toast.title && <Toast.Title>{toast.title}</Toast.Title>}
      {toast.description && (
        <Toast.Description>{toast.description}</Toast.Description>
      )}
      {toast.closable && <Toast.CloseTrigger />}
    </Toast.Root>
  );
};

export const Toaster = () => (
  <ChakraToaster toaster={toaster}>
    {(toast) => renderToast(toast as never)}
  </ChakraToaster>
);

export const CenterToaster = () => (
  <ChakraToaster toaster={centerToaster} className="center-toaster">
    {(toast) => renderToast(toast as never)}
  </ChakraToaster>
);
