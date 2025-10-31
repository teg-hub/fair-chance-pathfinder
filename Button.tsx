import React from 'react';
import { clsx } from 'clsx';
export function Button({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={clsx('px-4 py-2 rounded-2xl shadow border', className)} {...props} />;
}
