import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#33ab9f',
    },
    secondary: {
      main: '#598e89',
    },
    background: {
      // The default paper background (used by Paper, Card, etc.)
      paper: '#80cbc4',
        
      // The default screen background (the canvas of the app)
      default: '#00695f',
    },
    border: {
      // Name your custom color property (e.g., 'main' or 'default')
      main: '#c1e5e2',
      dark: '#00695f',
    },
  },
});

export default theme;