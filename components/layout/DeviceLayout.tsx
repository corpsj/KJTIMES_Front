import { getDeviceType } from "@/utils/device";
import { Header } from "./Header"; // This is the PC Header
import { Footer } from "./Footer"; // This is the PC Footer
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { MobileFooter } from "@/components/mobile/MobileFooter";
import { PreviewHeader } from "./PreviewHeader";

// 🔧 프리뷰 모드: 네비게이션 숨김
const PREVIEW_MODE = process.env.PREVIEW_MODE === "true";

export async function DeviceLayout({ children }: { children: React.ReactNode }) {
    const deviceType = await getDeviceType();

    // 프리뷰 모드: 간소화된 헤더만 표시
    if (PREVIEW_MODE) {
        return (
            <>
                <PreviewHeader />
                <main style={{ minHeight: '80vh' }}>{children}</main>
                <Footer />
            </>
        );
    }

    if (deviceType === "mobile") {
        return (
            <>
                <MobileHeader />
                <main style={{ paddingBottom: '60px' }}>{children}</main>
                <MobileFooter />
            </>
        );
    }

    // Desktop
    return (
        <>
            <Header />
            <main style={{ minHeight: '80vh' }}>{children}</main>
            <Footer />
        </>
    );
}
