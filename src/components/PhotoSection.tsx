import React from 'react';
import styled from 'styled-components';

interface PhotoSectionProps {
  video?: string;
  photo?: string;
  fallbackImage: string;
}

const PhotoSection: React.FC<PhotoSectionProps> = ({ video, photo, fallbackImage }) => {
  return (
    <PhotoSectionContainer>
      {video ? (
        <VideoContainer>
          <VideoElement
            autoPlay
            muted
            loop
            onError={(e) => {
              console.error('Error loading video:', video, e);
            }}
          >
            <source src={video} type="video/mp4" />
            Tu navegador no soporta videos.
          </VideoElement>
        </VideoContainer>
      ) : photo ? (
        <ProfileImage
          src={photo}
          alt="Foto de perfil"
          onError={(e) => {
            console.error('Error loading image:', photo, e);
          }}
        />
      ) : (
        <ProfileImage src={fallbackImage} alt="Imagen de respaldo" />
      )}
    </PhotoSectionContainer>
  );
};

const PhotoSectionContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px 0;
  background-color: oklch(100% 0 0);
  position: relative;
`;

const VideoContainer = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  border: 5px solid oklch(100% 0 0);
  box-shadow: 0 4px 15px oklch(0% 0 0 / 0.1);
`;

const VideoElement = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ProfileImage = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 5px solid oklch(100% 0 0);
  box-shadow: 0 4px 15px oklch(0% 0 0 / 0.1);
  transition: transform 0.3s ease;
`;

export default PhotoSection;