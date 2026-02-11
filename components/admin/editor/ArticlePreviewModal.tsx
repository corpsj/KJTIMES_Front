"use client";

import {
    Modal,
    Stack,
    Badge,
    Title,
    Text,
    Box,
} from "@mantine/core";
import { sanitizeHtml } from "@/utils/sanitize";

interface ArticlePreviewModalProps {
    opened: boolean;
    onClose: () => void;
    title: string;
    subTitle: string;
    content: string;
    categoryLabel: string;
    estimatedReadMinutes: number;
    sharePreviewUrl: string;
}

export default function ArticlePreviewModal({
    opened,
    onClose,
    title,
    subTitle,
    content,
    categoryLabel,
    estimatedReadMinutes,
    sharePreviewUrl,
}: ArticlePreviewModalProps) {
    return (
        <Modal opened={opened} onClose={onClose} size="xl" title="기사 미리보기" centered>
            <Stack gap="md">
                <Badge variant="light">{categoryLabel}</Badge>
                <Title order={2} size="h3">
                    {title || "기사 제목"}
                </Title>
                {subTitle && (
                    <Text c="dimmed" style={{ whiteSpace: "pre-line" }}>{subTitle}</Text>
                )}
                <Text size="sm" c="dimmed">
                    읽기 {estimatedReadMinutes}분 · {sharePreviewUrl}
                </Text>
                <Box
                    style={{ lineHeight: 1.7 }}
                    dangerouslySetInnerHTML={{
                        __html: sanitizeHtml(content || "<p style='color:#6b7280'>미리보기할 본문이 없습니다.</p>"),
                    }}
                />
            </Stack>
        </Modal>
    );
}
