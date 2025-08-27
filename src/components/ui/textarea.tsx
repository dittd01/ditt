
'use client';
import * as React from 'react';

import {cn} from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({className, onChange, ...props}, ref) => {
    const internalRef = React.useRef<HTMLTextAreaElement>(null);
    const combinedRef = (node: HTMLTextAreaElement) => {
        if (typeof ref === 'function') {
            ref(node);
        } else if (ref) {
            ref.current = node;
        }
        (internalRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
    };
    
    const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (internalRef.current) {
        internalRef.current.style.height = 'auto';
        internalRef.current.style.height = `${internalRef.current.scrollHeight}px`;
      }
      if (onChange) {
        onChange(event);
      }
    };

    React.useLayoutEffect(() => {
        if (internalRef.current) {
            internalRef.current.style.height = 'auto';
            internalRef.current.style.height = `${internalRef.current.scrollHeight}px`;
        }
    }, [props.value]);


    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm overflow-hidden',
          className
        )}
        ref={combinedRef}
        onInput={handleInput}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export {Textarea};
