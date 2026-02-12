"use client";

import { Stack, TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import AdminHeader from "@/components/admin/AdminHeader";
import MediaUploadZone from "@/components/admin/media/MediaUploadZone";
import MediaGrid from "@/components/admin/media/MediaGrid";
import MediaLightbox from "@/components/admin/media/MediaLightbox";
import { useMediaLibrary } from "@/hooks/useMediaLibrary";

export default function AdminMedia() {
  const m = useMediaLibrary();

  return (
    <Stack gap="lg">
      <AdminHeader
        title="미디어 라이브러리"
        subtitle={`총 ${m.mediaItems.length}개의 파일`}
      />

      {/* Upload Dropzone */}
      <MediaUploadZone
        uploading={m.uploading}
        uploadingFiles={m.uploadingFiles}
        onDrop={(files) => void m.uploadMultipleFiles(files)}
      />

      {/* Search */}
      <TextInput
        placeholder="파일명 검색..."
        leftSection={<IconSearch size={16} />}
        value={m.searchTerm}
        onChange={(e) => m.handleSearchChange(e.currentTarget.value)}
        onKeyDown={m.handleSearchKeyDown}
      />

      {/* Media Grid */}
      <MediaGrid
        mediaItems={m.mediaItems}
        loading={m.loading}
        hoveredId={m.hoveredId}
        actionId={m.actionId}
        onHover={m.setHoveredId}
        onPreview={m.openPreview}
        onCopyUrl={m.copyUrl}
        onDelete={m.deleteMedia}
      />

      {/* Lightbox Modal */}
      <MediaLightbox
        opened={m.lightboxOpened}
        item={m.lightboxItem}
        actionId={m.actionId}
        onClose={m.closeLightbox}
        onCopyUrl={m.copyUrl}
        onDelete={m.deleteMedia}
      />
    </Stack>
  );
}
