import React from 'react';
import { Tabs, Tab } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import VideoIcon from '@mui/icons-material/VideoLibrary';
import MusicIcon from '@mui/icons-material/MusicNote';
import BookIcon from '@mui/icons-material/Book';
import ArticleIcon from '@mui/icons-material/Article';

interface SearchTabsProps {
  value: string;
  onChange: (event: React.SyntheticEvent, newValue: string) => void;
}

const SearchTabs: React.FC<SearchTabsProps> = ({ value, onChange }) => (
  <Tabs
    value={value}
    onChange={onChange}
    variant="fullWidth"
    textColor="primary"
    indicatorColor="primary"
    sx={{ marginBottom: 24 }}
  >
    <Tab value="podcasts" label="Podcasts" icon={<MicIcon />} iconPosition="start" />
    <Tab value="videos" label="Videos" icon={<VideoIcon />} iconPosition="start" />
    <Tab value="music" label="Music" icon={<MusicIcon />} iconPosition="start" />
    <Tab value="books" label="Books" icon={<BookIcon />} iconPosition="start" />
    <Tab value="news" label="News" icon={<ArticleIcon />} iconPosition="start" />
  </Tabs>
);

export default SearchTabs;
