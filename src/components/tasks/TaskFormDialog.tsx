import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { AxiosError } from "axios";
import type { Task, ApiError } from "../../types";
import { useCreateTask, useUpdateTask, useDeleteTask } from "../../hooks/use-tasks";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "done"]),
  priority: z.enum(["low", "medium", "high"]),
  due_date: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  projectId: string;
  task?: Task | null;
  /** Project owner: create tasks, delete tasks, full edit */
  isOwner: boolean;
  /** Current user is the task assignee (edit mode): can change all task fields including assignee */
  isAssignee?: boolean;
  currentUserId: string;
}

export default function TaskFormDialog({
  open,
  onClose,
  projectId,
  task,
  isOwner,
  isAssignee = false,
  currentUserId,
}: Props) {
  const isEdit = !!task;
  const createTask = useCreateTask(projectId);
  const updateTask = useUpdateTask(projectId);
  const deleteTask = useDeleteTask(projectId);
  const { enqueueSnackbar } = useSnackbar();
  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      due_date: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (task) {
        reset({
          title: task.title,
          description: task.description || "",
          status: task.status,
          priority: task.priority,
          due_date: task.due_date || "",
        });
      } else {
        reset({
          title: "",
          description: "",
          status: "todo",
          priority: "medium",
          due_date: "",
        });
      }
    }
  }, [open, task, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        title: data.title,
        description: data.description || null,
        status: data.status as "todo" | "in_progress" | "done",
        priority: data.priority as "low" | "medium" | "high",
        assignee_id: currentUserId,
        due_date: data.due_date || null,
      };

      if (isEdit && task) {
        await updateTask.mutateAsync({ taskId: task.id, data: payload });
        enqueueSnackbar("Task updated!", { variant: "success" });
      } else {
        await createTask.mutateAsync(payload);
        enqueueSnackbar("Task created!", { variant: "success" });
      }
      onClose();
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      const apiErr = axiosErr.response?.data;
      if (apiErr?.fields) {
        for (const [field, msg] of Object.entries(apiErr.fields)) {
          if (field in schema.shape) {
            setError(field as keyof FormData, { message: msg });
          }
        }
      } else {
        enqueueSnackbar(apiErr?.error || "Operation failed", {
          variant: "error",
        });
      }
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask.mutateAsync(task.id);
      enqueueSnackbar("Task deleted", { variant: "info" });
      onClose();
    } catch {
      enqueueSnackbar("Failed to delete task", { variant: "error" });
    }
  };

  const canEditAllFields = isOwner || (isEdit && isAssignee);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {isEdit ? "Edit Task" : "New Task"}
          {isEdit && isOwner && (
            <Tooltip title="Delete task">
              <IconButton
                onClick={handleDelete}
                color="error"
                size="small"
                disabled={deleteTask.isPending}
              >
                <Delete />
              </IconButton>
            </Tooltip>
          )}
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            pt: "8px !important",
          }}
        >
          <TextField
            label="Title"
            fullWidth
            autoFocus
            error={!!errors.title}
            helperText={errors.title?.message}
            {...register("title")}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            {...register("description")}
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Status"
                  fullWidth
                  disabled={!canEditAllFields}
                  error={!!errors.status}
                  helperText={errors.status?.message}
                >
                  <MenuItem value="todo">Todo</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="done">Done</MenuItem>
                </TextField>
              )}
            />
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Priority"
                  fullWidth
                  disabled={!canEditAllFields}
                  error={!!errors.priority}
                  helperText={errors.priority?.message}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </TextField>
              )}
            />
          </Box>
          <TextField
            label="Due Date"
            type="date"
            fullWidth
            disabled={!canEditAllFields}
            slotProps={{ inputLabel: { shrink: true } }}
            {...register("due_date")}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? (
              <CircularProgress size={20} />
            ) : isEdit ? (
              "Update"
            ) : (
              "Create"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
