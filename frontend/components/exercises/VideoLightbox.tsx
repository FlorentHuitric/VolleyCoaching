'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { X, ExternalLink, Instagram, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoLightboxProps {
  instagramUrl: string;
  exerciseName: string;
  open: boolean;
  onClose: () => void;
}

export default function VideoLightbox({ instagramUrl, exerciseName, open, onClose }: VideoLightboxProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const embedContainerRef = useRef<HTMLDivElement>(null);
  const [embedLoaded, setEmbedLoaded] = useState(false);

  const getCleanUrl = (url: string) => {
    return url.split('?')[0].replace(/\/$/, '') + '/';
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  // Load Instagram embed when lightbox opens
  useEffect(() => {
    if (!open || !embedContainerRef.current) return;

    const container = embedContainerRef.current;
    const cleanUrl = getCleanUrl(instagramUrl);

    // Insert blockquote that Instagram's embed.js will process
    container.innerHTML = `
      <blockquote
        class="instagram-media"
        data-instgrm-captioned
        data-instgrm-permalink="${cleanUrl}"
        style="background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 0 auto; max-width:540px; min-width:326px; padding:0; width:calc(100% - 2px);"
      >
      </blockquote>
    `;

    // Watch for Instagram to process the blockquote into an iframe
    const observer = new MutationObserver(() => {
      if (container.querySelector('iframe')) {
        setEmbedLoaded(true);
        observer.disconnect();
      }
    });
    observer.observe(container, { childList: true, subtree: true });

    // Load or re-process Instagram embed script
    const win = window as any;
    if (win.instgrm?.Embeds) {
      win.instgrm.Embeds.process();
    } else {
      const script = document.createElement('script');
      script.src = 'https://www.instagram.com/embed.js';
      script.async = true;
      script.onload = () => {
        if (win.instgrm?.Embeds) {
          win.instgrm.Embeds.process();
        }
      };
      document.body.appendChild(script);
    }

    return () => {
      container.innerHTML = '';
      observer.disconnect();
      setEmbedLoaded(false);
    };
  }, [open, instagramUrl]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-white">
            <Instagram className="h-5 w-5 text-pink-400" />
            <h3 className="font-semibold text-lg truncate max-w-[300px]">{exerciseName}</h3>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Instagram Embed Container */}
        <div className="rounded-xl overflow-hidden shadow-2xl bg-white p-2">
          {!embedLoaded && (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Chargement du post Instagram...</p>
              </div>
            </div>
          )}
          <div ref={embedContainerRef} />
        </div>

        {/* Footer hint */}
        <p className="text-center text-white/40 text-xs mt-3">
          Echap ou cliquez en dehors pour fermer
        </p>
      </div>
    </div>
  );
}
