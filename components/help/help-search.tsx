"use client";

import { useState, useCallback, useEffect } from "react";
import { Search } from "lucide-react";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";

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

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, onSearch]);

  return (
    <InputGroup>
      <InputGroupInput
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder={placeholder}
      />
      <InputGroupAddon>
        <Search className="h-4 w-4 text-muted-foreground" />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </InputGroupAddon>
    </InputGroup>
  );
}
