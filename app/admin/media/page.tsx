"use client";

import { useEffect, useRef, useState } from "react";
import { Title, SimpleGrid, Paper, Image, Text, Group, LoadingOverlay, TextInput, Card, AspectRatio, FileInput, Button } from "@mantine/core";
import { createClient } from "@/utils/supabase/client";
import { IconSearch, IconPhoto, IconCopy, IconTrash } from "@tabler/icons-react";

export default function AdminMedia() {
    type MediaItem = {
        id: string;
        filename: string;
        url: string;
        alt_text?: string | null;
        created_at: string;
    };

    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [actionId, setActionId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [refreshToken, setRefreshToken] = useState(0);
    const searchTermRef = useRef("");
    const supabase = createClient();

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
        if (e.key === 'Enter') {
            triggerRefresh();
        }
    };

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        searchTermRef.current = value;
    };

    const handleUpload = async (file: File | null) => {
        if (!file) return;

        setUploading(true);
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const filePath = `library/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from("news-images")
            .upload(filePath, file);

        if (uploadError) {
            alert("업로드 실패: " + uploadError.message);
            setUploading(false);
            return;
        }

        const { data } = supabase.storage
            .from("news-images")
            .getPublicUrl(filePath);

        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from("media").insert({
            filename: file.name,
            url: data.publicUrl,
            type: file.type.startsWith("image/") ? "image" : "file",
            file_size: file.size,
            uploaded_by: user?.id,
        });

        triggerRefresh();
        setUploading(false);
    };

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
            triggerRefresh();
        }
        setActionId(null);
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

            <Paper p="md" radius="md" withBorder mb="lg">
                <TextInput
                    placeholder="파일명 검색..."
                    leftSection={<IconSearch size="1rem" />}
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.currentTarget.value)}
                    onKeyDown={handleSearchKeyDown}
                />
            </Paper>

            <div style={{ position: 'relative', minHeight: 200 }}>
                <LoadingOverlay visible={loading || uploading} />

                {mediaItems.length === 0 && !loading ? (
                    <Text ta="center" c="dimmed" py="xl">등록된 미디어가 없습니다.</Text>
                ) : (
                    <SimpleGrid cols={{ base: 2, xs: 3, md: 4, lg: 5 }} spacing="md">
                        {mediaItems.map((item) => (
                            <Card key={item.id} p="xs" radius="md" withBorder>
                                <Card.Section>
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
                                        onClick={() => copyUrl(item.url)}
                                    >
                                        URL 복사
                                    </Button>
                                    <Button
                                        size="xs"
                                        variant="subtle"
                                        color="red"
                                        leftSection={<IconTrash size={12} />}
                                        onClick={() => deleteMedia(item)}
                                        disabled={actionId === item.id}
                                    >
                                        삭제
                                    </Button>
                                </Group>
                            </Card>
                        ))}
                    </SimpleGrid>
                )}
            </div>
        </>
    );
}
