'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SimpleEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SimpleEditor({
  value,
  onChange,
  placeholder,
  className,
}: SimpleEditorProps) {
  const [isClient, setIsClient] = useState(false);
  const [text, setText] = useState(value || '');

  useEffect(() => {
    setIsClient(true);
    if (value) {
      // If value is HTML, strip tags for display in textarea
      const parser = new DOMParser();
      const doc = parser.parseFromString(value, 'text/html');
      setText(doc.body.textContent || doc.body.innerText || '');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    
    // Convert basic line breaks to HTML
    const htmlContent = newText.replace(/\n/g, '<br>');
    onChange?.(htmlContent);
  };

  if (!isClient) {
    return (
      <div
        className={cn(
          'relative rounded-md border border-input bg-background text-sm ring-offset-background min-h-[100px] px-3 py-2',
          className
        )}
      >
        <div className="text-muted-foreground">
          {placeholder || 'Loading editor...'}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative rounded-md border border-input bg-background text-sm ring-offset-background',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        className
      )}
    >
      <textarea
        value={text}
        onChange={handleChange}
        placeholder={placeholder || 'Enter some text...'}
        className="w-full min-h-[100px] resize-none px-3 py-2 text-sm focus:outline-none bg-transparent"
        style={{ outline: 'none' }}
      />
      <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
        Rich text editor (basic)
      </div>
    </div>
  );
}