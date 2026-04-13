import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Skeleton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  Add,
  ArrowBack,
  Edit,
  Delete,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { useProject, useUpdateProject, useDeleteProject } from "../hooks/use-projects";
import { useTasks } from "../hooks/use-tasks";
import { useAuth } from "../context/auth-context";
import TaskBoard from "../components/tasks/TaskBoard";
import TaskFilters from "../components/tasks/TaskFilters";
import TaskFormDialog from "../components/tasks/TaskFormDialog";
import type { Task, TaskPriority } from "../types";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [filterPriority, setFilterPriority] = useState<TaskPriority | "">("");
  const listParams = useMemo(() => ({ limit: 100 }), []);

  const { data: project, isLoading: projectLoading, error: projectError } = useProject(id!);
  const { data: tasksData, isLoading: tasksLoading } = useTasks(id!, listParams);
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const isOwner = project && user ? project.owner_id === user.id : false;
  const userNameById = user ? { [user.id]: user.name } : {};
  const allTasks = tasksData?.tasks ?? [];
  const tasks = filterPriority ? allTasks.filter((task) => task.priority === filterPriority) : allTasks;

  const handleTaskClick = (task: Task) => {
    if (!user) return;
    if (!isOwner && task.assignee_id !== user.id) return;
    setEditingTask(task);
    setTaskDialogOpen(true);
  };

  const handleEditProject = () => {
    if (!project) return;
    setEditName(project.name);
    setEditDesc(project.description || "");
    setEditProjectOpen(true);
  };

  const handleSaveProject = async () => {
    if (!project) return;
    try {
      await updateProject.mutateAsync({
        id: project.id,
        data: { name: editName, description: editDesc || null },
      });
      enqueueSnackbar("Project updated!", { variant: "success" });
      setEditProjectOpen(false);
    } catch {
      enqueueSnackbar("Failed to update project", { variant: "error" });
    }
  };

  const handleDeleteProject = async () => {
    if (!project) return;
    if (!window.confirm("Delete this project? All tasks will be removed.")) return;
    try {
      await deleteProject.mutateAsync(project.id);
      enqueueSnackbar("Project deleted", { variant: "info" });
      navigate("/projects");
    } catch {
      enqueueSnackbar("Failed to delete project", { variant: "error" });
    }
  };

  if (projectError) {
    return (
      <Box>
        <Button startIcon={<ArrowBack />} onClick={() => navigate("/projects")} sx={{ mb: 2 }}>
          Back to Projects
        </Button>
        <Alert severity="error">Failed to load project. It may not exist or you don&apos;t have access.</Alert>
      </Box>
    );
  }

  if (projectLoading) {
    return (
      <Box>
        <Skeleton variant="text" width={300} height={50} />
        <Skeleton variant="text" width={200} height={30} />
        <Box sx={{ display: "flex", gap: 1, mt: 2, mb: 3 }}>
          <Skeleton variant="rounded" width={100} height={32} />
          <Skeleton variant="rounded" width={100} height={32} />
          <Skeleton variant="rounded" width={100} height={32} />
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" width="33%" height={400} />
          ))}
        </Box>
      </Box>
    );
  }

  if (!project) return null;

  return (
    <Box>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/projects")}
        sx={{ mb: 2 }}
      >
        Back to Projects
      </Button>

      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1, flexWrap: "wrap", gap: 1 }}>
        <Box>
          <Typography variant="h4">{project.name}</Typography>
          {project.description && (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              {project.description}
            </Typography>
          )}
        </Box>
        {isOwner && (
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Tooltip title="Edit project">
              <IconButton onClick={handleEditProject} size="small">
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete project">
              <IconButton onClick={handleDeleteProject} size="small" color="error">
                <Delete />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
        <TaskFilters
          priority={filterPriority}
          onPriorityChange={setFilterPriority}
        />
        {isOwner && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setEditingTask(null);
              setTaskDialogOpen(true);
            }}
          >
            Add Task
          </Button>
        )}
      </Box>

      {tasksLoading ? (
        <Box sx={{ display: "flex", gap: 2 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" width="33%" height={300} />
          ))}
        </Box>
      ) : (
        <TaskBoard
          tasks={tasks}
          onTaskClick={handleTaskClick}
          userNameById={userNameById}
        />
      )}

      <TaskFormDialog
        open={taskDialogOpen}
        onClose={() => {
          setTaskDialogOpen(false);
          setEditingTask(null);
        }}
        projectId={id!}
        task={editingTask}
        isOwner={isOwner}
        isAssignee={!!user && !!editingTask && editingTask.assignee_id === user.id}
        currentUserId={user?.id || ""}
      />

      <Dialog open={editProjectOpen} onClose={() => setEditProjectOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Project</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
          <TextField
            label="Project Name"
            fullWidth
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditProjectOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveProject} disabled={!editName.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
