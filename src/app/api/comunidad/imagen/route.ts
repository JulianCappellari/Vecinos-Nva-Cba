import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/community/auth";
import { assertSameOrigin, CommunityError, rateLimit, readBoundedBody } from "@/lib/community/security";

export const runtime = "nodejs";
export async function POST(request: Request) {
  let publicId: string | undefined;
  try {
    if (process.env.DEMO_MODE === "1") throw new CommunityError("En el sitio de muestra no se cargan fotos. Podés publicar sin foto.", 503);
    assertSameOrigin(request);
    const user = await requireUser();
    await rateLimit("upload:" + user.id, 10, 86400000);
    if (!process.env.CLOUDINARY_URL) throw new CommunityError("Las fotos no están disponibles ahora. Podés publicar sin foto.", 503);
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.startsWith("multipart/form-data;")) throw new CommunityError("Elegí una foto JPG, PNG o WebP.");
    const bytes = await readBoundedBody(request, 2 * 1024 * 1024 + 16000);
    const form = await new Response(new Uint8Array(bytes), { headers: { "Content-Type": contentType } }).formData();
    const file = form.get("image");
    if (!(file instanceof File) || !file.size || file.size > 2 * 1024 * 1024) throw new CommunityError("La foto debe pesar hasta 2 MB.");
    const buffer = Buffer.from(await file.arrayBuffer());
    const jpg = buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255;
    const png = buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const webp = buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";
    if (!jpg && !png && !webp) throw new CommunityError("Usá una foto JPG, PNG o WebP válida.");
    cloudinary.config(process.env.CLOUDINARY_URL);
    const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: "comunidad", resource_type: "image", transformation: [{ width: 1200, height: 900, crop: "limit" }, { quality: "auto", fetch_format: "webp" }] }, (error, value) => error || !value ? reject(error) : resolve(value)).end(buffer);
    });
    publicId = result.public_id;
    const asset = await prisma.communityAsset.create({ data: { ownerId: user.id, url: result.secure_url, publicId } });
    return NextResponse.json({ ok: true, imageId: asset.id, url: asset.url }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (publicId) await cloudinary.uploader.destroy(publicId).catch(() => undefined);
    return NextResponse.json({ ok: false, message: error instanceof CommunityError ? error.message : "No se pudo cargar la foto. Intentá de nuevo o publicá sin foto." }, { status: error instanceof CommunityError ? error.status : 503 });
  }
}
