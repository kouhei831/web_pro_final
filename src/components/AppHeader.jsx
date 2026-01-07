import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

export default function AppHeader() {
  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography variant="h6" component="h1">
          GeoMedia Diary
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
