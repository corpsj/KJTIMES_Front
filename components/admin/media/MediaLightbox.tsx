"use client";

import { Button, Group, Image, Modal, Stack, Text } from "@mantine/core";
import { IconCopy, IconTrash } from "@tabler/icons-react";
import type { MediaItem } from "@/hooks/useMediaLibrary";
import { formatFileSize } from "@/hooks/useMediaLibrary";

interface MediaLightboxProps {
  opened: boolean;
  item: MediaItem | null;
  actionId: string | null;
  onClose: () => void;
  onCopyUrl: (url: string) => void;
  onDelete: (item: MediaItem) => void;
}

export default function MediaLightbox({
  opened,
  item,
  actionId,
  onClose,
  onCopyUrl,
  onDelete,
}: MediaLightboxProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      title={item?.filename || "미디어 미리보기"}
      centered
    >
      {item && (
        <Stack gap="md">
          <Image
            src={item.url}
            alt={item.alt_text || item.filename}
            fallbackSrc="https://placehold.co/600x400?text=No+Image"
            radius="md"
            fit="contain"
            mah={500}
          />
          <Group gap="lg">
            <div>
              <Text size="xs" c="dimmed">
                파일명
              </Text>
              <Text size="sm" fw={500}>
                {item.filename}
              </Text>
            </div>
            <div>
              <Text size="xs" c="dimmed">
                업로드 날짜
              </Text>
              <Text size="sm" fw={500}>
                {new Date(item.created_at).toLocaleDateString("ko-KR")}
              </Text>
            </div>
            <div>
              <Text size="xs" c="dimmed">
                파일 크기
              </Text>
              <Text size="sm" fw={500}>
                {formatFileSize(item.file_size)}
              </Text>
            </div>
          </Group>
          <Group gap="xs">
            <Button
              variant="light"
              leftSection={<IconCopy size={14} />}
              onClick={() => void onCopyUrl(item.url)}
            >
              URL 복사
            </Button>
            <Button
              variant="subtle"
              color="red"
              leftSection={<IconTrash size={14} />}
              onClick={() => void onDelete(item)}
              disabled={actionId === item.id}
            >
              삭제
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
