'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { X, Play } from 'lucide-react';
import type { PortfolioProject } from '@/core/services/portfolioService';

// Dynamically import Vimeo player to avoid SSR issues
const Vimeo = dynamic(() => import('@u-wave/react-vimeo'), { ssr: false });

interface PortfolioSectionProps {
  projects: PortfolioProject[];
}

export function PortfolioSection({ projects }: PortfolioSectionProps) {
  const [filter, setFilter] = useState('Todas');
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const categories = ['Todas', 'Bodas', 'Pre-boda', 'Detalles', 'Recepción'];

  const filteredProjects = projects.filter((project) => {
    if (filter === 'Todas') return true;
    return project.category === filter;
  });

  // Assign random heights based on index to recreate the masonry look
  const getDynamicHeight = (index: number) => {
    const heights = ['h-96', 'h-64', 'h-80', 'h-[28rem]'];
    return heights[index % heights.length];
  };

  return (
    <section id="portafolio" className="py-24 bg-white border-b-4 border-black relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-16">
          <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-2 inline-block border-b-4 border-black pb-2">
            PORTAFOLIO
          </h2>
          <p className="text-xl md:text-2xl font-medium text-gray-600 mt-4">
            Nuestro trabajo habla por sí mismo
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-4 mb-12">
          {categories.map((cat) => (
            <button 
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2 uppercase text-sm font-bold brutalist-border transition-colors ${filter === cat ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filteredProjects.length > 0 ? (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {filteredProjects.map((project, idx) => (
              <div
                key={project.id}
                className="relative group overflow-hidden brutalist-border bg-gray-200 block break-inside-avoid cursor-pointer"
                onClick={() => project.video_url && setActiveVideo(project.video_url)}
              >
                <div className={`relative w-full ${getDynamicHeight(idx)}`}>
                  {project.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={project.cover_image_url}
                      alt={`${project.title} - ${project.couple_name}`}
                      className="w-full h-full object-cover grayscale transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <span className="font-bold uppercase text-gray-500 tracking-widest text-sm">Sin Portada</span>
                    </div>
                  )}
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-6 text-center">
                  <h3 className="text-white text-2xl font-bold uppercase tracking-wider mb-2">
                    {project.title}
                  </h3>
                  <p className="text-gray-300 font-medium tracking-widest text-sm">— {project.couple_name} —</p>
                  {project.video_url && (
                    <div className="mt-6 border-2 border-white p-3 rounded-full flex items-center justify-center bg-white/10 hover:bg-white hover:text-black transition-colors text-white">
                      <Play size={24} className="ml-1" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border-4 border-dashed border-gray-300">
            <p className="font-bold text-gray-400 uppercase tracking-widest">No hay proyectos para esta categoría.</p>
          </div>
        )}

      </div>

      {/* Video Modal - Brutalist Style */}
      {activeVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-white/90 backdrop-blur-sm">
          <div className="relative w-full max-w-6xl aspect-video bg-black brutalist-shadow border-4 border-black">
            {/* Close Button */}
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute -top-12 right-0 md:-right-12 bg-white border-4 border-black text-black w-12 h-12 flex items-center justify-center hover:bg-black hover:text-white transition-colors z-50 font-black"
              aria-label="Cerrar video"
            >
              <X size={24} strokeWidth={3} />
            </button>

            <div className="w-full h-full relative">
              <Vimeo
                video={activeVideo}
                autoplay={true}
                responsive={true}
                className="w-full h-full [&>div]:w-full [&>div]:h-full [&>div>iframe]:w-full [&>div>iframe]:h-full absolute top-0 left-0"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
