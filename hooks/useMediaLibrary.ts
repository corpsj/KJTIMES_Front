"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import { createClient } from "@/utils/supabase/client";

/* ──────────────────────────── Types ──────────────────────────── */

export type MediaItem = {
  id: string;
  filename: string;
  url: string;
  alt_text?: string | null;
  created_at: string;
  file_size?: number | null;
};

export type UploadingFile = {
  name: string;
  progress: number;
  status: "uploading" | "done" | "error";
};

/* ──────────────────────────── Helpers ──────────────────────────── */

export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const extractStoragePath = (url: string) => {
  const marker = "/storage/v1/object/public/news-images/";
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return url.slice(index + marker.length);
};

/* ══════════════════════════════════════════════════════════════ */
/*  Hook                                                         */
/* ══════════════════════════════════════════════════════════════ */

export function useMediaLibrary() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);
  const searchTermRef = useRef("");
  const [supabase] = useState(() => createClient());

  const [lightboxItem, setLightboxItem] = useState<MediaItem | null>(null);
  const [lightboxOpened, { open: openLightbox, close: closeLightbox }] =
    useDisclosure(false);

  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      let query = supabase
        .from("media")
        .select("*")
        .order("created_at", { ascending: false });
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

  /* ──── Upload ──── */

  const uploadSingleFile = async (
    file: File,
    index: number
  ): Promise<void> => {
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

      await Promise.all(
        files.map((file, index) => uploadSingleFile(file, index))
      );

      triggerRefresh();
      setTimeout(() => {
        setUploadingFiles([]);
        setUploading(false);
      }, 1500);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [supabase]
  );

  /* ──── Actions ──── */

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      notifications.show({
        title: "성공",
        message: "URL이 복사되었습니다.",
        color: "green",
      });
    } catch {
      notifications.show({
        title: "오류",
        message: "URL 복사에 실패했습니다.",
        color: "red",
      });
    }
  };

  const deleteMedia = async (item: MediaItem) => {
    const confirmed = window.confirm(
      `"${item.filename}" 파일을 삭제할까요?`
    );
    if (!confirmed) return;

    setActionId(item.id);
    const storagePath = extractStoragePath(item.url);
    if (storagePath) {
      await supabase.storage.from("news-images").remove([storagePath]);
    }
    const { error } = await supabase
      .from("media")
      .delete()
      .eq("id", item.id);
    if (error) {
      notifications.show({
        title: "오류",
        message: "삭제 실패: " + error.message,
        color: "red",
      });
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

  return {
    mediaItems,
    loading,
    uploading,
    actionId,
    searchTerm,
    lightboxItem,
    lightboxOpened,
    closeLightbox,
    uploadingFiles,
    hoveredId,
    setHoveredId,
    handleSearchKeyDown,
    handleSearchChange,
    uploadMultipleFiles,
    copyUrl,
    deleteMedia,
    openPreview,
  };
}
