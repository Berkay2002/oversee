'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface RegistrationInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function RegistrationInput({
  value = [],
  onChange,
  placeholder = 'Type and press Enter...',
  disabled = false,
  className,
}: RegistrationInputProps) {
  const [inputValue, setInputValue] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const normalizeRegistration = (reg: string): string => {
    // Uppercase and remove extra whitespace
    return reg.trim().toUpperCase().replace(/\s+/g, ' ');
  };

  const addRegistration = (registration: string) => {
    const normalized = normalizeRegistration(registration);

    // Don't add empty or duplicate registrations
    if (!normalized || value.includes(normalized)) {
      setInputValue('');
      return;
    }

    onChange([...value, normalized]);
    setInputValue('');
  };

  const removeRegistration = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        addRegistration(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // Remove last chip on backspace if input is empty
      e.preventDefault();
      removeRegistration(value.length - 1);
    }
  };

  const handleBlur = () => {
    // Add the current input value on blur if it's not empty
    if (inputValue.trim()) {
      addRegistration(inputValue);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');

    // Split by common separators (comma, semicolon, newline)
    const registrations = pastedText
      .split(/[,;\n]/)
      .map(r => normalizeRegistration(r))
      .filter(r => r && !value.includes(r));

    if (registrations.length > 0) {
      onChange([...value, ...registrations]);
    }
  };

  return (
    <div
      className={cn(
        'flex min-h-20 w-full flex-wrap gap-2 rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((registration, index) => (
        <Badge
          key={index}
          variant="secondary"
          className="h-7 gap-1 pr-1 text-sm font-mono"
        >
          {registration}
          {!disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeRegistration(index);
              }}
              className="ml-1 rounded-sm hover:bg-secondary-foreground/20"
              aria-label={`Remove ${registration}`}
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </Badge>
      ))}
      <Input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onPaste={handlePaste}
        placeholder={value.length === 0 ? placeholder : ''}
        disabled={disabled}
        className="h-7 flex-1 border-0 bg-transparent p-0 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </div>
  );
}
