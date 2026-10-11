// Shrinks a photo in the browser before upload so phones load the site fast:
// at most `maxSide` pixels on the long edge, re-encoded as JPEG. Small images,
// animations and vector files are left as they are.
export async function shrinkImage(
  file: Blob,
  { maxSide = 1600, quality = 0.85, minBytes = 300_000 } = {},
): Promise<Blob> {
  if (!/^image\/(jpeg|png|webp|heic|heif|avif|bmp)$/.test(file.type)) return file;
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file; // a format this browser can't decode: upload as is
  }
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size <= minBytes) {
    bitmap.close();
    return file;
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d")!;
  // JPEG has no transparency: paint transparent areas white, not black.
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const out = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality),
  );
  // Keep the original if re-encoding didn't help.
  return out && out.size < file.size ? out : file;
}

// File extension for an uploaded blob's type.
export const extFor = (type: string) => type.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
