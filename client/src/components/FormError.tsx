import { AlertCircle } from "lucide-react";

interface FormErrorProps {
  error?: string | null;
  className?: string;
}

export default function FormError({ error, className = "" }: FormErrorProps) {
  if (!error) return null;

  return (
    <div className={`flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/30 rounded-md ${className}`}>
      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
      <p className="text-sm text-destructive font-medium">{error}</p>
    </div>
  );
}
