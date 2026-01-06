import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function VideoGuideCard({ guide }) {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden cursor-pointer hover:border-[#61f7a2] transition-all"
        onClick={() => setShowVideo(true)}
      >
        <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200">
          {guide.thumbnail ? (
            <img src={guide.thumbnail} alt={guide.title} className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={cn("w-16 h-16 rounded-full flex items-center justify-center", guide.color)}>
                <guide.icon className="w-8 h-8 text-white" />
              </div>
            </div>
          )}
          
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-all">
              <Play className="w-8 h-8 text-[#61f7a2] ml-1" />
            </div>
          </div>

          <div className="absolute bottom-3 left-3 bg-[#61f7a2] text-white text-xs font-semibold px-3 py-1 rounded-full">
            {guide.duration}
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-bold text-gray-900 mb-1">{guide.title}</h3>
          <p className="text-sm text-gray-600">{guide.description}</p>
        </div>
      </motion.div>

      {/* Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowVideo(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-900">{guide.title}</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowVideo(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="aspect-video bg-black">
              {guide.videoUrl ? (
                <iframe
                  src={guide.videoUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Vidéo à venir...</p>
                    <p className="text-sm opacity-70 mt-2">Cette vidéo sera bientôt disponible</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}