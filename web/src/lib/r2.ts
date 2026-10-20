import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { Section } from "@/types";

const DEFAULT_TTL_SECONDS = 6 * 60 * 60;

let client: S3Client | null = null;

function getClient(): S3Client {
  if (client) return client;
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 env vars not configured");
  }
  client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
  return client;
}

/**
 * Lesson videos are stored in the DB as `${R2_PUBLIC_URL}/videos/<file>`.
 * Returns the object key for such a URL, or null for anything else
 * (text lessons, legacy hosts), which is left untouched.
 */
function videoKeyFromUrl(content: string): string | null {
  const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
  if (!publicUrl || !content.startsWith(`${publicUrl}/`)) return null;
  try {
    const key = decodeURIComponent(new URL(content).pathname.slice(1));
    return key.startsWith("videos/") ? key : null;
  } catch {
    return null;
  }
}

/** Short-lived signed GET URL for a lesson video; passes other content through. */
export async function signLessonContent(content: string): Promise<string> {
  const key = videoKeyFromUrl(content);
  const bucket = process.env.R2_BUCKET;
  if (!key || !bucket) return content;

  const ttl = Number(process.env.R2_SIGNED_URL_TTL_SECONDS) || DEFAULT_TTL_SECONDS;
  const signed = await getSignedUrl(
    getClient(),
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn: ttl },
  );
  // The fragment is never sent to the server. It keeps the file extension at
  // the end of the URL so mobile builds that detect videos with
  // `url.endsWith(".mp4")` keep working.
  const ext = key.slice(key.lastIndexOf("."));
  return `${signed}#${ext}`;
}

/** Replaces video URLs in every lesson with signed ones. */
export async function signSectionVideos(
  sections: Section[] | undefined,
): Promise<Section[] | undefined> {
  if (!sections) return sections;
  return Promise.all(
    sections.map(async (section) => ({
      ...section,
      lessons: await Promise.all(
        (section.lessons ?? []).map(async (lesson) => ({
          ...lesson,
          content: lesson.content
            ? await signLessonContent(lesson.content)
            : lesson.content,
        })),
      ),
    })),
  );
}
