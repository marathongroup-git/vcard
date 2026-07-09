import { useState, useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { employees } from '@/data/employees';
import { Container } from '@/components/ui/container';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/utils/misc';

const LOGO_URL = `${process.env.PUBLIC_URL}/favicons/marathon-logo.png`;
const QR_LOGO = `${process.env.PUBLIC_URL}/favicons/marathon-group-logo.png`;

// Helper to get the primary color from Tailwind/CSS for the canvas-based QR code
const getPrimaryColor = () => '#C80000';

const LinkGenerator = () => {
  const [selectedId, setSelectedId] = useState<string>('');
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<QRCodeStyling | null>(null);

  const basePath = process.env.NODE_ENV === 'production' ? process.env.PUBLIC_URL : '';
  const appRoot = window.location.origin + basePath;
  const generatedUrl = selectedId ? `${appRoot}/#/?id=${selectedId}` : '';

  useEffect(() => {
    document.title = 'Generador de QR - Marathon Group';
  }, []);

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
        color: getPrimaryColor(),
        type: 'dots',
      },
      cornersSquareOptions: {
        color: getPrimaryColor(),
        type: 'extra-rounded',
      },
      cornersDotOptions: {
        color: getPrimaryColor(),
        type: 'dot',
      },
      backgroundOptions: {
        color: 'transparent',
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

      const url = URL.createObjectURL(blob as Blob);
      const link = document.createElement('a');
      link.download = `vcard-${employee.id}-${employee.firstName}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
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
          color: getPrimaryColor(),
          type: 'dots',
        },
        cornersSquareOptions: {
          color: getPrimaryColor(),
          type: 'extra-rounded',
        },
        cornersDotOptions: {
          color: getPrimaryColor(),
          type: 'dot',
        },
        backgroundOptions: {
          color: '#ffffff',
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

  const selectedEmployee = employees.find(e => e.id === selectedId);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="bg-card px-5 sm:px-10 py-4 border-b border-border flex items-center justify-center">
        <img className="h-10 object-contain" src={LOGO_URL} alt="Marathon Group" />
      </nav>

      <Container className="flex-1 flex justify-center items-start py-5 sm:py-10">
        <Card className="w-full max-w-[500px] shadow-xl border-border/50 overflow-visible">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-extrabold tracking-tight">Generador de QR</CardTitle>
            <CardDescription className="text-sm">Selecciona un colaborador para generar su código</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="w-full mb-6">
              <label htmlFor="employee-select" className="block font-bold mb-2 text-foreground text-sm ml-1">Colaborador</label>
              <div className="relative w-full">
                <Select value={selectedId} onValueChange={(val) => {
                  setSelectedId(val as string);
                  if (!val) qrCodeInstance.current = null;
                }}>
                  <SelectTrigger className="w-full h-14 rounded-2xl border-2 border-border bg-muted/30 px-5 text-base transition-all hover:border-border-secondary hover:bg-background">
                    {selectedEmployee ? (
                      <div className="flex items-center gap-3">
                        {selectedEmployee.photo ? (
                          <img
                            className="w-8 h-8 rounded-full object-cover border border-border"
                            src={selectedEmployee.photo.startsWith('http') || selectedEmployee.photo.startsWith('/') ? selectedEmployee.photo : `${process.env.PUBLIC_URL}/${selectedEmployee.photo}`}
                            alt=""
                            onError={(e) => e.currentTarget.style.display = 'none'}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                            {selectedEmployee.firstName[0]}{selectedEmployee.lastName[0]}
                          </div>
                        )}
                        <span className="font-medium text-foreground">{selectedEmployee.firstName} {selectedEmployee.lastName}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-- Seleccionar colaborador --</span>
                    )}
                  </SelectTrigger>
                  <SelectContent className="max-h-[350px]">
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id} className="py-2">
                        <div className="flex items-center gap-3">
                          {emp.photo ? (
                            <img
                              className="w-8 h-8 rounded-full object-cover border border-border"
                              src={emp.photo.startsWith('http') || emp.photo.startsWith('/') ? emp.photo : `${process.env.PUBLIC_URL}/${emp.photo}`}
                              alt=""
                              onError={(e) => e.currentTarget.style.display = 'none'}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                              {emp.firstName[0]}{emp.lastName[0]}
                            </div>
                          )}
                          <div className="flex flex-col text-left">
                            <div className="font-semibold text-sm">{emp.firstName} {emp.lastName}</div>
                            <div className="text-xs text-muted-foreground">{emp.jobTitle}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedId && selectedEmployee && (
              <div className="flex flex-col items-center w-full animate-in fade-in slide-in-from-bottom-4">
                <div className="text-center mb-5">
                  <h3 className="m-0 text-primary text-xl font-bold">{selectedEmployee.firstName} {selectedEmployee.lastName}</h3>
                  <p className="mt-1 mb-0 text-muted-foreground text-sm font-medium">{selectedEmployee.jobTitle}</p>
                </div>

                <div className="bg-white p-5 rounded-[20px] shadow-sm border border-border mb-6">
                  <div className="[&>div>canvas]:max-w-full [&>div>canvas]:block" ref={qrRef} />
                </div>

                <div className="flex max-[400px]:flex-col gap-4 w-full">
                  <a
                    className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), "flex-1 h-14 rounded-xl border-2")}
                    href={generatedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon name="link" className="w-4 h-4 mr-2" /> Abrir Tarjeta
                  </a>
                  <Button
                    size="lg"
                    className="flex-1 h-14 rounded-xl shadow-lg shadow-primary/25"
                    onClick={onDownload}
                  >
                    <Icon name="download" className="w-4 h-4 mr-2" /> Descargar PNG
                  </Button>
                </div>
                <div className="mt-6 p-2.5 bg-muted/50 rounded-lg text-[11px] text-muted-foreground font-mono break-all text-center w-full border border-dashed border-border">
                  {generatedUrl}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};

export default LinkGenerator;
