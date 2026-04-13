import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "../lib/api";
import type {
  CreateTaskRequest,
  UpdateTaskRequest,
  ListTasksParams,
  Task,
} from "../types";

export function useTasks(projectId: string, params?: ListTasksParams) {
  return useQuery({
    queryKey: ["tasks", projectId, params],
    queryFn: () => tasksApi.list(projectId, params),
    enabled: !!projectId,
  });
}

export function useCreateTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskRequest) => tasksApi.create(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", projectId] });
      qc.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });
}

export function useUpdateTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: UpdateTaskRequest }) =>
      tasksApi.update(taskId, data),
    onMutate: async ({ taskId, data }) => {
      await qc.cancelQueries({ queryKey: ["tasks", projectId] });

      const queries = qc.getQueriesData<{ tasks: Task[] }>({
        queryKey: ["tasks", projectId],
      });

      const snapshots: Array<
        [readonly unknown[], { tasks: Task[] } | undefined]
      > = [];
      for (const [key, value] of queries) {
        snapshots.push([key, value]);
        if (value) {
          qc.setQueryData<{ tasks: Task[] }>(key, {
            ...value,
            tasks: value.tasks.map((t) =>
              t.id === taskId ? { ...t, ...data } : t
            ),
          });
        }
      }
      return { snapshots };
    },
    onError: (_err, _vars, context) => {
      if (context?.snapshots) {
        for (const [key, value] of context.snapshots) {
          qc.setQueryData(key, value);
        }
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["tasks", projectId] });
      qc.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });
}

export function useDeleteTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => tasksApi.delete(taskId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", projectId] });
      qc.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });
}
