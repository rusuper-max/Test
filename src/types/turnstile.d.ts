// src/types/turnstile.d.ts
export {};

declare global {
  interface Window {
    turnstile?: {
      render(
        container: HTMLElement | string,
        options: {
          sitekey: string;
          theme?: "auto" | "light" | "dark";
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ): string; // widgetId
      reset(widget?: string | HTMLElement): void;
      getResponse?(widget?: string | HTMLElement): string;
    };
  }
}