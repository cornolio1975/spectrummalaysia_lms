import type { Metadata } from "next";
import { getMedia } from "@/app/actions/media";
import { MediaClient } from "@/components/dashboard/media-client";

export const metadata: Metadata = { title: "Media Library" };

export default async function MediaPage() {
  const mediaRes = await getMedia();
  const mediaFiles = mediaRes.data || [];

  return <MediaClient mediaFiles={mediaFiles} />;
}
