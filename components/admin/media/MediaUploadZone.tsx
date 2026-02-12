"use client";

import { Group, Paper, Progress, Stack, Text } from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { IconUpload, IconX } from "@tabler/icons-react";
import type { UploadingFile } from "@/hooks/useMediaLibrary";

interface MediaUploadZoneProps {
  uploading: boolean;
  uploadingFiles: UploadingFile[];
  onDrop: (files: File[]) => void;
}

export default function MediaUploadZone({
  uploading,
  uploadingFiles,
  onDrop,
}: MediaUploadZoneProps) {
  return (
    <>
      <Dropzone
        onDrop={onDrop}
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
                  <Text
                    size="xs"
                    c={
                      uf.status === "error"
                        ? "red"
                        : uf.status === "done"
                          ? "green"
                          : "dimmed"
                    }
                  >
                    {uf.status === "error"
                      ? "실패"
                      : uf.status === "done"
                        ? "완료"
                        : "업로드 중..."}
                  </Text>
                </Group>
                <Progress
                  value={uf.progress}
                  color={
                    uf.status === "error"
                      ? "red"
                      : uf.status === "done"
                        ? "green"
                        : "blue"
                  }
                  size="sm"
                />
              </div>
            ))}
          </Stack>
        </Paper>
      )}
    </>
  );
}
