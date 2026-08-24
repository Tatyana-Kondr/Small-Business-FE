import { createTheme } from "@mui/material/styles";
import { appPalette } from "./palette";
import { appComponents } from "./components";
import { colors } from "../styles/colors";

export const theme = createTheme({
  palette: appPalette,

  shape: {
    borderRadius: 8,
  },

  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',

    h5: {
      fontWeight: 700,
      color: colors.primaryBlue,
    },

    h6: {
      fontWeight: 700,
      color: colors.primaryBlue,
    },

    subtitle1: {
      fontWeight: 600,
    },

    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },

  components: appComponents,
});