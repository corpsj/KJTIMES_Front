import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import FactoryDetailClient from "./client"; // 클라이언트 컴포넌트 분리

export default async function NewsFactoryDetail({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: news, error } = await supabase
    .from("press_releases")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !news) {
    notFound();
  }

  return <FactoryDetailClient news={news} />;
}
