import {
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import { Folder } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import type { Project } from "../../types";

interface Props {
  project: Project;
}

export default function ProjectCard({ project }: Props) {
  const navigate = useNavigate();

  return (
    <Card
      sx={{
        height: "100%",
        "&:hover": { boxShadow: 6 },
      }}
    >
      <CardActionArea
        onClick={() => navigate(`/projects/${project.id}`)}
        sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "stretch" }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Folder color="primary" fontSize="small" />
            <Typography variant="h6" noWrap>
              {project.name}
            </Typography>
          </Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: 40,
            }}
          >
            {project.description || "No description"}
          </Typography>
          <Chip
            label={new Date(project.created_at).toLocaleDateString()}
            size="small"
            variant="outlined"
          />
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
