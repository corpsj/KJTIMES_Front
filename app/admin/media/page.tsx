"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Title,
  SimpleGrid,
  Paper,
  Image,
  Text,
  Group,
  LoadingOverlay,
  TextInput,
  Card,
  AspectRatio,
  FileInput,
  Button,
  Modal,
  Stack,
  Progress,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { createClient } from "@/utils/supabase/client";
import { IconSearch, IconPhoto, IconCopy, IconTrash, IconUpload } from "@tabler/icons-react";

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

  // Lightbox state
  const [lightboxItem, setLightboxItem] = useState<MediaItem | null>(null);
  const [lightboxOpened, { open: openLightbox, close: closeLightbox }] = useDisclosure(false);

  // Drag & drop state
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      let query = supabase
        .from("media")
        .select("*")
        .order("created_at", { ascending: false });

      const term = searchTermRef.current.trim();
      if (term) {
        query = query.ilike("filename", `%${term}%`);
      }

      const { data } = await query;

      if (data) {
        setMediaItems(data as MediaItem[]);
      }
      setLoading(false);
    };

    fetchMedia();
  }, [refreshToken, supabase]);

  const triggerRefresh = () => {
    setRefreshToken((prev) => prev + 1);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      triggerRefresh();
    }
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

    const { error: uploadError } = await supabase.storage
      .from("news-images")
      .upload(filePath, file);

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
      // Clear progress after a short delay
      setTimeout(() => {
        setUploadingFiles([]);
        setUploading(false);
      }, 1500);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [supabase]
  );

  const handleUpload = async (file: File | null) => {
    if (!file) return;
    await uploadMultipleFiles([file]);
  };

  // Drag & Drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
      );

      if (droppedFiles.length > 0) {
        void uploadMultipleFiles(droppedFiles);
      }
    },
    [uploadMultipleFiles]
  );

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      alert("URL이 복사되었습니다.");
    } catch (error) {
      console.error("Failed to copy URL", error);
      alert("URL 복사에 실패했습니다.");
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
      alert("삭제 실패: " + error.message);
    } else {
      // Close lightbox if the deleted item was being previewed
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
    <>
      <Group justify="space-between" mb="lg">
        <Title order={2}>미디어 라이브러리</Title>
        <FileInput
          placeholder="이미지 업로드"
          accept="image/*"
          leftSection={<IconPhoto size="1rem" />}
          onChange={handleUpload}
          disabled={uploading}
        />
      </Group>

      {/* Drag & Drop Zone */}
      <Paper
        ref={dropZoneRef}
        p="xl"
        radius="md"
        mb="lg"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: isDragging ? "2px dashed #0f4c81" : "2px dashed #d1d5db",
          background: isDragging ? "rgba(15, 76, 129, 0.04)" : "rgba(248, 250, 252, 0.8)",
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.multiple = true;
          input.onchange = () => {
            if (input.files) {
              const files = Array.from(input.files);
              void uploadMultipleFiles(files);
            }
          };
          input.click();
        }}
      >
        <Stack align="center" gap="xs">
          <IconUpload size={40} color={isDragging ? "#0f4c81" : "#9ca3af"} />
          <Text size="md" fw={600} c={isDragging ? "blue" : "dimmed"}>
            이미지를 드래그하여 업로드
          </Text>
          <Text size="xs" c="dimmed">
            또는 클릭하여 파일 선택 (여러 파일 가능)
          </Text>
        </Stack>
      </Paper>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <Paper p="md" radius="md" withBorder mb="lg">
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

      <Paper p="md" radius="md" withBorder mb="lg">
        <TextInput
          placeholder="파일명 검색..."
          aria-label="미디어 파일 검색"
          leftSection={<IconSearch size="1rem" />}
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.currentTarget.value)}
          onKeyDown={handleSearchKeyDown}
        />
      </Paper>

      <div style={{ position: "relative", minHeight: 200 }}>
        <LoadingOverlay visible={loading} />

        {mediaItems.length === 0 && !loading ? (
          <Text ta="center" c="dimmed" py="xl">
            등록된 미디어가 없습니다.
          </Text>
        ) : (
          <SimpleGrid cols={{ base: 2, xs: 3, md: 4, lg: 5 }} spacing="md">
            {mediaItems.map((item) => (
              <Card key={item.id} p="xs" radius="md" withBorder>
                <Card.Section
                  style={{ cursor: "pointer" }}
                  onClick={() => openPreview(item)}
                >
                  <AspectRatio ratio={16 / 9}>
                    <Image
                      src={item.url}
                      alt={item.alt_text || item.filename}
                      fallbackSrc="https://placehold.co/600x400?text=No+Image"
                    />
                  </AspectRatio>
                </Card.Section>

                <Text size="xs" mt="xs" fw={500} truncate>
                  {item.filename}
                </Text>
                <Text size="xs" c="dimmed">
                  {new Date(item.created_at).toLocaleDateString()}
                </Text>
                <Group gap="xs" mt="xs">
                  <Button
                    size="xs"
                    variant="light"
                    leftSection={<IconCopy size={12} />}
                    onClick={() => void copyUrl(item.url)}
                    aria-label={`${item.filename} URL 복사`}
                  >
                    URL 복사
                  </Button>
                  <Button
                    size="xs"
                    variant="subtle"
                    color="red"
                    leftSection={<IconTrash size={12} />}
                    onClick={() => void deleteMedia(item)}
                    disabled={actionId === item.id}
                    aria-label={`${item.filename} 삭제`}
                  >
                    삭제
                  </Button>
                </Group>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </div>

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
            <Stack gap="xs">
              <Group gap="lg">
                <div>
                  <Text size="xs" c="dimmed">파일명</Text>
                  <Text size="sm" fw={500}>{lightboxItem.filename}</Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed">업로드 날짜</Text>
                  <Text size="sm" fw={500}>{new Date(lightboxItem.created_at).toLocaleDateString("ko-KR")}</Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed">파일 크기</Text>
                  <Text size="sm" fw={500}>{formatFileSize(lightboxItem.file_size)}</Text>
                </div>
              </Group>
              <Group gap="xs" mt="sm">
                <Button
                  variant="light"
                  leftSection={<IconCopy size={14} />}
                  onClick={() => copyUrl(lightboxItem.url)}
                >
                  URL 복사
                </Button>
                <Button
                  variant="subtle"
                  color="red"
                  leftSection={<IconTrash size={14} />}
                  onClick={() => deleteMedia(lightboxItem)}
                  disabled={actionId === lightboxItem.id}
                >
                  삭제
                </Button>
              </Group>
            </Stack>
          </Stack>
        )}
      </Modal>
    </>
  );
}
