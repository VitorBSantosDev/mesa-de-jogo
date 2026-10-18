const DEFAULT_MAX_WIDTH = 400;
const JPEG_QUALITY = 0.82;

export async function resizeImage(file: File, maxWidth = DEFAULT_MAX_WIDTH): Promise<string> {
  const bitmap = await createImageBitmap(file);

  const scale = Math.min(1, maxWidth / bitmap.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
}
