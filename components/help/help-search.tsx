"use client";

import { useState, useCallback, useEffect } from "react";
import { Search, X } from "lucide-react";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";

interface HelpSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function HelpSearch({
  onSearch,
  placeholder = "Sök i hjälpen...",
}: HelpSearchProps) {
  const [query, setQuery] = useState("");

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);
    },
    []
  );

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, onSearch]);

  return (
    <InputGroup className="mb-6">
      <InputGroupAddon>
        <Search className="h-4 w-4 text-muted-foreground" />
      </InputGroupAddon>
      <InputGroupInput
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder={placeholder}
      />
      {query && (
        <InputGroupAddon>
          <InputGroupButton variant="ghost" size="icon-xs" onClick={handleClear}>
            <X className="h-4 w-4" />
            <span className="sr-only">Rensa sökning</span>
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}
