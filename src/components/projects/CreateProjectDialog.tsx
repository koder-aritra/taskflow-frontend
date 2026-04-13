import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import { useCreateProject } from "../../hooks/use-projects";
import { useSnackbar } from "notistack";
import { AxiosError } from "axios";
import type { ApiError } from "../../types";

const schema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CreateProjectDialog({ open, onClose }: Props) {
  const createProject = useCreateProject();
  const { enqueueSnackbar } = useSnackbar();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "" },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createProject.mutateAsync({
        name: data.name,
        description: data.description || null,
      });
      enqueueSnackbar("Project created!", { variant: "success" });
      reset();
      onClose();
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      const apiErr = axiosErr.response?.data;
      if (apiErr?.fields?.name) {
        setError("name", { message: apiErr.fields.name });
      } else {
        enqueueSnackbar(apiErr?.error || "Failed to create project", {
          variant: "error",
        });
      }
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>New Project</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}
        >
          <TextField
            label="Project Name"
            fullWidth
            autoFocus
            error={!!errors.name}
            helperText={errors.name?.message}
            {...register("name")}
          />
          <TextField
            label="Description (optional)"
            fullWidth
            multiline
            rows={3}
            error={!!errors.description}
            helperText={errors.description?.message}
            {...register("description")}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={20} /> : "Create"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
