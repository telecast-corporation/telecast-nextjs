
'use client';

import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { IconButton, useTheme } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const ThemeToggleButton = () => {
  const theme = useTheme();
  const { mode, toggleTheme } = useContext(ThemeContext);

  return (
    <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit">
      {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );
};

export default ThemeToggleButton;
