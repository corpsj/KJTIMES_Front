import type { Metadata } from "next";
import { TermsContent } from "./TermsContent";

export const metadata: Metadata = {
  title: "이용약관 | 광전타임즈",
  description: "광전타임즈 서비스 이용약관",
};

export default function TermsPage() {
  return <TermsContent />;
}
