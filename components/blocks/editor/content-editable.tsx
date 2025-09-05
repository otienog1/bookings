import { ContentEditable as LexicalContentEditable } from '@lexical/react/LexicalContentEditable';
import { cn } from '@/lib/utils';

interface ContentEditableProps {
  className?: string;
}

export default function ContentEditable({ className }: ContentEditableProps): JSX.Element {
  return (
    <LexicalContentEditable
      className={cn(
        'min-h-[100px] resize-none px-3 py-2 text-sm focus:outline-none',
        className
      )}
      style={{
        outline: 'none',
      }}
    />
  );
}