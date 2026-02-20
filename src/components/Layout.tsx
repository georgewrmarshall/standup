import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  Box,
  Text,
  Icon,
  IconName,
  IconSize,
  BoxBackgroundColor,
  BoxBorderColor,
  BoxFlexDirection,
  TextVariant,
  TextColor,
  BoxJustifyContent,
  BoxAlignItems,
} from '@metamask/design-system-react';

const Layout: React.FC = () => {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: IconName.Home },
    { path: '/todos', label: 'Todos', icon: IconName.CheckBold },
    { path: '/prs', label: 'Pull Requests', icon: IconName.CodeCircle },
    { path: '/jira', label: 'Jira Board', icon: IconName.Diagram },
    { path: '/standup', label: 'Standup', icon: IconName.MessageQuestion },
  ];

  return (
    <Box flexDirection="row" className="min-h-screen flex w-full">
      {/* Sidebar */}
      <Box
        backgroundColor={BoxBackgroundColor.BackgroundAlternative}
        borderColor={BoxBorderColor.BorderMuted}
        className="w-64 border-r min-h-screen"
      >
        <Box padding={6}>
          <Text variant={TextVariant.HeadingMd} color={TextColor.TextDefault}>
            Standup Assistant
          </Text>
        </Box>

        <Box
          flexDirection={BoxFlexDirection.Column}
          gap={1}
          padding={4}
          className="flex"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? 'active-nav-link' : 'nav-link'
              }
            >
              {({ isActive }) => (
                <Box
                  alignItems={BoxAlignItems.Center}
                  gap={3}
                  padding={3}
                  backgroundColor={
                    isActive
                      ? BoxBackgroundColor.BackgroundAlternative
                      : undefined
                  }
                  className="hover:bg-hover transition-colors flex rounded-md"
                >
                  <Icon
                    name={item.icon}
                    size={IconSize.Sm}
                    color={
                      isActive
                        ? TextColor.TextDefault
                        : TextColor.TextAlternative
                    }
                  />
                  <Text
                    variant={TextVariant.BodyMd}
                    color={
                      isActive
                        ? TextColor.TextDefault
                        : TextColor.TextAlternative
                    }
                  >
                    {item.label}
                  </Text>
                </Box>
              )}
            </NavLink>
          ))}
        </Box>
      </Box>

      {/* Main Content */}
      <Box
        flexDirection={BoxFlexDirection.Column}
        className="flex-1 flex w-full"
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;