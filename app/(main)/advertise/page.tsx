import type { Metadata } from "next";
import { AdvertiseContent } from "./AdvertiseContent";

export const metadata: Metadata = {
    title: "광고안내 | 광전타임즈",
    description: "광전타임즈 광고 안내 — 배너 광고, 기사형 광고, 제휴 문의",
};

export default function Advertise() {
    return <AdvertiseContent />;
}
