
import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from './useDebounce';

interface AutocompleteResult {
  id: string;
  title: string;
  type: 'video' | 'book' | 'podcast' | 'music';
  author?: string;
  thumbnail?: string;
  url?: string;
}

interface UseAutocompleteOptions {
  minLength?: number;
  debounceMs?: number;
  maxResults?: number;
}

interface UseAutocompleteReturn {
  suggestions: AutocompleteResult[];
  isLoading: boolean;
  error: string | null;
  selectedIndex: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  handleKeyDown: (e: React.KeyboardEvent) => boolean;
  handleSuggestionClick: (suggestion: AutocompleteResult) => void;
  clearSuggestions: () => void;
}

export function useAutocomplete(
  query: string,
  type: string = 'all',
  options: UseAutocompleteOptions = {}
): UseAutocompleteReturn {
  const {
    minLength = 2,
    debounceMs = 300,
    maxResults = 8
  } = options;

  const [suggestions, setSuggestions] = useState<AutocompleteResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const debouncedQuery = useDebounce(query, debounceMs);

  const fetchSuggestions = useCallback(async (searchQuery: string, searchType: string) => {
    if (searchQuery.length < minLength) {
      setSuggestions([]);
      setIsLoading(false);
      setIsOpen(false);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/autocomplete?q=${encodeURIComponent(searchQuery)}&type=${searchType}`,
        { signal: abortControllerRef.current.signal }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }

      const data = await response.json();
      setSuggestions(data.suggestions.slice(0, maxResults));
      setIsOpen(data.suggestions.length > 0);
      setSelectedIndex(-1);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to fetch suggestions');
        setSuggestions([]);
        setIsOpen(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, [minLength, maxResults]);

  useEffect(() => {
    fetchSuggestions(debouncedQuery, type);
  }, [debouncedQuery, type, fetchSuggestions]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent): boolean => {
    if (!isOpen || suggestions.length === 0) return false;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        return true;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        return true;

      case 'Enter':
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          e.preventDefault();
          const selectedSuggestion = suggestions[selectedIndex];
          handleSuggestionClick(selectedSuggestion);
          return true;
        }
        return false;

      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        return true;

      default:
        return false;
    }
  }, [isOpen, suggestions, selectedIndex]);

  const handleSuggestionClick = useCallback((suggestion: AutocompleteResult) => {
    setIsOpen(false);
    setSelectedIndex(-1);
    // The actual navigation will be handled by the component using this hook
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    suggestions,
    isLoading,
    error,
    selectedIndex,
    isOpen,
    setIsOpen,
    handleKeyDown,
    handleSuggestionClick,
    clearSuggestions,
  }
}
