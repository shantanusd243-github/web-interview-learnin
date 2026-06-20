import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { progressApi, bookmarksApi } from '../api/userActivity';
import { useAuth } from '../context/AuthContext';

export function useProgress() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['progress'],
    queryFn: progressApi.list,
    enabled: !!user,
    staleTime: 60_000,
  });
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, status }) => progressApi.update(questionId, status),

    // Optimistic update — patch the cached questions list immediately so the
    // UI reflects the new status without waiting for a round-trip refetch.
    onMutate: async ({ questionId, status }) => {
      // Cancel any in-flight refetches so they don't clobber our optimistic write.
      await queryClient.cancelQueries({ queryKey: ['questions'] });
      await queryClient.cancelQueries({ queryKey: ['progress'] });

      // Snapshot previous values so we can roll back on error.
      const previousQueries = queryClient.getQueriesData({ queryKey: ['questions'] });
      const previousProgress = queryClient.getQueryData(['progress']);

      // Patch every cached questions page that contains this question.
      queryClient.setQueriesData({ queryKey: ['questions'] }, (old) => {
        if (!old?.content) return old;
        return {
          ...old,
          content: old.content.map((q) =>
            q.id === questionId ? { ...q, userProgressStatus: status } : q
          ),
        };
      });

      // Also patch the progress list cache.
      queryClient.setQueryData(['progress'], (old) => {
        if (!old) return old;
        const exists = old.some((p) => p.questionId === questionId);
        if (exists) {
          return old.map((p) =>
            p.questionId === questionId ? { ...p, status } : p
          );
        }
        return [...old, { questionId, status }];
      });

      return { previousQueries, previousProgress };
    },

    onError: (_err, _vars, context) => {
      // Roll back to snapshot on failure.
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousProgress !== undefined) {
        queryClient.setQueryData(['progress'], context.previousProgress);
      }
    },

    onSettled: () => {
      // After success or error, sync with server in the background.
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
  });
}

export function useBookmarks() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['bookmarks'],
    queryFn: bookmarksApi.list,
    enabled: !!user,
    staleTime: 60_000,
  });
}

export function useToggleBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, bookmarked }) =>
      bookmarked ? bookmarksApi.remove(questionId) : bookmarksApi.add(questionId),

    // Optimistic update — flip the bookmark flag immediately.
    onMutate: async ({ questionId, bookmarked }) => {
      await queryClient.cancelQueries({ queryKey: ['questions'] });
      await queryClient.cancelQueries({ queryKey: ['bookmarks'] });

      const previousQueries = queryClient.getQueriesData({ queryKey: ['questions'] });
      const previousBookmarks = queryClient.getQueryData(['bookmarks']);

      queryClient.setQueriesData({ queryKey: ['questions'] }, (old) => {
        if (!old?.content) return old;
        return {
          ...old,
          content: old.content.map((q) =>
            q.id === questionId ? { ...q, bookmarked: !bookmarked } : q
          ),
        };
      });

      queryClient.setQueryData(['bookmarks'], (old) => {
        if (!old) return old;
        if (bookmarked) {
          return old.filter((b) => b.questionId !== questionId);
        }
        return [...old, { questionId, id: `optimistic-${questionId}` }];
      });

      return { previousQueries, previousBookmarks };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousBookmarks !== undefined) {
        queryClient.setQueryData(['bookmarks'], context.previousBookmarks);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
}
