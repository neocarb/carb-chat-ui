import { ContentBlock } from "@langchain/core/messages";
import { toast } from "sonner";

// Returns a Promise of a typed multimodal block for images or PDFs
export async function fileToContentBlock(
  file: File,
): Promise<ContentBlock.Multimodal.Data> {
  const supportedImageTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  const supportedFileTypes = [...supportedImageTypes, "application/pdf"];

  if (!supportedFileTypes.includes(file.type)) {
    toast.error(
      `Unsupported file type: ${file.type}. Supported types are: ${supportedFileTypes.join(", ")}`,
    );
    return Promise.reject(new Error(`Unsupported file type: ${file.type}`));
  }

  const data = await fileToBase64(file);

  if (supportedImageTypes.includes(file.type)) {
    return {
      type: "image",
      mimeType: file.type,
      data,
      metadata: { name: file.name },
    };
  }

  // PDF
  return {
    type: "file",
    mimeType: "application/pdf",
    data,
    metadata: { filename: file.name },
  };
}

// Helper to convert File to base64 string
export async function fileToBase64(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove the data:...;base64, prefix
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Helper to read mime type from a block that may use either JS SDK format
 * (mimeType) or LangChain Python format (mime_type).
 */
function getBlockMimeType(block: Record<string, unknown>): string | undefined {
  const val =
    (block as { mimeType?: unknown }).mimeType ??
    (block as { mime_type?: unknown }).mime_type;
  return typeof val === "string" ? val : undefined;
}

/**
 * Helper to read base64 data from a block that may use either JS SDK format
 * (data) or LangChain Python format (base64).
 */
function getBlockData(
  block: Record<string, unknown>,
): string | Uint8Array | undefined {
  const val =
    (block as { data?: unknown }).data ??
    (block as { base64?: unknown }).base64;
  return typeof val === "string" || val instanceof Uint8Array ? val : undefined;
}

// Type guard for Base64ContentBlock — accepts both JS SDK (mimeType/data)
// and LangChain Python (mime_type/base64) formats.
export function isBase64ContentBlock(
  block: unknown,
): block is ContentBlock.Multimodal.Data {
  if (typeof block !== "object" || block === null || !("type" in block))
    return false;
  const b = block as Record<string, unknown>;
  const mime = getBlockMimeType(b);
  if (!mime) return false;
  if (b.type === "file" && (mime.startsWith("image/") || mime === "application/pdf")) return true;
  if (b.type === "image" && mime.startsWith("image/")) return true;
  return false;
}

/**
 * Normalize a content block from either format (JS SDK or LangChain Python)
 * into the JS SDK format used by our UI components (mimeType/data).
 */
export function normalizeContentBlock(
  block: Record<string, unknown>,
): ContentBlock.Multimodal.Data {
  const mime = getBlockMimeType(block);
  const data = getBlockData(block);
  return {
    ...block,
    mimeType: mime,
    data: data,
  } as unknown as ContentBlock.Multimodal.Data;
}

/**
 * Convert SDK-typed content blocks to the format LangChain Python expects.
 * Maps: mimeType → mime_type, data → base64
 */
export function contentBlockToLangChain(
  block: ContentBlock.Multimodal.Data,
): Record<string, unknown> {
  if (block.type === "image") {
    return {
      type: "image",
      mime_type: block.mimeType,
      base64: block.data,
      ...(block.metadata ? { metadata: block.metadata } : {}),
    };
  }
  if (block.type === "file") {
    return {
      type: "file",
      mime_type: block.mimeType,
      base64: block.data,
      ...(block.metadata ? { metadata: block.metadata } : {}),
    };
  }
  return block as unknown as Record<string, unknown>;
}
