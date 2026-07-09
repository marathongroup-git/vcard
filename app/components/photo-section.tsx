import React from 'react';
import { cn } from '@/utils/misc';

interface PhotoSectionProps {
  video?: string;
  photo?: string;
  fallbackImage: string;
  employeeId?: string;
}

const PhotoSection: React.FC<PhotoSectionProps> = ({ video, photo, fallbackImage, employeeId }) => {
  const isChernandez = employeeId === 'chernandez';

  const commonMediaClasses = "w-[160px] h-[160px] rounded-full object-cover border-4 border-white shadow-xl transition-transform duration-300 ease-in-out";

  return (
    <div className="flex justify-center items-center relative">
      {video ? (
        <div className={cn("relative overflow-hidden w-[160px] h-[160px] rounded-full border-4 border-white shadow-xl")}>
          <video
            autoPlay
            muted
            loop
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Error loading video:', video, e);
            }}
          >
            <source src={video} type="video/mp4" />
            Tu navegador no soporta videos.
          </video>
        </div>
      ) : photo ? (
        <img
          src={photo}
          alt="Foto de perfil"
          className={cn(
            commonMediaClasses,
            isChernandez && "object-[center_10%] mt-0"
          )}
          onError={(e) => {
            console.error('Error loading image:', photo, e);
          }}
        />
      ) : (
        <img
          src={fallbackImage}
          alt="Imagen de respaldo"
          className={commonMediaClasses}
        />
      )}
    </div>
  );
};

export default PhotoSection;