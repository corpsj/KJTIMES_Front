"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { nfFetch } from "@/lib/news-factory";
import type { NfRegion, NfCategory, NfSubscription } from "@/hooks/useNewsFeed";
import { CRON_PRESETS } from "@/hooks/useNewsFeed";

interface SubscriptionModalProps {
  regions: NfRegion[];
  categories: NfCategory[];
  editing: NfSubscription | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function SubscriptionModal({
  regions,
  categories,
  editing,
  onClose,
  onSaved,
}: SubscriptionModalProps) {
  const [name, setName] = useState(editing?.name || "");
  const [selRegions, setSelRegions] = useState<string[]>(
    editing?.filter_regions || []
  );
  const [selCategories, setSelCategories] = useState<string[]>(
    editing?.filter_categories || []
  );
  const [cronPreset, setCronPreset] = useState(() => {
    const match = CRON_PRESETS.find((p) => p.value === editing?.schedule_cron);
    return match ? match.value : "";
  });
  const [cronCustom, setCronCustom] = useState(editing?.schedule_cron || "");
  const [maxArticles, setMaxArticles] = useState(
    editing?.max_articles ?? 20
  );
  const [selKeywords, setSelKeywords] = useState<string[]>(
    editing?.filter_keywords || []
  );
  const [saving, setSaving] = useState(false);

  const schedule = cronPreset || cronCustom;

  const toggleInList = (list: string[], val: string) =>
    list.includes(val) ? list.filter((v) => v !== val) : [...list, val];

  const handleSave = async () => {
    if (!name.trim()) {
      notifications.show({
        message: "구독 이름을 입력해 주세요.",
        color: "orange",
      });
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: name.trim(),
        filter_regions: selRegions.length > 0 ? selRegions : undefined,
        filter_categories: selCategories.length > 0 ? selCategories : undefined,
        filter_keywords: selKeywords.length > 0 ? selKeywords : undefined,
        schedule_cron: schedule,
        max_articles: maxArticles,
      };

      if (editing) {
        await nfFetch(`/api/v1/subscriptions/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        notifications.show({
          message: "구독이 수정되었습니다",
          color: "green",
        });
      } else {
        await nfFetch("/api/v1/subscriptions", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        notifications.show({
          message: "구독이 추가되었습니다",
          color: "green",
        });
      }
      onSaved();
    } catch (err) {
      notifications.show({
        message: `저장 실패: ${err instanceof Error ? err.message : "오류"}`,
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      opened
      onClose={onClose}
      title={editing ? "구독 수정" : "구독 추가"}
      centered
      size="md"
    >
      <Stack gap="md">
        {/* Name */}
        <TextInput
          label="구독 이름"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="예: 광주 행정 뉴스"
        />

        {/* Regions */}
        {regions.length > 0 && (
          <Box>
            <Text
              size="xs"
              fw={600}
              c="dimmed"
              mb={6}
              tt="uppercase"
              lts={1}
            >
              지역 (다중 선택)
            </Text>
            <Group gap="xs">
              {regions.map((r) => (
                <Button
                  key={r.code}
                  variant={
                    selRegions.includes(r.code) ? "filled" : "default"
                  }
                  color={
                    selRegions.includes(r.code) ? "dark" : undefined
                  }
                  size="xs"
                  radius="xl"
                  onClick={() =>
                    setSelRegions(toggleInList(selRegions, r.code))
                  }
                >
                  {r.name}
                </Button>
              ))}
            </Group>
          </Box>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <Box>
            <Text
              size="xs"
              fw={600}
              c="dimmed"
              mb={6}
              tt="uppercase"
              lts={1}
            >
              카테고리 (다중 선택)
            </Text>
            <Group gap="xs">
              {categories.map((c) => (
                <Button
                  key={c.code}
                  variant={
                    selCategories.includes(c.code) ? "filled" : "default"
                  }
                  color={
                    selCategories.includes(c.code) ? "dark" : undefined
                  }
                  size="xs"
                  radius="xl"
                  onClick={() =>
                    setSelCategories(
                      toggleInList(selCategories, c.code)
                    )
                  }
                >
                  {c.name}
                </Button>
              ))}
            </Group>
          </Box>
        )}

        {/* Schedule */}
        <Box>
          <Text
            size="xs"
            fw={600}
            c="dimmed"
            mb={6}
            tt="uppercase"
            lts={1}
          >
            스케줄
          </Text>
          <Group gap="xs">
            {CRON_PRESETS.map((p) => (
              <Button
                key={p.label}
                variant={
                  (cronPreset === p.value && p.value) ||
                  (!cronPreset && p.value === "")
                    ? "filled"
                    : "default"
                }
                color={
                  (cronPreset === p.value && p.value) ||
                  (!cronPreset && p.value === "")
                    ? "dark"
                    : undefined
                }
                size="xs"
                radius="xl"
                onClick={() => {
                  setCronPreset(p.value);
                  if (p.value) setCronCustom(p.value);
                }}
              >
                {p.label}
              </Button>
            ))}
          </Group>
          {!cronPreset && (
            <TextInput
              mt="xs"
              value={cronCustom}
              onChange={(e) => setCronCustom(e.currentTarget.value)}
              placeholder="cron 표현식 (예: 0 9 * * 1-5)"
            />
          )}
        </Box>

        {/* Max articles */}
        <TextInput
          label="최대 기사 수"
          type="number"
          min={1}
          max={100}
          value={String(maxArticles)}
          onChange={(e) =>
            setMaxArticles(Number(e.currentTarget.value) || 10)
          }
        />

        {/* Actions */}
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>
            취소
          </Button>
          <Button color="dark" loading={saving} onClick={handleSave}>
            {editing ? "수정" : "추가"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
