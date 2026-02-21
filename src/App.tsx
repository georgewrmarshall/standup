import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, BoxBackgroundColor } from '@metamask/design-system-react';
import Layout from './components/Layout';
import Todos from './pages/Todos';

function App() {
  return (
    <Box
      backgroundColor={BoxBackgroundColor.BackgroundDefault}
      className="min-h-screen w-full"
    >
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Todos />} />
        </Route>
      </Routes>
    </Box>
  );
}

export default App;