interface ErrorMessageProps {
  children: React.ReactNode;
}

export function ErrorMessage({ children }: ErrorMessageProps) {
  return (
    <div className="min-h-[20px] text-sm font-medium text-destructive mt-1">
      {children}
    </div>
  );
}

interface FieldDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function FieldDescription({
  children,
  className = "",
}: FieldDescriptionProps) {
  return (
    <div className={`text-xs text-muted-foreground ${className}`}>
      {children}
    </div>
  );
}
