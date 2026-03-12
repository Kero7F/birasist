"use client";

import { forwardRef, type ChangeEvent, type InputHTMLAttributes } from "react";

type BaseProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  onChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
};

function mergeClassName(base: string, extra?: string) {
  return extra ? `${base} ${extra}` : base;
}

const baseInputClasses =
  "block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring";

export const NameInput = forwardRef<HTMLInputElement, BaseProps>(
  ({ className, onChange, ...props }, ref) => {
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      const raw = event.target.value;
      const formatted = raw.toLocaleUpperCase("tr-TR");
      event.target.value = formatted;
      onChange?.(formatted, event);
    };

    return (
      <input
        ref={ref}
        {...props}
        className={mergeClassName(baseInputClasses, className)}
        onChange={handleChange}
      />
    );
  }
);

NameInput.displayName = "NameInput";

export const TcInput = forwardRef<HTMLInputElement, BaseProps>(
  ({ className, onChange, ...props }, ref) => {
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      const digits = event.target.value.replace(/\D/g, "").slice(0, 11);
      event.target.value = digits;
      onChange?.(digits, event);
    };

    return (
      <input
        ref={ref}
        {...props}
        inputMode="numeric"
        maxLength={11}
        className={mergeClassName(baseInputClasses, className)}
        onChange={handleChange}
      />
    );
  }
);

TcInput.displayName = "TcInput";

export const PhoneInput = forwardRef<HTMLInputElement, BaseProps>(
  ({ className, onChange, ...props }, ref) => {
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      const digits = event.target.value.replace(/\D/g, "");
      const trimmed = digits.startsWith("90") ? digits.slice(2) : digits;
      const limited = trimmed.slice(0, 10);

      let formatted = "+90";
      if (limited.length > 0) {
        formatted += " (";
        formatted += limited.slice(0, 3);
        if (limited.length >= 3) formatted += ")";
      }
      if (limited.length > 3) {
        formatted += " ";
        formatted += limited.slice(3, 6);
      }
      if (limited.length > 6) {
        formatted += " ";
        formatted += limited.slice(6, 8);
      }
      if (limited.length > 8) {
        formatted += " ";
        formatted += limited.slice(8, 10);
      }

      event.target.value = formatted;
      onChange?.(formatted, event);
    };

    return (
      <input
        ref={ref}
        {...props}
        className={mergeClassName(baseInputClasses, className)}
        onChange={handleChange}
      />
    );
  }
);

PhoneInput.displayName = "PhoneInput";

