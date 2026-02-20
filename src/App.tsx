import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, BoxBackgroundColor } from '@metamask/design-system-react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Todos from './pages/Todos';
import PRStatus from './pages/PRStatus';
import JiraBoard from './pages/JiraBoard';
import StandupGenerator from './pages/StandupGenerator';

function App() {
  return (
    <Box
      backgroundColor={BoxBackgroundColor.BackgroundDefault}
      className="min-h-screen w-full"
    >
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="todos" element={<Todos />} />
          <Route path="prs" element={<PRStatus />} />
          <Route path="jira" element={<JiraBoard />} />
          <Route path="standup" element={<StandupGenerator />} />
        </Route>
      </Routes>
    </Box>
  );
}

export default App;