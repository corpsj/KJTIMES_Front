"use client";

import { Container, Group, Burger, Image, Drawer, Stack, Anchor, Divider, ScrollArea, Box, TextInput, Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import { LINKS } from "@/constants/navigation";

export function MobileHeader() {
    const [opened, { toggle }] = useDisclosure(false);

    return (
        <>
            <Container size="md" py="xs" style={{ borderBottom: '1px solid #eee' }}>
                <Group justify="space-between">
                    <Burger opened={opened} onClick={toggle} size="sm" />
                    <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <Image
                            src="/brand/KJ_sloganLogo.png"
                            style={{ height: '35px', width: 'auto', display: 'block' }}
                            alt="광전타임즈"
                        />
                    </Link>
                    <Anchor component={Link} href="/admin/login" size="xs" c="dimmed" underline="never">
                        로그인
                    </Anchor>
                </Group>
            </Container>

            {/* Mobile Scroll Nav */}
            <ScrollArea w="100%" scrollbars="x" type="never" style={{ borderBottom: '1px solid #eee' }}>
                <Group gap="lg" px="md" h={45} wrap="nowrap" style={{ whiteSpace: 'nowrap' }}>
                    {LINKS.map((link) => (
                        <Anchor
                            key={link.label}
                            component={Link}
                            href={link.href}
                            c="dark.9"
                            fw={700}
                            size="sm"
                            underline="never"
                        >
                            {link.label}
                        </Anchor>
                    ))}
                </Group>
            </ScrollArea>

            <Drawer opened={opened} onClose={toggle} title="메뉴" padding="md" size="75%">
                <Box component="form" action="/search" method="get">
                    <Group gap="xs" wrap="nowrap">
                        <TextInput
                            name="q"
                            placeholder="검색"
                            size="sm"
                            aria-label="검색어"
                            style={{ flex: 1 }}
                        />
                        <Button type="submit" size="sm" variant="light">
                            검색
                        </Button>
                    </Group>
                </Box>
                <Stack gap="md">
                    {LINKS.map((link) => (
                        <Anchor
                            key={link.label}
                            component={Link}
                            href={link.href}
                            c="dark.9"
                            fw={700}
                            underline="never"
                            onClick={toggle}
                            size="lg"
                        >
                            {link.label}
                        </Anchor>
                    ))}
                    <Divider my="sm" />
                    <Anchor component={Link} href="/subscribe" size="md" c="blue" fw={700} underline="never">
                        구독신청
                    </Anchor>
                </Stack>
            </Drawer>
        </>
    );
}
