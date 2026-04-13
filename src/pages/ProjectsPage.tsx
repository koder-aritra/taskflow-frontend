import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Skeleton,
  Alert,
} from "@mui/material";
import { Add, FolderOff } from "@mui/icons-material";
import { useProjects } from "../hooks/use-projects";
import ProjectCard from "../components/projects/ProjectCard";
import CreateProjectDialog from "../components/projects/CreateProjectDialog";

export default function ProjectsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isLoading, error } = useProjects();

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Failed to load projects. Please try again.
      </Alert>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Projects</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateOpen(true)}
        >
          New Project
        </Button>
      </Box>

      {isLoading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Skeleton variant="rounded" height={160} />
            </Grid>
          ))}
        </Grid>
      ) : data && data.projects.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {data.projects.map((project) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={project.id}>
                <ProjectCard project={project} />
              </Grid>
            ))}
          </Grid>
        </>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 10,
            gap: 2,
          }}
        >
          <FolderOff sx={{ fontSize: 80, color: "text.secondary" }} />
          <Typography variant="h6" color="text.secondary">
            No projects yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create your first project to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateOpen(true)}
          >
            Create Project
          </Button>
        </Box>
      )}

      <CreateProjectDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </Box>
  );
}
