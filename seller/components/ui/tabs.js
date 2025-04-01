'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';
import "@/components/ui/tabs"

export const Tabs = ({ defaultValue, className, children, ...props }) => {
  return (
    <TabsPrimitive.Root defaultValue={defaultValue} className={cn('w-full', className)} {...props}>
      {children}
    </TabsPrimitive.Root>
  );
};

export const TabsList = ({ className, ...props }) => {
  return (
    <TabsPrimitive.List
      className={cn(
        'flex border-b border-gray-200 dark:border-gray-800',
        className
      )}
      {...props}
    />
  );
};

export const TabsTrigger = ({ className, ...props }) => {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300',
        'hover:text-gray-900 dark:hover:text-white',
        'data-[state=active]:border-b-2 data-[state=active]:border-blue-500',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
        className
      )}
      {...props}
    />
  );
};

export const TabsContent = ({ className, ...props }) => {
  return (
    <TabsPrimitive.Content
      className={cn('p-4 rounded-lg border border-gray-200 dark:border-gray-800', className)}
      {...props}
    />
  );
};
