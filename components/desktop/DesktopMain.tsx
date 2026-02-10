"use client";

import { Box, Center, Container, Grid, GridCol, Stack, Text, Title } from "@mantine/core";
import { IconNews } from "@tabler/icons-react";
import { MainNews } from "@/components/home/MainNews";
import { Headline } from "@/components/home/Headline";
import { Opinion } from "@/components/home/Opinion";
import { PopularNews } from "@/components/home/PopularNews";

import { Article } from "@/types";

export function DesktopMain({ articles }: { articles: Article[] }) {
    if (!articles || articles.length === 0) {
        return (
            <Container size="xl" py="xl">
                <Center py={80}>
                    <Stack align="center" gap="md">
                        <Box
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: "50%",
                                background: "#f1f5f9",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <IconNews size={36} color="#94a3b8" />
                        </Box>
                        <Title order={3} c="dimmed" ta="center">
                            게시된 기사가 없습니다
                        </Title>
                        <Text size="md" c="dimmed" ta="center" maw={400} style={{ lineHeight: 1.6 }}>
                            아직 발행된 기사가 없습니다. 새로운 소식이 곧 업데이트될 예정입니다.
                        </Text>
                    </Stack>
                </Center>
            </Container>
        );
    }

    const popularArticles = [...articles]
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5);

    return (
        <Container size="xl">
            <Grid gutter={40}>
                {/* LEFT COLUMN: Main News List */}
                <GridCol span={3} order={1}>
                    <MainNews articles={articles.slice(0, 5)} />
                </GridCol>

                {/* CENTER COLUMN: Headline */}
                <GridCol span={6} order={2} style={{ borderLeft: "1px solid #eee", borderRight: "1px solid #eee" }}>
                    <Headline articles={articles.slice(5, 8)} />
                </GridCol>

                {/* RIGHT COLUMN: Opinion & Ad */}
                <GridCol span={3} order={3}>
                    <Stack gap="xl">
                        <Opinion articles={articles} />
                        <PopularNews articles={popularArticles} />
                    </Stack>
                </GridCol>
            </Grid>
        </Container>
    );
}
