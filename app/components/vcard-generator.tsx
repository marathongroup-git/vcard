import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import VCard from 'vcard-creator';
import { employees, Employee } from '../data/employees';
import PhotoSection from './photo-section';
import QRSection from './qr-section';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { Container } from './ui/container';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

const LOGO_URL = `${process.env.PUBLIC_URL}/favicons/marathon-logo.png`;
const LOGO_QR = `${process.env.PUBLIC_URL}/favicons/marathon-group-logo.png`;

const bgStyle = {
  backgroundColor: '#f4f4f5',
  backgroundImage: `radial-gradient(circle at 0% 0%, rgba(200, 0, 0, 0.08) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(200, 0, 0, 0.05) 0%, transparent 50%), linear-gradient(to right, rgba(0, 0, 0, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 1px, transparent 1px)`,
  backgroundSize: '100% 100%, 100% 100%, 32px 32px, 32px 32px',
  backgroundAttachment: 'fixed'
};

const VCardGenerator = () => {
  const [searchParams] = useSearchParams();
  const [contact, setContact] = useState<Employee | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const getParam = (key: string) => {
      return searchParams.get(key) || new URLSearchParams(window.location.search).get(key);
    };

    const employeeId = getParam('id');

    if (employeeId) {
      const foundEmployee = employees.find(emp => emp.id === employeeId);

      if (foundEmployee) {
        setContact({
          ...foundEmployee,
          photo: `${process.env.PUBLIC_URL}/${foundEmployee.photo}`,
          video: foundEmployee.video ? `${process.env.PUBLIC_URL}/${foundEmployee.video}` : undefined,
        });
        setNotFound(false);
        document.title = `${foundEmployee.firstName} ${foundEmployee.lastName} - Contacto`;
      } else {
        setNotFound(true);
        document.title = 'Colaborador no encontrado';
      }
    } else {
      const urlEmail = getParam('email');
      const urlPhone = getParam('phone');
      let matchedEmployee: Employee | undefined;

      if (urlEmail || urlPhone) {
        const cleanUrlPhone = urlPhone ? urlPhone.replace(/\D/g, '') : '';

        matchedEmployee = employees.find(emp => {
          const matchEmail = urlEmail && emp.email && emp.email.toLowerCase() === urlEmail.toLowerCase();
          const cleanEmpPhone = emp.phone ? emp.phone.replace(/\D/g, '') : '';
          const matchPhone = cleanUrlPhone.length > 6 && cleanEmpPhone === cleanUrlPhone;

          return matchEmail || matchPhone;
        });
      }

      if (matchedEmployee) {
        setContact({
          ...matchedEmployee,
          photo: `${process.env.PUBLIC_URL}/${matchedEmployee.photo}`,
          video: matchedEmployee.video ? `${process.env.PUBLIC_URL}/${matchedEmployee.video}` : undefined,
        });
        setNotFound(false);
        document.title = `${matchedEmployee.firstName} ${matchedEmployee.lastName} - Contacto`;
      } else {
        const firstName = getParam('firstName');
        const lastName = getParam('lastName');

        if (firstName || lastName) {
          setContact({
            id: 'legacy-contact',
            firstName: firstName || '',
            lastName: lastName || '',
            company: getParam('company') || '',
            jobTitle: getParam('jobTitle') || '',
            email: getParam('email') || '',
            phone: getParam('phone') || '',
            officePhone: getParam('officePhone') || '',
            extension: getParam('extension') || '',
            website: getParam('website') || '',
            photo: getParam('photo') || '',
            note: getParam('note') || undefined,
          });
          setNotFound(false);
          document.title = `${firstName} ${lastName} - Contacto`;
        } else {
          setNotFound(false);
          document.title = 'Tarjetas Digitales Marathon';
        }
      }
    }
  }, [searchParams]);

  const generateVCard = async () => {
    if (!contact) return;
    const vcard = new VCard();
    vcard.addName(contact.lastName || '', contact.firstName || '');
    if (contact.company) vcard.addCompany(contact.company);
    if (contact.jobTitle) vcard.addJobtitle(contact.jobTitle);
    if (contact.email) vcard.addEmail(contact.email);

    if (contact.phone) vcard.addPhoneNumber(contact.phone, 'CELL');

    if (contact.officePhone) {
      vcard.addPhoneNumber(contact.officePhone, 'WORK');
    }

    if (contact.website) vcard.addURL(contact.website);

    const noteParts = [];
    if (contact.extension) noteParts.push(`Ext: ${contact.extension}`);
    if (contact.note) noteParts.push(contact.note);

    if (noteParts.length > 0) vcard.addNote(noteParts.join('\n'));

    if (contact.photo) {
      try {
        const response = await fetch(contact.photo);
        const blob = await response.blob();

        const img = new Image();
        img.src = URL.createObjectURL(blob);
        await new Promise((resolve) => (img.onload = resolve));

        const maxWidth = 300;
        const maxHeight = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        const base64 = dataUrl.split(',')[1];

        console.log('vCard Image Size:', Math.round(base64.length / 1024), 'KB');
        vcard.addPhoto(base64, 'JPEG');
      } catch (error) {
        console.error('Error embedding photo in vCard:', error);
      }
    }

    const vcardString = vcard.toString();

    const blob = new Blob([vcardString], { type: 'text/x-vcard' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${contact.firstName || 'contact'}_${contact.lastName || 'vcard'}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const formatPhoneNumber = (phone: string | undefined): string => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.startsWith('52') ? cleaned : `52${cleaned}`;
  };

  if (notFound) {
    return (
      <div className="min-h-screen flex justify-center items-center p-5 max-md:p-2.5 font-sans" style={bgStyle}>
        <Container className="max-w-[800px]">
          <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 border-0 ring-0 text-center py-10">
            <CardContent className="flex flex-col items-center gap-3">
              <CardTitle className="text-[32px] max-sm:text-[26px] font-extrabold leading-tight">Perfil no disponible</CardTitle>
              <div className="text-muted-foreground text-base leading-relaxed">
                <p>La tarjeta que intentas consultar no existe o el enlace es incorrecto.</p>
                <p>Por favor verifica la dirección URL.</p>
              </div>
            </CardContent>
          </Card>
        </Container>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="min-h-screen flex justify-center items-center p-5 max-md:p-2.5 font-sans" style={bgStyle}>
        <Container className="max-w-[800px]">
          <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 border-0 ring-0 text-center pb-6">
            <CardHeader className="flex items-center justify-center pt-8 pb-4">
              <img className="h-[90px] w-auto object-contain" src={LOGO_URL} alt="Logotipo de Marathon Group" />
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <CardTitle className="text-[32px] max-sm:text-[26px] font-extrabold leading-tight">Tarjetas Digitales</CardTitle>
              <div className="text-muted-foreground text-base leading-relaxed">
                <p>Bienvenido al sistema de tarjetas de contacto de Marathon Group.</p>
                <p>Por favor utiliza el enlace personalizado o escanea el código QR de un colaborador.</p>
              </div>
            </CardContent>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-center p-5 max-md:p-2.5 font-sans" style={bgStyle}>
      <Container className="max-w-[800px]">
        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 border-0 ring-0 relative overflow-hidden">
          {/* Fondo decorativo (blobs) */}
          <div className="absolute right-0 top-0 w-[140px] h-[140px] max-md:w-[100px] max-md:h-[100px] bg-primary rounded-bl-full z-0"></div>
          <div className="absolute left-0 bottom-0 w-[250px] h-[100px] max-md:w-[120px] max-md:h-[60px] bg-primary rounded-tr-full z-0"></div>

          <CardHeader className="relative z-10 flex items-center justify-center pt-8 pb-4">
            <img className="h-[90px] w-auto max-w-[300px] object-contain" src={LOGO_URL} alt="Marathon Group" />
          </CardHeader>

          <CardContent className="relative z-10 flex flex-col gap-6 px-8 max-md:px-4">
            {/* PROFILE ROW: foto+info izquierda, QR derecha */}
            <div className="grid grid-cols-2 max-md:grid-cols-1 items-center gap-8 max-md:gap-6">
              <div className="flex flex-col items-center gap-4 w-full pr-5 max-md:pr-0">
                <div className="relative inline-block shrink-0 self-center mb-2">
                  <PhotoSection
                    video={contact.video}
                    photo={contact.photo}
                    fallbackImage={`${process.env.PUBLIC_URL}/fallback-image.jpg`}
                    employeeId={contact.id}
                  />
                  <div className="absolute bottom-2 right-3 w-[18px] h-[18px] bg-primary border-[3px] border-background rounded-full shadow-md"></div>
                </div>
                <div className="flex flex-col items-start max-md:items-center text-left max-md:text-center gap-2 pt-1 w-max max-w-full">
                  <h1 className="m-0 text-foreground text-[32px] max-sm:text-[26px] leading-tight">
                    {contact.firstName && <span className="font-semibold">{contact.firstName}</span>}
                    {contact.firstName && contact.lastName && <br />}
                    {contact.lastName && <span className="font-extrabold">{contact.lastName}</span>}
                    {!contact.firstName && !contact.lastName && 'Nombre no proporcionado'}
                  </h1>
                  <div className="w-[70px] h-[3px] bg-primary rounded-sm self-start max-md:self-center my-1"></div>
                  {contact.jobTitle && <h2 className="m-0 text-muted-foreground text-base font-medium leading-relaxed mt-2">{contact.jobTitle}</h2>}

                  <div className="inline-flex items-center self-center max-md:self-center gap-2.5 bg-primary/10 text-primary font-bold text-sm py-2 px-4 rounded-xl mt-4">
                    <Icon name="building-2" className="w-[18px] h-[18px]" />
                    <span>{contact.company || 'Marathon Group'}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center gap-5 bg-background rounded-[24px] p-5 w-full max-w-[360px] min-h-[420px] max-md:min-h-auto mx-auto shadow-lg border border-border">
                <QRSection
                  qrValue={`https://wa.me/${formatPhoneNumber(contact.phone)}`}
                  logo={LOGO_QR}
                  color="#C80000"
                />
                <div className="flex items-center gap-3 mt-1">
                  <Icon name="smartphone" className="w-6 h-6 text-primary" />
                  <p className="m-0 text-xs text-muted-foreground text-left leading-relaxed">
                    Escanea el código o<br /><strong className="text-foreground font-bold">toca para conversar</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* CONTACT BAR: íconos SVG en columnas */}
            <div className="bg-background p-6 flex items-stretch justify-center rounded-[24px] max-md:p-4 max-md:flex-wrap max-md:gap-3 shadow-lg border border-border">
              {contact.email && (
                <a className="flex flex-col items-center justify-start gap-2 px-4 max-md:px-2 flex-1 max-md:min-w-[40%] text-inherit no-underline transition-transform hover:-translate-y-0.5 cursor-pointer" href={`mailto:contacto@marathongroup.mx`}>
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-1 text-primary">
                    <Icon name="mail" className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-foreground text-center">Correo</div>
                  <div className="text-xs font-normal text-muted-foreground text-center break-words">contacto@marathongroup.mx</div>
                </a>
              )}
              {contact.email && (contact.phone || contact.officePhone) && <div className="w-[1px] bg-border self-stretch mx-2 max-md:hidden"></div>}

              {(contact.phone || contact.officePhone) && (
                <a className="flex flex-col items-center justify-start gap-2 px-4 max-md:px-2 flex-1 max-md:min-w-[40%] text-inherit no-underline transition-transform hover:-translate-y-0.5 cursor-pointer" href={`tel:${contact.phone || contact.officePhone}`}>
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-1 text-primary">
                    <Icon name="phone" className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-foreground text-center">Teléfono</div>
                  <div className="text-xs font-normal text-muted-foreground text-center break-words">{contact.phone || contact.officePhone}</div>
                </a>
              )}

              {contact.website && (
                <>
                  {((contact.phone || contact.officePhone) || contact.email) && <div className="w-[1px] bg-border self-stretch mx-2 max-md:hidden"></div>}
                  <a className="flex flex-col items-center justify-start gap-2 px-4 max-md:px-2 flex-1 max-md:min-w-[40%] text-inherit no-underline transition-transform hover:-translate-y-0.5 cursor-pointer" href={contact.website} target="_blank" rel="noopener noreferrer">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-1 text-primary">
                      <Icon name="globe" className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-bold text-foreground text-center">Sitio web</div>
                    <div className="text-xs font-normal text-muted-foreground text-center break-words">marathongroup.mx</div>
                  </a>
                </>
              )}

              {contact.company && (
                <>
                  {(contact.website || contact.phone || contact.officePhone || contact.email) && <div className="w-[1px] bg-border self-stretch mx-2 max-md:hidden"></div>}
                  <a className="flex flex-col items-center justify-start gap-2 px-4 max-md:px-2 flex-1 max-md:min-w-[40%] text-inherit no-underline transition-transform hover:-translate-y-0.5 cursor-pointer" href="https://maps.app.goo.gl/STS1zNa9CGzkhm347" target="_blank" rel="noopener noreferrer">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-1 text-primary">
                      <Icon name="map-pin" className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-semibold text-foreground text-center">Ubicación</div>
                    <div className="text-xs font-normal text-muted-foreground text-center break-words">{contact.company}</div>
                  </a>
                </>
              )}
            </div>

            {/* Sobre mi & Conectemos */}
            <div className="flex flex-col gap-8 px-2 max-md:px-0">
              {contact.note && (
                <div className="flex gap-4 items-start">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                    <Icon name="user" className="w-5 h-5 text-current" />
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <h3 className="m-0 text-primary text-[17px] font-bold text-left">Sobre mí</h3>
                    <p className="m-0 text-muted-foreground text-sm leading-relaxed text-justify">{contact.note}</p>
                  </div>
                </div>
              )}

              <div className="flex flex-col items-center w-full gap-5">
                <div className="flex items-center w-full gap-4">
                  <div className="flex-1 h-[1px] bg-primary/20"></div>
                  <h3 className="m-0 text-foreground text-base font-bold text-center">Conectemos</h3>
                  <div className="flex-1 h-[1px] bg-primary/20"></div>
                </div>
                <div className="flex gap-4 items-center justify-center flex-wrap">
                  <a className="inline-flex items-center justify-center w-11 h-11 rounded-full border-none bg-primary/10 text-primary no-underline transition-all hover:bg-primary/20 hover:-translate-y-0.5 hover:shadow-md cursor-pointer" href="https://www.linkedin.com/company/marathongroup-mexico/about/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                    <Icon name="linkedin" className="w-5 h-5" />
                  </a>
                  <a className="inline-flex items-center justify-center w-11 h-11 rounded-full border-none bg-primary/10 text-primary no-underline transition-all hover:bg-primary/20 hover:-translate-y-0.5 hover:shadow-md cursor-pointer" href="https://www.facebook.com/MarathonGroupMexico/?locale=es_LA" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <Icon name="facebook" className="w-5 h-5" />
                  </a>
                  <a className="inline-flex items-center justify-center w-11 h-11 rounded-full border-none bg-primary/10 text-primary no-underline transition-all hover:bg-primary/20 hover:-translate-y-0.5 hover:shadow-md cursor-pointer" href="https://www.instagram.com/marathongroupmx/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <Icon name="instagram" className="w-5 h-5" />
                  </a>
                  {contact.email && (
                    <a className="inline-flex items-center justify-center w-11 h-11 rounded-full border-none bg-primary/10 text-primary no-underline transition-all hover:bg-primary/20 hover:-translate-y-0.5 hover:shadow-md cursor-pointer" href={`mailto:contacto@marathongroup.mx`} aria-label="Email">
                      <Icon name="mail" className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="relative z-10 flex flex-col items-center gap-3 pt-6 pb-8 border-t border-border mt-2 bg-transparent">
            <Button
              size="lg"
              onClick={generateVCard}
              disabled={isSaved}
              className="rounded-full font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 px-9 h-12 text-base"
            >
              <Icon name="download" className="w-5 h-5 mr-2" />
              Guardar contacto
            </Button>
            <p className="m-0 text-xs text-muted-foreground italic tracking-wide">Guarda mi información en tu agenda</p>
          </CardFooter>
        </Card>
      </Container>
    </div>
  );
};

export default VCardGenerator;
