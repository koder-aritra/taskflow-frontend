import { Box, Typography, Button } from "@mui/material";
import { SentimentDissatisfied } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        textAlign: "center",
      }}
    >
      <SentimentDissatisfied sx={{ fontSize: 80, color: "text.secondary" }} />
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        Page Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary">
        The page you&apos;re looking for doesn&apos;t exist.
      </Typography>
      <Button variant="contained" onClick={() => navigate("/projects")}>
        Go to Projects
      </Button>
    </Box>
  );
}
