import React, { useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { cn } from '@/utils/misc';
import { Icon } from '@/components/ui/icon';

interface QRSectionProps {
  qrValue: string;
  logo: string;
  color: string;
}

const QRSection: React.FC<QRSectionProps> = ({ qrValue, logo, color }) => {
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (qrRef.current) {
      qrRef.current.innerHTML = '';

      const qrCode = new QRCodeStyling({
        width: 230,
        height: 230,
        data: qrValue,
        margin: 8,
        dotsOptions: {
          color: color,
          type: 'dots',
        },
        cornersSquareOptions: {
          color: color,
          type: 'extra-rounded',
        },
        cornersDotOptions: {
          color: color,
          type: 'dot',
        },
        backgroundOptions: {
          color: 'none',
        },
        qrOptions: {
          typeNumber: 0,
          mode: 'Byte',
          errorCorrectionLevel: 'H',
        },
        imageOptions: {
          crossOrigin: 'anonymous',
          imageSize: 0.5,
          hideBackgroundDots: true,
        },
        image: logo,
      });

      qrCode.append(qrRef.current);
    }
  }, [qrValue, logo, color]);

  return (
    <div className="flex flex-col items-center justify-center text-center gap-2.5 transition-all duration-300 group">
      <div
        ref={qrRef}
        className="flex justify-center items-center text-center bg-white rounded-xl [&_svg]:rounded-md [&_canvas]:rounded-md [&_svg]:max-w-full [&_svg]:h-auto [&_canvas]:max-w-full [&_canvas]:h-auto group-hover:brightness-105 transition-all"
      />

      <a
        href={qrValue}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full",
          "text-sm font-bold shadow-md whitespace-nowrap mt-2 no-underline",
          "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:text-primary-foreground"
        )}
      >
        <Icon name="message-circle" className="w-4 h-4 mr-1" />
        Iniciar conversación
      </a>
    </div>
  );
};

export default QRSection;