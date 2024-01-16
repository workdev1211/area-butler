import { FC } from "react";

export const Loading: FC = () => {
  return (
    <div className="flex justify-center items-center p-3 gap-3">
      <div
        className="animate-spin w-7 h-7 border-[3px] border-current border-t-transparent text-gray-800 rounded-full dark:text-white"
        role="status"
        aria-label="loading"
      >
        <span className="sr-only">Wird geladen...</span>
      </div>
      <div className="text-lg not-sr-only">Wird geladen...</div>
    </div>
  );
};

export const LoadingMessage: FC = () => <div>Seite wird geladen...</div>;
