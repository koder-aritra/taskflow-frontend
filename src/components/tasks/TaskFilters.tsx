import { Box, TextField, MenuItem } from "@mui/material";
import type { TaskPriority } from "../../types";

interface Props {
  priority: TaskPriority | "";
  onPriorityChange: (val: TaskPriority | "") => void;
}

export default function TaskFilters({
  priority,
  onPriorityChange,
}: Props) {
  return (
    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
      <TextField
        select
        label="Priority"
        size="small"
        value={priority}
        onChange={(e) =>
          onPriorityChange(e.target.value as TaskPriority | "")
        }
        sx={{ minWidth: 130 }}
      >
        <MenuItem value="">All</MenuItem>
        <MenuItem value="high">High</MenuItem>
        <MenuItem value="medium">Medium</MenuItem>
        <MenuItem value="low">Low</MenuItem>
      </TextField>
    </Box>
  );
}
