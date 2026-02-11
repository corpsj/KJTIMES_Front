"use client";

import { useState } from "react";
import {
    Paper,
    Stack,
    Text,
    Box,
    Group,
    Button,
    Modal,
    SimpleGrid,
    Image as MantineImage,
    FileButton,
} from "@mantine/core";
import {
    IconPhoto,
    IconTrash,
    IconArticle,
    IconUpload,
} from "@tabler/icons-react";

interface ThumbnailPickerProps {
    thumbnailUrl: string | null;
    onThumbnailChange: (url: string | null) => void;
    contentImageUrls: string[];
    onFileUpload: (file: File | null) => void;
    markDirty: () => void;
}

export default function ThumbnailPicker({
    thumbnailUrl,
    onThumbnailChange,
    contentImageUrls,
    onFileUpload,
    markDirty,
}: ThumbnailPickerProps) {
    const [pickerOpen, setPickerOpen] = useState(false);

    return (
        <>
            <Paper withBorder radius="md">
                <Box bg="gray.1" p="sm" style={{ borderBottom: "1px solid var(--mantine-color-gray-3)" }}>
                    <Group gap="xs">
                        <IconPhoto size={16} />
                        <Text size="sm" fw={600}>
                            대표 이미지
                        </Text>
                    </Group>
                </Box>
                <Stack p="md" gap="sm">
                    {thumbnailUrl ? (
                        <Box style={{ borderRadius: 6, overflow: "hidden", border: "1px solid var(--mantine-color-gray-3)" }}>
                            <MantineImage
                                src={thumbnailUrl}
                                alt="대표 이미지"
                                h={160}
                                fit="cover"
                                radius="sm"
                            />
                        </Box>
                    ) : (
                        <Box
                            py="xl"
                            style={{
                                border: "2px dashed var(--mantine-color-gray-3)",
                                borderRadius: 6,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Text size="sm" c="dimmed">
                                대표 이미지 없음
                            </Text>
                        </Box>
                    )}

                    <Group grow>
                        <Button
                            variant="light"
                            color="gray"
                            size="xs"
                            leftSection={<IconArticle size={14} />}
                            disabled={contentImageUrls.length === 0}
                            onClick={() => setPickerOpen(true)}
                        >
                            본문에서 선택
                        </Button>
                        <FileButton
                            onChange={onFileUpload}
                            accept="image/*"
                        >
                            {(props) => (
                                <Button
                                    variant="light"
                                    color="gray"
                                    size="xs"
                                    leftSection={<IconUpload size={14} />}
                                    {...props}
                                >
                                    직접 업로드
                                </Button>
                            )}
                        </FileButton>
                    </Group>
                    {thumbnailUrl && (
                        <Button
                            variant="subtle"
                            color="red"
                            size="xs"
                            leftSection={<IconTrash size={14} />}
                            onClick={() => {
                                onThumbnailChange(null);
                                markDirty();
                            }}
                        >
                            제거
                        </Button>
                    )}
                </Stack>
            </Paper>

            {/* Thumbnail picker modal */}
            <Modal
                opened={pickerOpen}
                onClose={() => setPickerOpen(false)}
                title="본문 이미지에서 대표 이미지 선택"
                centered
            >
                {contentImageUrls.length > 0 ? (
                    <SimpleGrid cols={3} spacing="xs">
                        {contentImageUrls.map((url, idx) => (
                            <Box
                                key={`${url}-${idx}`}
                                style={{
                                    cursor: "pointer",
                                    borderRadius: 6,
                                    overflow: "hidden",
                                    border: thumbnailUrl === url
                                        ? "2px solid var(--mantine-color-blue-6)"
                                        : "2px solid transparent",
                                    transition: "border-color 0.15s",
                                }}
                                onClick={() => {
                                    onThumbnailChange(url);
                                    markDirty();
                                    setPickerOpen(false);
                                }}
                            >
                                <MantineImage
                                    src={url}
                                    alt={`본문 이미지 ${idx + 1}`}
                                    h={100}
                                    fit="cover"
                                />
                            </Box>
                        ))}
                    </SimpleGrid>
                ) : (
                    <Text c="dimmed" ta="center" py="lg">
                        본문에 이미지가 없습니다.
                    </Text>
                )}
            </Modal>
        </>
    );
}
