"use client";

import {
  ActionIcon,
  AspectRatio,
  Card,
  Image,
  Loader,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import { IconCopy, IconPhoto, IconTrash } from "@tabler/icons-react";
import EmptyState from "@/components/admin/EmptyState";
import type { MediaItem } from "@/hooks/useMediaLibrary";

interface MediaGridProps {
  mediaItems: MediaItem[];
  loading: boolean;
  hoveredId: string | null;
  actionId: string | null;
  onHover: (id: string | null) => void;
  onPreview: (item: MediaItem) => void;
  onCopyUrl: (url: string) => void;
  onDelete: (item: MediaItem) => void;
}

export default function MediaGrid({
  mediaItems,
  loading,
  hoveredId,
  actionId,
  onHover,
  onPreview,
  onCopyUrl,
  onDelete,
}: MediaGridProps) {
  if (loading) {
    return (
      <Stack align="center" py={60}>
        <Loader size="md" />
        <Text size="sm" c="dimmed">
          불러오는 중...
        </Text>
      </Stack>
    );
  }

  if (mediaItems.length === 0) {
    return (
      <EmptyState
        icon={<IconPhoto size={48} />}
        title="등록된 미디어가 없습니다"
        description="이미지를 업로드하여 미디어 라이브러리를 시작하세요."
      />
    );
  }

  return (
    <SimpleGrid
      cols={{ base: 2, xs: 3, md: 4, lg: 5 }}
      spacing="md"
    >
      {mediaItems.map((item) => (
        <Card
          key={item.id}
          p={0}
          radius="md"
          withBorder
          style={{ overflow: "hidden", cursor: "pointer" }}
          onMouseEnter={() => onHover(item.id)}
          onMouseLeave={() => onHover(null)}
          onClick={() => onPreview(item)}
        >
          <div style={{ position: "relative" }}>
            <AspectRatio ratio={4 / 3}>
              <Image
                src={item.url}
                alt={item.alt_text || item.filename}
                fallbackSrc="https://placehold.co/600x400?text=No+Image"
              />
            </AspectRatio>
            {hoveredId === item.id && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <ActionIcon
                  variant="white"
                  size="lg"
                  radius="xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    void onCopyUrl(item.url);
                  }}
                  title="URL 복사"
                >
                  <IconCopy size={18} />
                </ActionIcon>
                <ActionIcon
                  variant="white"
                  color="red"
                  size="lg"
                  radius="xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    void onDelete(item);
                  }}
                  disabled={actionId === item.id}
                  title="삭제"
                >
                  <IconTrash size={18} />
                </ActionIcon>
              </div>
            )}
          </div>
          <Stack gap={2} p="xs">
            <Text size="xs" fw={500} truncate>
              {item.filename}
            </Text>
            <Text size="xs" c="dimmed">
              {new Date(item.created_at).toLocaleDateString("ko-KR")}
            </Text>
          </Stack>
        </Card>
      ))}
    </SimpleGrid>
  );
}
