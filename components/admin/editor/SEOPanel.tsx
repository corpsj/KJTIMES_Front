"use client";

import {
    Paper,
    Stack,
    TextInput,
    Textarea,
    Text,
    Box,
    Group,
    Button,
    Collapse,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconSeo, IconChevronDown, IconChevronUp } from "@tabler/icons-react";

interface SEOPanelProps {
    seoTitle: string;
    onSeoTitleChange: (value: string) => void;
    seoDescription: string;
    onSeoDescriptionChange: (value: string) => void;
    keywords: string;
    onKeywordsChange: (value: string) => void;
    onAutoFill: () => void;
    markDirty: () => void;
}

export default function SEOPanel({
    seoTitle,
    onSeoTitleChange,
    seoDescription,
    onSeoDescriptionChange,
    keywords,
    onKeywordsChange,
    onAutoFill,
    markDirty,
}: SEOPanelProps) {
    const [seoOpened, { toggle: toggleSeo }] = useDisclosure(false);

    return (
        <Paper withBorder radius="md">
            <Box
                bg="gray.1"
                p="sm"
                style={{ borderBottom: "1px solid var(--mantine-color-gray-3)", cursor: "pointer" }}
                onClick={toggleSeo}
            >
                <Group justify="space-between">
                    <Group gap="xs">
                        <IconSeo size={16} />
                        <Text size="sm" fw={600}>
                            SEO
                        </Text>
                    </Group>
                    {seoOpened ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                </Group>
            </Box>
            <Collapse in={seoOpened}>
                <Stack p="md" gap="md">
                    <TextInput
                        label="SEO 제목"
                        value={seoTitle}
                        onChange={(e) => {
                            onSeoTitleChange(e.currentTarget.value);
                            markDirty();
                        }}
                    />
                    <Textarea
                        label="메타 설명"
                        minRows={3}
                        value={seoDescription}
                        onChange={(e) => {
                            onSeoDescriptionChange(e.currentTarget.value);
                            markDirty();
                        }}
                        autosize
                    />
                    <TextInput
                        label="키워드"
                        value={keywords}
                        onChange={(e) => {
                            onKeywordsChange(e.currentTarget.value);
                            markDirty();
                        }}
                    />
                    <Button variant="light" color="gray" onClick={onAutoFill}>
                        자동 채우기
                    </Button>
                </Stack>
            </Collapse>
        </Paper>
    );
}
