
'use client';

import { useEffect } from 'react';

const LocalNewsPage = () => {
  useEffect(() => {
    window.location.href = '/local-news/view';
  }, []);

  return null;
};

export default LocalNewsPage;
