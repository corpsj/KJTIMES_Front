"use client";

import { Button, Group, Text } from "@mantine/core";
import { useState } from "react";

export function ShareActions({
    title,
    url,
    tone = "light",
    compact = false,
}: {
    title: string;
    url: string;
    tone?: "light" | "dark";
    compact?: boolean;
}) {
    const [status, setStatus] = useState<string>("");
    const isDark = tone === "dark";

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
        <Group gap={compact ? 6 : "sm"} wrap="wrap" align="center">
            <Button
                size={compact ? "xs" : "sm"}
                variant={isDark ? "default" : "light"}
                color={isDark ? "gray" : "blue"}
                radius="xl"
                style={
                    isDark
                        ? { background: "#1a2634", borderColor: "#344457", color: "#e6edf7" }
                        : undefined
                }
                onClick={handleShare}
            >
                공유하기
            </Button>
            <Button
                size={compact ? "xs" : "sm"}
                variant="subtle"
                color={isDark ? "gray" : "blue"}
                radius="xl"
                style={
                    isDark
                        ? { color: "#bfccdc", border: "1px dashed #33475e", background: "transparent" }
                        : undefined
                }
                onClick={copyToClipboard}
            >
                링크 복사
            </Button>
            {status && (
                <Text size="xs" c={isDark ? "#9cadbf" : "dimmed"}>
                    {status}
                </Text>
            )}
        </Group>
    );
}
