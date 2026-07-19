"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Download, Lock } from "lucide-react";

import { api, ApiError, downloadFile } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { useI18n } from "@/context/i18n-context";
import type { EducationContent } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function toYoutubeEmbedUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
    }
    const videoId = parsed.searchParams.get("v");
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    return url;
  } catch {
    return url;
  }
}

export default function EducationDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { dict } = useI18n();
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["education", slug],
    queryFn: () => api.get<{ content: EducationContent; locked: boolean }>(`/api/education/${slug}`),
  });

  async function handleDownload() {
    if (!user) {
      setShowRegisterPrompt(true);
      return;
    }
    setDownloading(true);
    try {
      await downloadFile(`/api/education/${slug}/download`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : dict.educationDetail.downloadFailed);
    } finally {
      setDownloading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="h-8 w-2/3 animate-pulse rounded bg-navy-800/50" />
        <div className="mt-4 h-4 w-1/3 animate-pulse rounded bg-navy-800/50" />
        <div className="mt-8 h-64 animate-pulse rounded-2xl bg-navy-800/50" />
      </div>
    );
  }

  if (error || !data?.content) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="font-display text-2xl font-bold">{dict.educationDetail.notFoundTitle}</h1>
        <p className="mt-2 text-foreground/60">
          {error instanceof ApiError ? error.message : dict.educationDetail.notFoundBody}
        </p>
        <Button asChild className="mt-6">
          <Link href="/education">
            <ArrowLeft className="h-4 w-4" /> {dict.educationDetail.backToCenter}
          </Link>
        </Button>
      </div>
    );
  }

  const { content, locked } = data;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link href="/education" className="inline-flex items-center gap-1.5 text-sm text-foreground/60 hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {dict.educationDetail.backToCenter}
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Badge variant="neutral">{content.category.replace(/_/g, " ")}</Badge>
        <Badge variant="outline">{content.type}</Badge>
        {content.featured && <Badge variant="warning">{dict.educationDetail.featured}</Badge>}
        {content.vipOnly && (
          <Badge>
            <Lock className="h-3 w-3" /> VIP
          </Badge>
        )}
      </div>

      <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">{content.title}</h1>
      {content.description && <p className="mt-4 text-lg leading-8 text-foreground/70">{content.description}</p>}

      {locked ? (
        <div className="mt-8 rounded-2xl border border-gold-500/20 bg-gold-500/5 p-8 text-center">
          <Lock className="mx-auto h-8 w-8 text-gold-400" />
          <h2 className="mt-4 font-display text-xl font-semibold">{dict.educationDetail.vipOnlyTitle}</h2>
          <p className="mt-2 text-foreground/60">{dict.educationDetail.vipOnlyBody}</p>
          <Button asChild className="mt-6">
            <Link href="/pricing">{dict.educationDetail.viewVipPlans}</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {content.type === "ARTICLE" && content.body && (
            <div className="whitespace-pre-line text-base leading-7 text-foreground/80">{content.body}</div>
          )}

          {content.type === "IMAGE" && content.imageUrl && (
            <div className="overflow-hidden rounded-2xl border border-black/10">
              <Image src={content.imageUrl} alt={content.title} width={1200} height={800} className="w-full object-cover" />
            </div>
          )}

          {content.type === "VIDEO" && (
            <div className="aspect-video overflow-hidden rounded-2xl border border-black/10">
              {content.youtubeUrl ? (
                <iframe
                  src={toYoutubeEmbedUrl(content.youtubeUrl)}
                  title={content.title}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : content.videoUrl ? (
                <video src={content.videoUrl} controls className="h-full w-full" />
              ) : null}
            </div>
          )}

          {content.type === "AUDIO" && content.fileUrl && (
            <audio src={content.fileUrl} controls className="w-full" />
          )}

          {content.type === "PDF" && (
            <Button variant="outline" onClick={handleDownload} disabled={downloading}>
              <Download className="h-4 w-4" /> {downloading ? dict.educationDetail.downloading : dict.educationDetail.downloadPdf}
            </Button>
          )}

          {content.body && content.type !== "ARTICLE" && (
            <div className="whitespace-pre-line text-base leading-7 text-foreground/80">{content.body}</div>
          )}
        </div>
      )}

      <Dialog open={showRegisterPrompt} onOpenChange={setShowRegisterPrompt}>
        <DialogContent className="text-center">
          <DialogHeader>
            <DialogTitle>{dict.educationDetail.registerPromptTitle}</DialogTitle>
          </DialogHeader>
          <Lock className="mx-auto h-8 w-8 text-gold-400" />
          <p className="mt-2 text-sm text-foreground/60">
            {dict.educationDetail.registerPromptBody}
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Button asChild>
              <Link href="/register">{dict.educationDetail.createFreeAccount}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/login">{dict.educationDetail.alreadyHaveAccount}</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
