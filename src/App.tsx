import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, BoxBackgroundColor } from '@metamask/design-system-react';
import Todos from './pages/Todos';
import { Standup } from './pages/Standup';

function App() {
  return (
    <Box
      backgroundColor={BoxBackgroundColor.BackgroundDefault}
      className="min-h-screen w-full"
    >
      <Routes>
        <Route path="/" element={<Todos />} />
        <Route path="/:date" element={<Standup />} />
      </Routes>
    </Box>
  );
}

export default App;