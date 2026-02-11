import type { Metadata } from "next";
import { CorrectionsContent } from "./CorrectionsContent";

export const metadata: Metadata = {
    title: "정정보도 및 오류신고 | 광전타임즈",
    description: "광전타임즈 기사 정정보도 요청 및 오류신고 안내",
};

export default function Corrections() {
    return <CorrectionsContent />;
}
