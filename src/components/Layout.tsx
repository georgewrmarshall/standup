import React from 'react';
import { Outlet } from 'react-router-dom';
import {
  Box,
  Text,
  BoxBackgroundColor,
  BoxBorderColor,
  TextVariant,
  TextColor,
} from '@metamask/design-system-react';

const Layout: React.FC = () => {
  return (
    <Box className="min-h-screen w-full">
      {/* Header */}
      {/* Main Content */}
      <Outlet />
    </Box>
  );
};

export default Layout;
