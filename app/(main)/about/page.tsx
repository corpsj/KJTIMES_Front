import type { Metadata } from "next";
import { AboutContent } from "./AboutContent";

export const metadata: Metadata = {
    title: "회사소개 | 광전타임즈",
    description: "광전타임즈 회사소개 — 지역과 현장을 가장 가까이에서 기록하는 언론",
};

export default function About() {
    return <AboutContent />;
}
