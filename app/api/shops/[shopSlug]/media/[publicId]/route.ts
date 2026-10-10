import { ShopStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { imageMimeType, type SupportedImageFormat } from "@/lib/media-format";
import { readStoredImage } from "@/lib/media-storage";

const supportedFormats = new Set<SupportedImageFormat>(["jpg", "png", "webp", "avif"]);

export async function GET(_request: Request, { params }: { params: Promise<{ shopSlug: string; publicId: string }> }) {
  const { shopSlug, publicId } = await params;
  if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(shopSlug) || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(publicId)) {
    return new Response("Not found", { status: 404 });
  }
  const shop = await db.shop.findFirst({ where: { slug: shopSlug, status: ShopStatus.ACTIVE }, select: { id: true } });
  if (!shop) return new Response("Not found", { status: 404 });
  const asset = await db.mediaAsset.findFirst({ where: { shopId: shop.id, publicId }, select: { format: true } });
  if (!asset?.format || !supportedFormats.has(asset.format as SupportedImageFormat)) return new Response("Not found", { status: 404 });

  try {
    const bytes = await readStoredImage(shop.id, publicId);
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": imageMimeType(asset.format as SupportedImageFormat),
        "Content-Length": String(bytes.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
