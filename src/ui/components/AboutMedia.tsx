'use client';

import dynamic from 'next/dynamic';
import { isAboutVimeoUrl } from '@/core/utils/aboutContent';
const Vimeo = dynamic(() => import('@u-wave/react-vimeo'), { ssr: false });

export function AboutMedia({ type, imageUrl, videoUrl, alt }: {
  type?: 'image' | 'video'; imageUrl?: string | null; videoUrl?: string | null; alt: string;
}) {
  if (type === 'video' && videoUrl && isAboutVimeoUrl(videoUrl)) {
    return <div className="aspect-video relative bg-obsidian overflow-hidden">
      <Vimeo video={videoUrl} muted autoplay loop controls showTitle={false} showByline={false} showPortrait={false}
        className="absolute inset-0 w-full h-full [&_iframe]:w-full [&_iframe]:h-full" />
    </div>;
  }
  return <div className="aspect-[4/5] max-h-[640px] overflow-hidden">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={imageUrl || '/interludes/hands.png'} alt={alt} loading="lazy" className="w-full h-full object-cover" />
  </div>;
}
