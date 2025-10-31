import React from 'react';
import { clsx } from 'clsx';
export function Card({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={clsx('rounded-2xl shadow p-4 border bg-white', className)}>{children}</div>;
}
