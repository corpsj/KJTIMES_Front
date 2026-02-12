"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Button,
  Group,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconArticle,
  IconCheck,
  IconClock,
  IconEdit,
  IconNews,
  IconPhoto,
  IconPlus,
  IconRss,
  IconShare,
} from "@tabler/icons-react";
import { createClient } from "@/utils/supabase/client";
import AdminHeader from "@/components/admin/AdminHeader";
import StatCard from "@/components/admin/StatCard";
import StatusBadge from "@/components/admin/StatusBadge";
import EmptyState from "@/components/admin/EmptyState";

type RecentArticle = {
  id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at?: string | null;
};

export default function AdminDashboard() {
  const [supabase] = useState(() => createClient());
  const [userName, setUserName] = useState("관리자");
  const [loading, setLoading] = useState(true);

  const [statsTotal, setStatsTotal] = useState(0);
  const [statsPublished, setStatsPublished] = useState(0);
  const [statsDraft, setStatsDraft] = useState(0);
  const [statsPending, setStatsPending] = useState(0);
  const [statsShared, setStatsShared] = useState(0);

  const [recentArticles, setRecentArticles] = useState<RecentArticle[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name);
      }

      const [totalRes, publishedRes, draftRes, pendingRes, sharedRes] = await Promise.all([
        supabase.from("articles").select("id", { count: "exact", head: true }),
        supabase
          .from("articles")
          .select("id", { count: "exact", head: true })
          .eq("status", "published"),
        supabase
          .from("articles")
          .select("id", { count: "exact", head: true })
          .eq("status", "draft"),
        supabase
          .from("articles")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending_review"),
        supabase
          .from("articles")
          .select("id", { count: "exact", head: true })
          .eq("status", "shared"),
      ]);
      setStatsTotal(totalRes.count ?? 0);
      setStatsPublished(publishedRes.count ?? 0);
      setStatsDraft(draftRes.count ?? 0);
      setStatsPending(pendingRes.count ?? 0);
      setStatsShared(sharedRes.count ?? 0);

      const { data: recent } = await supabase
        .from("articles")
        .select("id, title, status, created_at, updated_at")
        .order("updated_at", { ascending: false })
        .limit(5);
      setRecentArticles((recent as RecentArticle[]) || []);

      setLoading(false);
    };

    fetchDashboardData();
  }, [supabase]);

  const todayFormatted = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    timeZone: "Asia/Seoul",
  });

  return (
    <div>
      <AdminHeader
        title="대시보드"
        actions={
          <Button
            component={Link}
            href="/admin/write"
            leftSection={<IconPlus size={16} />}
          >
            새 기사 작성
          </Button>
        }
      />

      {/* Welcome */}
      <Paper p="lg" mb="lg" shadow="0 1px 3px rgba(0,0,0,0.08)">
        <Text fz={20} fw={600}>
          안녕하세요, {userName}님
        </Text>
        <Text size="sm" c="dimmed" mt={4}>
          {todayFormatted}
        </Text>
      </Paper>

      {/* Stats */}
      {loading ? (
        <Group justify="center" py="xl">
          <Loader size="sm" />
        </Group>
      ) : (
        <SimpleGrid cols={{ base: 2, sm: 5 }} mb="lg">
          <StatCard
            label="전체 기사"
            value={statsTotal}
            icon={<IconNews size={22} />}
            color="gray"
          />
          <StatCard
            label="게시"
            value={statsPublished}
            icon={<IconCheck size={22} />}
            color="green"
          />
          <StatCard
            label="공유"
            value={statsShared}
            icon={<IconShare size={22} />}
            color="violet"
          />
          <StatCard
            label="작성"
            value={statsDraft}
            icon={<IconEdit size={22} />}
            color="blue"
          />
          <StatCard
            label="승인 대기"
            value={statsPending}
            icon={<IconClock size={22} />}
            color="yellow"
          />
        </SimpleGrid>
      )}

      {/* Recent articles */}
      <Paper p="lg" mb="lg" shadow="0 1px 3px rgba(0,0,0,0.08)">
        <Group justify="space-between" mb="md">
          <Text fw={600} fz="lg">
            최근 기사
          </Text>
          <Text
            component={Link}
            href="/admin/articles"
            size="sm"
            c="blue"
            style={{ textDecoration: "none" }}
          >
            전체 보기 →
          </Text>
        </Group>

        {loading ? (
          <Group justify="center" py="lg">
            <Loader size="sm" />
          </Group>
        ) : recentArticles.length === 0 ? (
          <EmptyState
            icon={<IconArticle size={48} />}
            title="기사가 없습니다"
            description="새 기사를 작성하여 시작하세요."
            action={
              <Button component={Link} href="/admin/write" size="sm">
                기사 작성
              </Button>
            }
          />
        ) : (
          <Stack gap={0}>
            {recentArticles.map((article) => (
              <Group
                key={article.id}
                justify="space-between"
                py="sm"
                style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    component={Link}
                    href={`/admin/write?id=${article.id}`}
                    fw={500}
                    size="sm"
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {article.title}
                  </Text>
                  <Text size="xs" c="dimmed" mt={2}>
                    {new Date(
                      article.updated_at || article.created_at
                    ).toLocaleString("ko-KR")}
                  </Text>
                </div>
                <StatusBadge status={article.status} />
              </Group>
            ))}
          </Stack>
        )}
      </Paper>

      {/* Quick actions */}
      <SimpleGrid cols={{ base: 2, sm: 4 }}>
        <Button
          component={Link}
          href="/admin/write"
          variant="light"
          leftSection={<IconEdit size={18} />}
          fullWidth
          size="md"
        >
          새 기사 작성
        </Button>
        <Button
          component={Link}
          href="/admin/articles"
          variant="light"
          color="gray"
          leftSection={<IconArticle size={18} />}
          fullWidth
          size="md"
        >
          기사 관리
        </Button>
        <Button
          component={Link}
          href="/admin/media"
          variant="light"
          color="teal"
          leftSection={<IconPhoto size={18} />}
          fullWidth
          size="md"
        >
          미디어
        </Button>
        <Button
          component={Link}
          href="/admin/news-feed"
          variant="light"
          color="orange"
          leftSection={<IconRss size={18} />}
          fullWidth
          size="md"
        >
          뉴스 피드
        </Button>
      </SimpleGrid>
    </div>
  );
}
