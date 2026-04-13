import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import {
  Flag,
  CalendarToday,
  Person,
} from "@mui/icons-material";
import type { Task } from "../../types";

const priorityColors: Record<string, "error" | "warning" | "success"> = {
  high: "error",
  medium: "warning",
  low: "success",
};

interface Props {
  task: Task;
  onClick?: () => void;
  /** Display name for assignee when task.assignee_id is set */
  assigneeName?: string;
}

export default function TaskCard({
  task,
  onClick,
  assigneeName,
}: Props) {
  return (
    <Card
      onClick={onClick}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      sx={{
        mb: 1,
        boxShadow: 1,
        transition: "box-shadow 0.2s",
        cursor: onClick ? "pointer" : "default",
        "&:hover": { boxShadow: 3 },
      }}
    >
      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          {task.title}
        </Typography>
        {task.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              fontSize: "0.75rem",
            }}
          >
            {task.description}
          </Typography>
        )}
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
          <Chip
            icon={<Flag fontSize="small" />}
            label={task.priority}
            size="small"
            color={priorityColors[task.priority] || "default"}
            variant="outlined"
            sx={{ height: 22, fontSize: "0.7rem" }}
          />
          {task.due_date && (
            <Chip
              icon={<CalendarToday fontSize="small" />}
              label={task.due_date}
              size="small"
              variant="outlined"
              sx={{ height: 22, fontSize: "0.7rem" }}
            />
          )}
          {task.assignee_id && (
            <Chip
              icon={<Person fontSize="small" />}
              label={assigneeName || "Assigned"}
              size="small"
              variant="outlined"
              sx={{ height: 22, fontSize: "0.7rem" }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
