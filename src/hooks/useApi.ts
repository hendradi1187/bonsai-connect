import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';

interface UseGetOptions {
  enabled?: boolean;
  params?: any;
}

// Example generic query hook
export const useGet = <T>(key: string[], url: string, options?: UseGetOptions) => {
  return useQuery<T>({
    queryKey: key,
    queryFn: async () => {
      const response = await api.get<T>(url, { params: options?.params });
      return response.data;
    },
    enabled: options?.enabled,
  });
};

// Example generic mutation hook
export const usePost = <T, R>(url: string, keyToInvalidate?: string[][]) => {
  const queryClient = useQueryClient();
  return useMutation<R, Error, T>({
    mutationFn: async (data: T) => {
      const response = await api.post<R>(url, data);
      return response.data;
    },
    onSuccess: () => {
      if (keyToInvalidate) {
        keyToInvalidate.forEach(key => queryClient.invalidateQueries({ queryKey: key }));
      }
    },
  });
};

export const usePut = <T, R>(url: string, keyToInvalidate?: string[][]) => {
  const queryClient = useQueryClient();
  return useMutation<R, Error, T>({
    mutationFn: async (data: T) => {
      const response = await api.put<R>(url, data);
      return response.data;
    },
    onSuccess: () => {
      if (keyToInvalidate) {
        keyToInvalidate.forEach(key => queryClient.invalidateQueries({ queryKey: key }));
      }
    },
  });
};

// Specialized hooks (examples)
export const useEvents = () => useGet<any[]>(['events'], '/events');
export const useParticipants = (eventId: string) => useGet<any[]>(['participants', eventId], `/participants/${eventId}`);
