import { NextRequest, NextResponse } from "next/server";
import { buildTrustedTenantHeaders, resolveTenantHost } from "@/lib/tenant-host";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? request.nextUrl.hostname;
  const resolution = resolveTenantHost(host, process.env.PLATFORM_ROOT_DOMAIN);

  if (resolution.kind === "invalid") {
    return NextResponse.json({ error: "Invalid host" }, { status: 400 });
  }

  const forwardedHeaders = buildTrustedTenantHeaders(request.headers, resolution);

  return NextResponse.next({ request: { headers: forwardedHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|icon.svg|favicon.ico|landing-interactions.js|fonts/|robots.txt|sitemap.xml).*)"],
};
