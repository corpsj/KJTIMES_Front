"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActionIcon,
  AspectRatio,
  Button,
  Card,
  Group,
  Image,
  Loader,
  Modal,
  Paper,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useDisclosure } from "@mantine/hooks";
import { createClient } from "@/utils/supabase/client";
import {
  IconCopy,
  IconPhoto,
  IconSearch,
  IconTrash,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import AdminHeader from "@/components/admin/AdminHeader";
import EmptyState from "@/components/admin/EmptyState";

type MediaItem = {
  id: string;
  filename: string;
  url: string;
  alt_text?: string | null;
  created_at: string;
  file_size?: number | null;
};

type UploadingFile = {
  name: string;
  progress: number;
  status: "uploading" | "done" | "error";
};

function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminMedia() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);
  const searchTermRef = useRef("");
  const [supabase] = useState(() => createClient());

  const [lightboxItem, setLightboxItem] = useState<MediaItem | null>(null);
  const [lightboxOpened, { open: openLightbox, close: closeLightbox }] = useDisclosure(false);

  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      let query = supabase.from("media").select("*").order("created_at", { ascending: false });
      const term = searchTermRef.current.trim();
      if (term) query = query.ilike("filename", `%${term}%`);
      const { data } = await query;
      if (data) setMediaItems(data as MediaItem[]);
      setLoading(false);
    };
    fetchMedia();
  }, [refreshToken, supabase]);

  const triggerRefresh = () => setRefreshToken((p) => p + 1);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") triggerRefresh();
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    searchTermRef.current = value;
  };

  const uploadSingleFile = async (file: File, index: number): Promise<void> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `library/${fileName}`;

    setUploadingFiles((prev) => {
      const updated = [...prev];
      updated[index] = { name: file.name, progress: 30, status: "uploading" };
      return updated;
    });

    const { error: uploadError } = await supabase.storage.from("news-images").upload(filePath, file);

    if (uploadError) {
      setUploadingFiles((prev) => {
        const updated = [...prev];
        updated[index] = { name: file.name, progress: 100, status: "error" };
        return updated;
      });
      return;
    }

    setUploadingFiles((prev) => {
      const updated = [...prev];
      updated[index] = { name: file.name, progress: 70, status: "uploading" };
      return updated;
    });

    const { data } = supabase.storage.from("news-images").getPublicUrl(filePath);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("media").insert({
      filename: file.name,
      url: data.publicUrl,
      type: file.type.startsWith("image/") ? "image" : "file",
      file_size: file.size,
      uploaded_by: user?.id,
    });

    setUploadingFiles((prev) => {
      const updated = [...prev];
      updated[index] = { name: file.name, progress: 100, status: "done" };
      return updated;
    });
  };

  const uploadMultipleFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      setUploading(true);

      const initial: UploadingFile[] = files.map((f) => ({
        name: f.name,
        progress: 0,
        status: "uploading" as const,
      }));
      setUploadingFiles(initial);

      await Promise.all(files.map((file, index) => uploadSingleFile(file, index)));

      triggerRefresh();
      setTimeout(() => {
        setUploadingFiles([]);
        setUploading(false);
      }, 1500);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [supabase]
  );

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      notifications.show({ title: "성공", message: "URL이 복사되었습니다.", color: "green" });
    } catch {
      notifications.show({ title: "오류", message: "URL 복사에 실패했습니다.", color: "red" });
    }
  };

  const extractStoragePath = (url: string) => {
    const marker = "/storage/v1/object/public/news-images/";
    const index = url.indexOf(marker);
    if (index === -1) return null;
    return url.slice(index + marker.length);
  };

  const deleteMedia = async (item: MediaItem) => {
    const confirmed = window.confirm(`"${item.filename}" 파일을 삭제할까요?`);
    if (!confirmed) return;

    setActionId(item.id);
    const storagePath = extractStoragePath(item.url);
    if (storagePath) {
      await supabase.storage.from("news-images").remove([storagePath]);
    }
    const { error } = await supabase.from("media").delete().eq("id", item.id);
    if (error) {
      notifications.show({ title: "오류", message: "삭제 실패: " + error.message, color: "red" });
    } else {
      if (lightboxItem?.id === item.id) {
        closeLightbox();
        setLightboxItem(null);
      }
      triggerRefresh();
    }
    setActionId(null);
  };

  const openPreview = (item: MediaItem) => {
    setLightboxItem(item);
    openLightbox();
  };

  return (
    <Stack gap="lg">
      <AdminHeader title="미디어 라이브러리" subtitle={`총 ${mediaItems.length}개의 파일`} />

      {/* Upload Dropzone */}
      <Dropzone
        onDrop={(files) => void uploadMultipleFiles(files)}
        accept={IMAGE_MIME_TYPE}
        loading={uploading}
        multiple
        p="xl"
        radius="md"
        style={{
          border: "2px dashed #d1d5db",
          backgroundColor: "rgba(248, 250, 252, 0.8)",
          cursor: "pointer",
        }}
      >
        <Stack align="center" gap="xs" py="md">
          <Dropzone.Accept>
            <IconUpload size={40} color="#228be6" />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX size={40} color="#fa5252" />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconUpload size={40} color="#9ca3af" />
          </Dropzone.Idle>
          <Text size="md" fw={600} c="dimmed">
            이미지를 끌어다 놓거나 클릭하여 업로드
          </Text>
          <Text size="xs" c="dimmed">
            여러 파일 동시 업로드 가능
          </Text>
        </Stack>
      </Dropzone>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <Paper p="md" radius="md" withBorder>
          <Text size="sm" fw={600} mb="xs">
            업로드 진행 중...
          </Text>
          <Stack gap="xs">
            {uploadingFiles.map((uf, idx) => (
              <div key={idx}>
                <Group justify="space-between" mb={4}>
                  <Text size="xs" truncate style={{ maxWidth: 300 }}>
                    {uf.name}
                  </Text>
                  <Text size="xs" c={uf.status === "error" ? "red" : uf.status === "done" ? "green" : "dimmed"}>
                    {uf.status === "error" ? "실패" : uf.status === "done" ? "완료" : "업로드 중..."}
                  </Text>
                </Group>
                <Progress
                  value={uf.progress}
                  color={uf.status === "error" ? "red" : uf.status === "done" ? "green" : "blue"}
                  size="sm"
                />
              </div>
            ))}
          </Stack>
        </Paper>
      )}

      {/* Search */}
      <TextInput
        placeholder="파일명 검색..."
        leftSection={<IconSearch size={16} />}
        value={searchTerm}
        onChange={(e) => handleSearchChange(e.currentTarget.value)}
        onKeyDown={handleSearchKeyDown}
      />

      {/* Media Grid */}
      {loading ? (
        <Stack align="center" py={60}>
          <Loader size="md" />
          <Text size="sm" c="dimmed">
            불러오는 중...
          </Text>
        </Stack>
      ) : mediaItems.length === 0 ? (
        <EmptyState
          icon={<IconPhoto size={48} />}
          title="등록된 미디어가 없습니다"
          description="이미지를 업로드하여 미디어 라이브러리를 시작하세요."
        />
      ) : (
        <SimpleGrid cols={{ base: 2, xs: 3, md: 4, lg: 5 }} spacing="md">
          {mediaItems.map((item) => (
            <Card
              key={item.id}
              p={0}
              radius="md"
              withBorder
              style={{ overflow: "hidden", cursor: "pointer" }}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => openPreview(item)}
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
                        void copyUrl(item.url);
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
                        void deleteMedia(item);
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
      )}

      {/* Lightbox Modal */}
      <Modal
        opened={lightboxOpened}
        onClose={closeLightbox}
        size="xl"
        title={lightboxItem?.filename || "미디어 미리보기"}
        centered
      >
        {lightboxItem && (
          <Stack gap="md">
            <Image
              src={lightboxItem.url}
              alt={lightboxItem.alt_text || lightboxItem.filename}
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
                  {lightboxItem.filename}
                </Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">
                  업로드 날짜
                </Text>
                <Text size="sm" fw={500}>
                  {new Date(lightboxItem.created_at).toLocaleDateString("ko-KR")}
                </Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">
                  파일 크기
                </Text>
                <Text size="sm" fw={500}>
                  {formatFileSize(lightboxItem.file_size)}
                </Text>
              </div>
            </Group>
            <Group gap="xs">
              <Button variant="light" leftSection={<IconCopy size={14} />} onClick={() => void copyUrl(lightboxItem.url)}>
                URL 복사
              </Button>
              <Button
                variant="subtle"
                color="red"
                leftSection={<IconTrash size={14} />}
                onClick={() => void deleteMedia(lightboxItem)}
                disabled={actionId === lightboxItem.id}
              >
                삭제
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}
