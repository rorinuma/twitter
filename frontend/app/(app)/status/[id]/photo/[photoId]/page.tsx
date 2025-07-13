"use client";

import Spinner from "@/components/ui/decorations/Spinner";
import { redirect, useParams } from "next/navigation";
import { useEffect } from "react";

export default function PhotoGalleryFallback() {
  const params = useParams<{ id: string; photoId: string }>();

  useEffect(() => {
    redirect(`/status/${params.id}`);
  }, []);

  return (
    <div className="flex justify-center mt-6">
      <Spinner />
    </div>
  );
}
