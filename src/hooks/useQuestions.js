import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../api/client';
import { useQuery } from '@tanstack/react-query';

// ==========================================
// 1. INFINITE SCROLL QUESTIONS HOOK
// ==========================================
export function useQuestions(initialFilters = {}) {
    const [questions, setQuestions] = useState([]);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [filters, setFilters] = useState(initialFilters);

    const loadingRef = useRef(false);

const fetchQuestions = useCallback(async (pageNum, currentFilters, append = false) => {
        if (loadingRef.current) return;

        loadingRef.current = true;
        setLoading(true);

        try {
            const params = new URLSearchParams({
                page: pageNum,
                size: 10,
                ...currentFilters
            });

            // THE FIX: Only sort by topic if it's a Theory question!
            // This protects DSA and System Design from database crashes.
            if (currentFilters.type === 'THEORY') {
                params.append('sort', 'topic,asc');
            }

            for (const [key, value] of Array.from(params.entries())) {
                if (value === '' || value === null || value === undefined) {
                    params.delete(key);
                }
            }

            const response = await apiClient.get(`/questions?${params.toString()}`);
            const newData = response.data.content ? response.data.content : (response.data || []);

            if (append) {
                setQuestions(prev => {
                    const existingIds = new Set(prev.map(q => q.id));
                    const uniqueNewData = newData.filter(q => !existingIds.has(q.id));
                    return [...prev, ...uniqueNewData];
                });
            } else {
                setQuestions(newData);
            }

            setHasMore(newData.length === 10);

        } catch (error) {
            console.error("Failed to fetch questions:", error);
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        setPage(0);
        fetchQuestions(0, filters, false);
    }, [filters, fetchQuestions]);

    useEffect(() => {
        if (page > 0) {
            fetchQuestions(page, filters, true);
        }
    }, [page, filters, fetchQuestions]);

    const loadMore = useCallback(() => {
        if (!loadingRef.current && hasMore) {
            setPage(prevPage => prevPage + 1);
        }
    }, [hasMore]);

    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    return {
        questions,
        setQuestions,
        loading,
        hasMore,
        loadMore,
        filters,
        updateFilters,
        isLoading: loading,               // Old pages look for isLoading
        data: { content: questions }
    };
}

// ==========================================
// 2. RESTORED TOPICS HOOK (Fixes Topbar Crash)
// ==========================================
export function useTopics() {
    const [data, setData] = useState([]);

    useEffect(() => {
        apiClient.get('/questions/topics')
            .then(response => {
                // Extract data depending on Spring Boot response shape
                const topicsData = response.data.content ? response.data.content : response.data;
                setData(topicsData || []);
            })
            .catch(error => {
                console.error("Failed to fetch topics:", error);
                // Fallback list so the UI doesn't crash if the endpoint fails
                setData([
                    'Core Java', 'Java 8', 'Collections', 'Multithreading',
                    'String', 'Spring Boot', 'REST APIs', 'Design Patterns',
                    'Microservices', 'Exception Handling', 'OOP', 'SQL'
                ]);
            });
    }, []);

    return { data };
}

export function useMetadata() {
    return useQuery({
        queryKey: ['question-metadata'],
        queryFn: async () => {
            const res = await apiClient.get('/questions/metadata');
            return res.data;
        },
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes so it doesn't spam the DB
        initialData: { weeks: [], categories: [], tags: [], difficulties: [], priorities: [] }
    });
}