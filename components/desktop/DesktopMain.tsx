"use client";

import { Container, Grid, GridCol, Stack } from "@mantine/core";
import { MainNews } from "@/components/home/MainNews";
import { Headline } from "@/components/home/Headline";
import { Opinion } from "@/components/home/Opinion";
import { PopularNews } from "@/components/home/PopularNews";

import { Article } from "@/types";

export function DesktopMain({ articles }: { articles: Article[] }) {
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
                        <Opinion />
                        <PopularNews articles={articles.slice(8, 13)} />
                    </Stack>
                </GridCol>
            </Grid>
        </Container>
    );
}
