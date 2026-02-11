import { Box } from "@mantine/core";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { MobileFooter } from "@/components/mobile/MobileFooter";
import { PreviewHeader } from "./PreviewHeader";

// 🔧 프리뷰 모드: 환경변수 사용 (단일 소스)
const PREVIEW_MODE = process.env.NEXT_PUBLIC_PREVIEW_MODE === "true";

export async function DeviceLayout({ children }: { children: React.ReactNode }) {
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

    // Render both layouts; CSS media queries handle visibility
    return (
        <>
            <Box visibleFrom="md">
                <Header />
            </Box>
            <Box hiddenFrom="md">
                <MobileHeader />
            </Box>

            <Box visibleFrom="md">
                <main style={{ minHeight: '80vh' }}>{children}</main>
            </Box>
            <Box hiddenFrom="md">
                <main style={{ paddingBottom: '60px' }}>{children}</main>
            </Box>

            <Box visibleFrom="md">
                <Footer />
            </Box>
            <Box hiddenFrom="md">
                <MobileFooter />
            </Box>
        </>
    );
}
