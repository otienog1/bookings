import { cn } from '@/lib/utils';

interface PlaceholderProps {
  children?: React.ReactNode;
  className?: string;
}

export default function Placeholder({ children, className }: PlaceholderProps): JSX.Element {
  return (
    <div
      className={cn(
        'pointer-events-none absolute left-3 top-2 text-sm text-muted-foreground',
        className
      )}
    >
      {children || 'Any additional notes or comments about this agent...'}
    </div>
  );
}