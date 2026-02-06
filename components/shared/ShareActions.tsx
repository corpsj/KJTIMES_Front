"use client";

import { Button, Group, Text } from "@mantine/core";
import { useState } from "react";

export function ShareActions({ title, url }: { title: string; url: string }) {
    const [status, setStatus] = useState<string>("");

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setStatus("링크가 복사되었습니다.");
        } catch {
            setStatus("복사에 실패했습니다.");
        }

        setTimeout(() => setStatus(""), 2000);
    };

    const handleShare = async () => {
        if (!url) return;

        if (navigator.share) {
            try {
                await navigator.share({ title, url });
                return;
            } catch {
                // fallback to copy
            }
        }

        await copyToClipboard();
    };

    return (
        <Group gap="sm" wrap="wrap" align="center">
            <Button size="xs" variant="light" onClick={handleShare}>
                공유하기
            </Button>
            <Button size="xs" variant="subtle" onClick={copyToClipboard}>
                링크 복사
            </Button>
            {status && (
                <Text size="xs" c="dimmed">
                    {status}
                </Text>
            )}
        </Group>
    );
}
