import { DeviceLayout } from "@/components/layout/DeviceLayout";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return <DeviceLayout>{children}</DeviceLayout>;
}
