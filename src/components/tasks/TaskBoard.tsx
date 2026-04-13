import { Box, Typography, Paper, Chip, useTheme, useMediaQuery } from "@mui/material";
import TaskCard from "./TaskCard";
import type { Task, TaskStatus } from "../../types";

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: "todo", label: "Todo", color: "#64748b" },
  { id: "in_progress", label: "In Progress", color: "#3b82f6" },
  { id: "done", label: "Done", color: "#22c55e" },
];

interface Props {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  userNameById?: Record<string, string>;
}

export default function TaskBoard({
  tasks,
  onTaskClick,
  userNameById = {},
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const grouped: Record<TaskStatus, Task[]> = {
    todo: [],
    in_progress: [],
    done: [],
  };

  for (const task of tasks) {
    grouped[task.status]?.push(task);
  }

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        flexDirection: isMobile ? "column" : "row",
        overflowX: isMobile ? "visible" : "auto",
        pb: 2,
      }}
    >
      {COLUMNS.map((col) => (
        <Paper
          key={col.id}
          variant="outlined"
          sx={{
            flex: isMobile ? "none" : 1,
            minWidth: isMobile ? "auto" : 280,
            display: "flex",
            flexDirection: "column",
            maxHeight: isMobile ? "none" : "calc(100vh - 320px)",
          }}
        >
          <Box
            sx={{
              p: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 1,
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: col.color,
              }}
            />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {col.label}
            </Typography>
            <Chip
              label={grouped[col.id].length}
              size="small"
              sx={{ ml: "auto", height: 22, minWidth: 28 }}
            />
          </Box>
          <Box
            sx={{
              p: 1,
              flexGrow: 1,
              overflowY: "auto",
              minHeight: 100,
            }}
          >
            {grouped[col.id].map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick(task)}
                assigneeName={task.assignee_id ? userNameById[task.assignee_id] : undefined}
              />
            ))}
            {grouped[col.id].length === 0 && (
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ py: 4, fontStyle: "italic" }}
              >
                No tasks
              </Typography>
            )}
          </Box>
        </Paper>
      ))}
    </Box>
  );
}
