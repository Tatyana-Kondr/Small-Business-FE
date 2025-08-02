// src/theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#00acc1', // цвет кнопки по умолчанию
      contrastText: '#ffffff', // текст на кнопке
    },
    secondary: {
      main: '#00838f', // для variant="secondary"
    },
    
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '0.6em 1.2em',
          fontWeight: 500,
          textTransform: 'none', // чтобы не было ALL CAPS
        },
        
      },
    },
  },
});

export default theme;
