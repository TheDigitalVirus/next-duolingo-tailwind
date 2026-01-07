interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = "Carregando..." }: LoadingSpinnerProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent mx-auto" />
        <p className="mt-2 text-gray-600">{message}</p>
      </div>
    </div>
  );
}