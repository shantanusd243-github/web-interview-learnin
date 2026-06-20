import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

const FilterContext = createContext(null);

// Minimum characters before a search API call is made (Item 8).
const SEARCH_MIN_CHARS = 5;
// Debounce delay in ms (Item 8).
const SEARCH_DEBOUNCE_MS = 500;

export function FilterProvider({ children }) {
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState('');
  const [priority, setPriority] = useState('');
  const [difficulty, setDifficulty] = useState('');

  // debouncedSearch is the value actually sent to the API.
  // It only updates after SEARCH_DEBOUNCE_MS and only when >= SEARCH_MIN_CHARS
  // (or when cleared to empty string).
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceTimer = useRef(null);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (search.length === 0) {
      // Cleared — update immediately, no debounce needed.
      setDebouncedSearch('');
      return;
    }

    if (search.length < SEARCH_MIN_CHARS) {
      // Not enough chars yet — keep previous debounced value (don't fire API).
      return;
    }

    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search]);

  const setTopicFilter = useCallback((t) => setTopic(t), []);

  // Hint shown in the search input below the field
  const searchHint =
    search.length > 0 && search.length < SEARCH_MIN_CHARS
      ? `Type at least ${SEARCH_MIN_CHARS} characters to search`
      : '';

  return (
    <FilterContext.Provider
      value={{
        search,           // raw typed value — bind this to the input
        setSearch,
        debouncedSearch,  // debounced & min-length gated — pass this to useQuestions
        searchHint,       // show this hint below the search box when too short
        topic,
        setTopic,
        priority,
        setPriority,
        difficulty,
        setDifficulty,
        setTopicFilter,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilters must be used within FilterProvider');
  return ctx;
}
