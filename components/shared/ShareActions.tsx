"use client";

import { ActionIcon, Button, CopyButton, Group, Text, Tooltip } from "@mantine/core";
import {
    IconBrandFacebook,
    IconBrandTwitter,
    IconCheck,
    IconCopy,
    IconLink,
    IconShare,
} from "@tabler/icons-react";
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

    const iconSize = compact ? 16 : 18;
    const btnSize = compact ? "xs" : "sm";

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setStatus("링크가 복사되었습니다.");
        } catch {
            setStatus("복사에 실패했습니다.");
        }
        setTimeout(() => setStatus(""), 2000);
    };

    const handleNativeShare = async () => {
        if (!url) return;
        if (navigator.share) {
            try {
                await navigator.share({ title, url });
                return;
            } catch {
                /* user cancelled */
            }
        }
        await copyToClipboard();
    };

    const shareToTwitter = () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        window.open(twitterUrl, "_blank", "noopener,noreferrer,width=550,height=420");
    };

    const shareToFacebook = () => {
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        window.open(fbUrl, "_blank", "noopener,noreferrer,width=550,height=420");
    };

    const shareToKakao = async () => {
        // KakaoStory was shut down. Use clipboard fallback with toast.
        try {
            await navigator.clipboard.writeText(url);
            setStatus("링크가 복사되었습니다. 카카오톡에 붙여넣기 해주세요.");
        } catch {
            setStatus("복사에 실패했습니다.");
        }
        setTimeout(() => setStatus(""), 3000);
    };

    if (compact) {
        return (
            <Group gap={4} wrap="nowrap" align="center">
                <Tooltip label="공유하기" withArrow>
                    <ActionIcon
                        variant={isDark ? "filled" : "light"}
                        color={isDark ? "dark" : "gray"}
                        size="sm"
                        radius="xl"
                        onClick={handleNativeShare}
                        aria-label="공유하기"
                    >
                        <IconShare size={14} />
                    </ActionIcon>
                </Tooltip>

                <CopyButton value={url} timeout={2000}>
                    {({ copied, copy }) => (
                        <Tooltip label={copied ? "복사됨!" : "링크 복사"} withArrow>
                            <ActionIcon
                                variant={isDark ? "filled" : "light"}
                                color={copied ? "teal" : isDark ? "dark" : "gray"}
                                size="sm"
                                radius="xl"
                                onClick={copy}
                                aria-label="링크 복사"
                            >
                                {copied ? <IconCheck size={14} /> : <IconLink size={14} />}
                            </ActionIcon>
                        </Tooltip>
                    )}
                </CopyButton>

                <Tooltip label="Facebook" withArrow>
                    <ActionIcon
                        variant={isDark ? "filled" : "light"}
                        color={isDark ? "dark" : "gray"}
                        size="sm"
                        radius="xl"
                        onClick={shareToFacebook}
                        aria-label="Facebook 공유"
                    >
                        <IconBrandFacebook size={14} />
                    </ActionIcon>
                </Tooltip>

                <Tooltip label="X (Twitter)" withArrow>
                    <ActionIcon
                        variant={isDark ? "filled" : "light"}
                        color={isDark ? "dark" : "gray"}
                        size="sm"
                        radius="xl"
                        onClick={shareToTwitter}
                        aria-label="X 공유"
                    >
                        <IconBrandTwitter size={14} />
                    </ActionIcon>
                </Tooltip>
            </Group>
        );
    }

    return (
        <Group gap="xs" wrap="wrap" align="center">
            <Button
                size={btnSize}
                variant={isDark ? "default" : "light"}
                color={isDark ? "gray" : "blue"}
                radius="xl"
                leftSection={<IconShare size={iconSize} />}
                style={
                    isDark
                        ? { background: "var(--mantine-color-dark-8)", borderColor: "var(--mantine-color-dark-5)", color: "var(--mantine-color-gray-1)" }
                        : undefined
                }
                onClick={handleNativeShare}
            >
                공유
            </Button>

            <CopyButton value={url} timeout={2000}>
                {({ copied, copy }) => (
                    <Button
                        size={btnSize}
                        variant="subtle"
                        color={copied ? "teal" : isDark ? "gray" : "blue"}
                        radius="xl"
                        leftSection={copied ? <IconCheck size={iconSize} /> : <IconCopy size={iconSize} />}
                        style={
                            isDark
                                ? { color: "var(--mantine-color-gray-4)", border: "1px dashed var(--mantine-color-dark-5)", background: "transparent" }
                                : undefined
                        }
                        onClick={copy}
                    >
                        {copied ? "복사됨" : "링크 복사"}
                    </Button>
                )}
            </CopyButton>

            <ActionIcon
                variant={isDark ? "filled" : "light"}
                color={isDark ? "dark" : "blue"}
                size={compact ? "sm" : "md"}
                radius="xl"
                onClick={shareToFacebook}
                aria-label="Facebook 공유"
            >
                <IconBrandFacebook size={iconSize} />
            </ActionIcon>

            <ActionIcon
                variant={isDark ? "filled" : "light"}
                color={isDark ? "dark" : "blue"}
                size={compact ? "sm" : "md"}
                radius="xl"
                onClick={shareToTwitter}
                aria-label="X 공유"
            >
                <IconBrandTwitter size={iconSize} />
            </ActionIcon>

            {status && (
                <Text size="xs" c={isDark ? "gray.5" : "dimmed"}>
                    {status}
                </Text>
            )}
        </Group>
    );
}
