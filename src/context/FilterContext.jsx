import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

const FilterContext = createContext(null);

// CHANGED TO 3 per requirements
const SEARCH_MIN_CHARS = 3;
const SEARCH_DEBOUNCE_MS = 500;

export function FilterProvider({ children }) {
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState('');
  const [priority, setPriority] = useState('');
  const [difficulty, setDifficulty] = useState('');

  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceTimer = useRef(null);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (search.length === 0) {
      setDebouncedSearch('');
      return;
    }

    if (search.length < SEARCH_MIN_CHARS) {
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

  const searchHint =
    search.length > 0 && search.length < SEARCH_MIN_CHARS
      ? `Type at least ${SEARCH_MIN_CHARS} characters to search`
      : '';

  return (
    <FilterContext.Provider
      value={{
        search,
        setSearch,
        debouncedSearch,
        searchHint,
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