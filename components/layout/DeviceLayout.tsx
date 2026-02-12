import { Header } from "./Header";
import { Footer } from "./Footer";
import { BottomNav } from "./BottomNav";
import { PreviewHeader } from "./PreviewHeader";

const PREVIEW_MODE = process.env.NEXT_PUBLIC_PREVIEW_MODE === "true";

export async function DeviceLayout({ children }: { children: React.ReactNode }) {
    if (PREVIEW_MODE) {
        return (
            <>
                <PreviewHeader />
                <main style={{ minHeight: '80vh' }}>{children}</main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <main style={{ minHeight: '80vh', paddingBottom: 56 }}>{children}</main>
            <Footer />
            <BottomNav />
        </>
    );
}
