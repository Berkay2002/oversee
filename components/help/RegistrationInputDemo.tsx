'use client';

import * as React from 'react';
import { X, PlusCircle, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface RegistrationInputDemoProps {
  placeholder?: string;
  className?: string;
}

export function RegistrationInputDemo({
  placeholder = 'Skriv reg nr och tryck Enter...',
  className,
}: RegistrationInputDemoProps) {
  const [value, setValue] = React.useState(['EXEMPEL1', 'EXEMPEL2']);
  const [inputValue, setInputValue] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const normalizeRegistration = (reg: string): string => {
    return reg.trim().toUpperCase().replace(/\s+/g, '');
  };

  const addRegistration = (registration: string) => {
    const normalized = normalizeRegistration(registration);
    if (!normalized || value.includes(normalized)) {
      setInputValue('');
      return;
    }
    setValue([...value, normalized]);
    setInputValue('');
  };

  const removeRegistration = (index: number) => {
    setValue(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        addRegistration(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      e.preventDefault();
      removeRegistration(value.length - 1);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addRegistration(inputValue);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const registrations = pastedText
      .split(/[,;\n]/)
      .map(r => normalizeRegistration(r))
      .filter(r => r && !value.includes(r));

    if (registrations.length > 0) {
      setValue([...value, ...registrations]);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4 shadow-sm">
      <div
        className={cn(
          'flex min-h-12 w-full flex-wrap items-center gap-2 rounded-md border border-input bg-background/50 px-3 py-2 text-base ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
          className
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((registration, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="h-7 gap-1.5 rounded-md border border-border/50 bg-secondary/50 px-2 py-1 text-sm font-medium"
          >
            {registration}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeRegistration(index);
              }}
              className="ml-1 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted-foreground/20 hover:text-foreground"
              aria-label={`Remove ${registration}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <div className="flex h-7 flex-1 items-center gap-2">
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onPaste={handlePaste}
            placeholder={value.length === 0 ? placeholder : ''}
            className="h-full min-w-24 flex-1 border-0 bg-transparent p-0 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          {inputValue && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-full shrink-0 px-2 text-muted-foreground"
              onClick={() => addRegistration(inputValue)}
            >
              <PlusCircle className="mr-1.5 h-4 w-4" />
              Lägg till
            </Button>
          )}
        </div>
      </div>
      <div className="space-y-3 px-2 text-sm text-muted-foreground">
        <div className="flex items-start gap-2">
          <HelpCircle className="h-4 w-4 shrink-0 translate-y-0.5" />
          <span>
            <strong>Skriv och tryck Enter:</strong> Lägg till ett registreringsnummer genom att skriva i fältet och trycka på Enter-tangenten.
          </span>
        </div>
        <div className="flex items-start gap-2">
          <HelpCircle className="h-4 w-4 shrink-0 translate-y-0.5" />
          <span>
            <strong>Klistra in flera:</strong> Du kan klistra in en lista med registreringsnummer separerade med kommatecken, semikolon eller nya rader.
          </span>
        </div>
        <div className="flex items-start gap-2">
          <HelpCircle className="h-4 w-4 shrink-0 translate-y-0.5" />
          <span>
            <strong>Ta bort:</strong> Klicka på krysset (X) på ett märke för att ta bort det. Du kan också trycka på Backspace i ett tomt fält för att ta bort det sista numret.
          </span>
        </div>
      </div>
    </div>
  );
}
