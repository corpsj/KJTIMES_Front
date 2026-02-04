"use client";

import { useEffect, useState } from "react";
import { Title, SimpleGrid, Paper, Image, Text, Group, LoadingOverlay, TextInput, Card, AspectRatio } from "@mantine/core";
import { createClient } from "@/utils/supabase/client";
import { IconSearch, IconPhoto } from "@tabler/icons-react";

export default function AdminMedia() {
    const [mediaItems, setMediaItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const supabase = createClient();

    useEffect(() => {
        fetchMedia();
    }, []);

    const fetchMedia = async () => {
        setLoading(true);
        let query = supabase
            .from('media')
            .select('*')
            .order('created_at', { ascending: false });

        if (searchTerm) {
            query = query.ilike('filename', `%${searchTerm}%`);
        }

        const { data, error } = await query;

        if (data) {
            setMediaItems(data);
        }
        setLoading(false);
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            fetchMedia();
        }
    };

    return (
        <>
            <Group justify="space-between" mb="lg">
                <Title order={2}>미디어 라이브러리</Title>
            </Group>

            <Paper p="md" radius="md" withBorder mb="lg">
                <TextInput
                    placeholder="파일명 검색..."
                    leftSection={<IconSearch size="1rem" />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.currentTarget.value)}
                    onKeyDown={handleSearchKeyDown}
                />
            </Paper>

            <div style={{ position: 'relative', minHeight: 200 }}>
                <LoadingOverlay visible={loading} />

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
                            </Card>
                        ))}
                    </SimpleGrid>
                )}
            </div>
        </>
    );
}
