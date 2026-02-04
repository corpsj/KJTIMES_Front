import { headers } from "next/headers";

export async function getDeviceType() {
    const headersList = await headers();
    const deviceType = headersList.get("x-device-type") || "desktop";
    return deviceType as "mobile" | "desktop";
}
