
'use client';

import { IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggleButton = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <IconButton sx={{ ml: 1 }} onClick={toggleDarkMode} color="inherit">
      {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );
};

export default ThemeToggleButton;
