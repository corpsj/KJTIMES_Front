"use client";

import { Menu, Button, Avatar } from "@mantine/core";
import { IconUser, IconSettings, IconLogout } from "@tabler/icons-react";

interface AccountMenuProps {
  user: {
    name: string;
    email: string;
  };
}

export function AccountMenu({ user }: AccountMenuProps) {
  const handleLogout = () => {
    alert("로그아웃 기능을 준비 중입니다");
  };

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <Button variant="subtle" leftSection={<Avatar size="sm" radius="xl" />}>
          {user.name}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>{user.email}</Menu.Label>
        <Menu.Item leftSection={<IconUser size={14} />}>
          프로필
        </Menu.Item>
        <Menu.Item leftSection={<IconSettings size={14} />}>
          설정
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          color="red"
          leftSection={<IconLogout size={14} />}
          onClick={handleLogout}
        >
          로그아웃
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
