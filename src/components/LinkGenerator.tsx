import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import QRCodeStyling from 'qr-code-styling';
import { employees } from '../data/employees';

const COLORS = {
  marathonRed: 'oklch(48.8% 0.211 26.4)',
  darkText: 'oklch(14% 0 0)',
  lightGray: 'oklch(96.8% 0 0)',
  cardBg: 'oklch(100% 0 0)',
  borderColor: 'oklch(89.6% 0 0)',
};

const LOGO_URL = 'https://marathongroup-git.github.io/vcard/logo.png';
const QR_LOGO = `${process.env.PUBLIC_URL}/favicons/marathon-group-logo.png`;

const LinkGenerator = () => {
  const [selectedId, setSelectedId] = useState<string>('');
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<QRCodeStyling | null>(null);

  const basePath = process.env.NODE_ENV === 'production' ? process.env.PUBLIC_URL : '';
  const appRoot = window.location.origin + basePath;
  // Use hash-based URL structure
  const generatedUrl = selectedId ? `${appRoot}/#/?id=${selectedId}` : '';

  const onDownload = async () => {
    if (!selectedId) return;

    const employee = employees.find(e => e.id === selectedId);
    if (!employee) return;
    const tempQr = new QRCodeStyling({
      width: 1000,
      height: 1000,
      data: generatedUrl,
      margin: 20,
      dotsOptions: {
        color: COLORS.marathonRed,
        type: 'dots',
      },
      cornersSquareOptions: {
        color: COLORS.marathonRed,
        type: 'extra-rounded',
      },
      cornersDotOptions: {
        color: COLORS.marathonRed,
        type: 'dot',
      },
      backgroundOptions: {
        color: 'oklch(0% 0 0)',
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        imageSize: 0.4,
        hideBackgroundDots: true,
        margin: 10
      },
      image: QR_LOGO,
    });

    try {
        const blob = await tempQr.getRawData('png');
        if (!blob) return;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = URL.createObjectURL(blob as Blob);
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            
            const qrSize = 1000;
            const padding = 100;
            const textSectionHeight = 400;
            
            canvas.width = qrSize + (padding * 2);
            canvas.height = qrSize + (padding * 2) + textSectionHeight;
            
            ctx.fillStyle = 'oklch(0% 0 0)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.drawImage(img, padding, padding, qrSize, qrSize);
            
            ctx.textAlign = 'center';
            
            ctx.font = 'bold 70px "Segoe UI", Arial, sans-serif'; 
            ctx.fillStyle = 'oklch(100% 0 0)';
            ctx.fillText(`${employee.firstName} ${employee.lastName}`, canvas.width / 2, qrSize + padding + 150);
            
            ctx.font = '40px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = 'oklch(84.8% 0 0)';
            ctx.fillText(employee.jobTitle.toUpperCase(), canvas.width / 2, qrSize + padding + 230);

            ctx.font = '30px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = COLORS.marathonRed;
            ctx.fillText("www.marathongroup.mx", canvas.width / 2, qrSize + padding + 320);
            
            const link = document.createElement('a');
            link.download = `vcard-${employee.id}-${employee.firstName}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            URL.revokeObjectURL(img.src);
        };
    } catch (err) {
        console.error("Error generating QR for download", err);
    }
  };

  useEffect(() => {
    if (!selectedId || !qrRef.current) return;

    if (!qrCodeInstance.current) {
        qrCodeInstance.current = new QRCodeStyling({
            width: 300,
            height: 300,
            data: generatedUrl,
            margin: 10,
            dotsOptions: {
              color: COLORS.marathonRed,
              type: 'dots',
            },
            cornersSquareOptions: {
              color: COLORS.marathonRed,
              type: 'extra-rounded', 
            },
            cornersDotOptions: {
              color: COLORS.marathonRed,
              type: 'dot',
            },
            backgroundOptions: {
              color: 'oklch(100% 0 0)',
            },
            imageOptions: {
              crossOrigin: 'anonymous',
              imageSize: 0.5,
              hideBackgroundDots: true,
            },
            image: QR_LOGO,
          });
        qrRef.current.innerHTML = '';
        qrCodeInstance.current.append(qrRef.current);
    } else {
        qrCodeInstance.current.update({
            data: generatedUrl
        });
    }
  }, [generatedUrl, selectedId]);

  return (
    <PageWrapper>
      <Card>
        <Logo src={LOGO_URL} alt="Marathon Group Logo" />
        <Title>Generador de QR</Title>
        
        <FormControl>
          <Label htmlFor="employee-select">Selecciona un empleado:</Label>
          <SelectWrapper>
            <Select 
              id="employee-select" 
              value={selectedId} 
              onChange={(e) => {
                  setSelectedId(e.target.value);
                  if (!e.target.value) {
                      qrCodeInstance.current = null;
                  }
              }}
            >
              <option value="">-- Buscar por nombre... --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName}
                </option>
              ))}
            </Select>
          </SelectWrapper>
        </FormControl>

        {selectedId && (
          <ResultCard>
            <QRContainerInternal ref={qrRef} />
            <LinkButton href={generatedUrl} target="_blank" rel="noopener noreferrer">
              Abrir Tarjeta
            </LinkButton>
            <DownloadButton onClick={onDownload}>
              Descargar QR
            </DownloadButton>
            <UrlText>{generatedUrl}</UrlText>
          </ResultCard>
        )}
      </Card>
    </PageWrapper>
  );
};

export default LinkGenerator;

const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: ${COLORS.lightGray};
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Card = styled.div`
  background-color: ${COLORS.cardBg};
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 480px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (max-width: 500px) {
    padding: 30px 20px;
  }
`;

const Logo = styled.img`
  max-width: 200px;
  height: auto;
  margin-bottom: 40px;
`;

const Title = styled.h2`
  color: ${COLORS.marathonRed};
  font-size: 24px;
  margin: 0 0 30px 0;
  text-align: center;
  font-weight: 700;
`;

const FormControl = styled.div`
  width: 100%;
  margin-bottom: 30px;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 10px;
  color: ${COLORS.darkText};
  font-size: 14px;
`;

const SelectWrapper = styled.div`
  position: relative;
  &::after {
    content: "▼";
    font-size: 0.8rem;
    top: 50%;
    right: 15px;
    transform: translateY(-50%);
    position: absolute;
    color: ${COLORS.marathonRed};
    pointer-events: none;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 14px 20px;
  font-size: 16px;
  border-radius: 12px;
  border: 2px solid ${COLORS.borderColor};
  background-color: oklch(100% 0 0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  cursor: pointer;
  color: ${COLORS.darkText};
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  font-weight: 500;
  box-shadow: 0 2px 5px rgba(0,0,0,0.02);

  &:hover {
    border-color: oklch(74.3% 0 0);
    box-shadow: 0 4px 8px rgba(0,0,0,0.05);
  }

  &:focus {
    border-color: ${COLORS.marathonRed};
    box-shadow: 0 0 0 4px oklch(48.8% 0.211 26.4 / 0.1);
  }
`;

const ResultCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 25px;
  background-color: oklch(98.5% 0 0);
  border-radius: 16px;
  border: 1px dashed ${COLORS.borderColor};
  animation: fadeIn 0.5s ease-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const LinkButton = styled.a`
  display: block;
  margin-top: 20px;
  padding: 12px 24px;
  background-color: ${COLORS.marathonRed};
  color: white;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
  transition: background-color 0.2s, transform 0.1s;
  text-align: center;
  width: 100%;
  box-sizing: border-box;
  box-shadow: 0 4px 6px rgba(200, 16, 46, 0.2);

  &:hover {
    background-color: oklch(42% 0.18 26.4);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(200, 16, 46, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const DownloadButton = styled.button`
  display: block;
  margin-top: 10px;
  padding: 12px 24px;
  background-color: transparent;
  color: ${COLORS.marathonRed};
  border: 2px solid ${COLORS.marathonRed};
  border-radius: 50px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  width: 100%;
  box-sizing: border-box;

  &:hover {
    background-color: oklch(48.8% 0.211 26.4 / 0.05);
    transform: translateY(-2px);
  }
`;

const UrlText = styled.p`
  margin-top: 15px;
  font-size: 12px;
  color: oklch(60.5% 0 0);
  word-break: break-all;
  text-align: center;
  max-width: 100%;
`;

const QRContainerInternal = styled.div`
  & > div > canvas {
    max-width: 100%;
  }
`;
