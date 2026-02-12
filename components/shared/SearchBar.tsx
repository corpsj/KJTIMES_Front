"use client";

import { TextInput, Button, Group, Box, ActionIcon } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
    variant?: "desktop" | "mobile" | "drawer";
    size?: "xs" | "sm" | "md";
}

export function SearchBar({ variant = "desktop", size = "xs" }: SearchBarProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    // Mobile icon-only variant (links to search page)
    if (variant === "mobile") {
        return (
            <ActionIcon
                component="a"
                href="/search"
                variant="subtle"
                color="gray"
                size="sm"
                aria-label="검색"
            >
                <IconSearch size={18} />
            </ActionIcon>
        );
    }

    // Drawer variant (full search form in mobile drawer)
    if (variant === "drawer") {
        return (
            <Box component="form" onSubmit={handleSearch}>
                <Group gap="xs" wrap="nowrap">
                    <TextInput
                        type="search"
                        name="q"
                        placeholder="기사 검색..."
                        size={size}
                        aria-label="검색어"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        leftSection={<IconSearch size={16} />}
                        style={{ flex: 1 }}
                        styles={{
                            input: {
                                borderColor: "var(--mantine-color-newsHeadline-2)",
                                "&:focus": { borderColor: "var(--mantine-color-newsAccent-6)" },
                            },
                        }}
                    />
                    <Button type="submit" size={size} variant="filled" color="dark">
                        검색
                    </Button>
                </Group>
            </Box>
        );
    }

    // Desktop variant (default)
    return (
        <Box component="form" onSubmit={handleSearch} style={{ flex: 1, maxWidth: 360 }}>
            <Group gap="xs" wrap="nowrap">
                <TextInput
                    type="search"
                    name="q"
                    placeholder="검색어를 입력하세요"
                    size={size}
                    aria-label="검색어"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ flex: 1 }}
                />
                <Button type="submit" size={size} variant="light">
                    검색
                </Button>
            </Group>
        </Box>
    );
}
