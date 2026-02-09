import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import VCard from 'vcard-creator';
import { employees, Employee } from '../data/employees';
import PhotoSection from './PhotoSection';
import QRSection from './QRSection';

const LOGO_URL = `${process.env.PUBLIC_URL}/favicons/marathon-logo.png`
const LOGO_QR = `${process.env.PUBLIC_URL}/favicons/marathon-group-logo.png`;
const COLORS = {
  marathonRed: 'oklch(48.8% 0.211 26.4)',
}

const VCardGenerator = () => {
  const [searchParams] = useSearchParams();
  const [contact, setContact] = useState<Employee | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const employeeId = searchParams.get('id');

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
      // Soporte para URLs antiguas (Legacy) que pasan parámetros por query string
      const firstName = searchParams.get('firstName');
      const lastName = searchParams.get('lastName');

      if (firstName || lastName) {
        setContact({
          id: 'legacy-contact',
          firstName: firstName || '',
          lastName: lastName || '',
          company: searchParams.get('company') || '',
          jobTitle: searchParams.get('jobTitle') || '',
          email: searchParams.get('email') || '',
          phone: searchParams.get('phone') || undefined,
          officePhone: searchParams.get('officePhone') || '',
          extension: searchParams.get('extension') || '',
          website: searchParams.get('website') || '',
          photo: searchParams.get('photo') || '',
          note: searchParams.get('note') || undefined,
        });
        setNotFound(false);
        document.title = `${firstName} ${lastName} - Contacto`;
      } else {
        setNotFound(false);

        document.title = 'Tarjetas Digitales Marathon';
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
    // WhatsApp API recomienda formato internacional SIN símbolo '+' (ej: 521234567890)
    return cleaned.startsWith('52') ? cleaned : `52${cleaned}`;
  };

  if (notFound) {
    return (
      <Container>
        <Card>
          <InfoSection>
            <Name>Perfil no disponible</Name>
            <Detail>La tarjeta que intentas consultar no existe o el enlace es incorrecto.</Detail>
            <Detail>Por favor verifica la dirección URL.</Detail>
          </InfoSection>
        </Card>
      </Container>
    );
  }

  if (!contact) {
    return (
      <Container>
        <Card>
          <LogoContainer>
             <Logo src={LOGO_URL} alt="Logotipo de Marathon Group" />
          </LogoContainer>
          <InfoSection>
            <Name>Tarjetas Digitales</Name>
            <Detail>Bienvenido al sistema de tarjetas de contacto de Marathon Group.</Detail>
            <Detail>Por favor utiliza el enlace personalizado o escanea el código QR de un colaborador.</Detail>
          </InfoSection>
        </Card>
      </Container>
    );
  }

  return (
    <>
      <Container>
        <Card>
          <LogoContainer>
            <Logo src={LOGO_URL} alt="Logotipo de Marathon Group" />
          </LogoContainer>

          <PhotoSection
            video={contact.video}
            photo={contact.photo}
            fallbackImage={`${process.env.PUBLIC_URL}/fallback-image.jpg`}
          />
          <ContentWrapper>
            <InfoSection>
              <Name>{`${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Nombre no proporcionado'}</Name>
              
              {contact.jobTitle && <JobTitle>{contact.jobTitle}</JobTitle>}

              {contact.company && <Detail><strong>{contact.company}</strong></Detail>}
              {contact.email && <Detail><a href={`mailto:${contact.email}`}>{contact.email}</a></Detail>}

              {contact.officePhone && (
                <Detail>
                  Oficina: <a href={`tel:${contact.officePhone}`}>{contact.officePhone}</a>
                  {contact.extension && <span> Ext. {contact.extension}</span>}
                </Detail>
              )}
              {contact.phone && <Detail>Celular: <a href={`tel:${contact.phone}`}>{contact.phone}</a></Detail>}
              {contact.website && (
                <Detail>
                  <a href={contact.website} target="_blank" rel="noopener noreferrer">
                    marathongroup.mx
                  </a>
                </Detail>
              )}
              {contact.note && <Note>{contact.note}</Note>}
            </InfoSection>

            <QRContainer>
              <QRSection
                qrValue={`https://wa.me/${formatPhoneNumber(contact.phone)}`}
                logo={LOGO_QR}
                color={COLORS.marathonRed}
              />
            </QRContainer>
          </ContentWrapper>

          <ActionSection>
            <SaveButton onClick={generateVCard} disabled={isSaved}>
              {isSaved ? '✓ Agregado' : 'Añadir a Contactos'}
            </SaveButton>
            <Hint>Descarga el perfil para guardarlo en tu agenda</Hint>
          </ActionSection>
        </Card>
      </Container>
    </>
  );
};
// Estilos
const Container = styled.div<{ color?: string }>`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, oklch(97.41% 0 0) 0%, oklch(91.04% 0 0) 100%);
  padding: 20px;
  font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: oklch(20% 0.05 240);
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px oklch(0% 0 0 / 20%);
  width: 100%;
  max-width: 800px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px oklch(0% 0 0 / 30%);
  }
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 30px 0;
  background-color: oklch(100% 0 0);
  border-bottom: ${COLORS.marathonRed} 1px solid;
`;

const Logo = styled.img`
  max-height: 60px;
  max-width: 200px;
  object-fit: contain;
`;


const InfoSection = styled.div`
  padding: 0 20px 0 0;
  flex: 1;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    padding: 0;
    align-items: center;
    text-align: center;
    gap: 15px;
  }
`;

const Name = styled.h1`
  margin: 0 0 10px 0;
  color: oklch(30% 0.05 240); 
  font-size: 28px;
  text-align: center;
`;

const JobTitle = styled.h2`
  margin: 0 0 15px 0;
  color: oklch(45% 0.05 240);
  font-size: 18px;
  font-weight: 500;
  text-align: center;
  border-bottom: 2px solid ${COLORS.marathonRed};
  padding-bottom: 15px;
  width: 100%;
`;

const Detail = styled.p`
  margin: 8px 0;
  color: oklch(40% 0.05 240);
  font-size: 16px;
  text-align: center;
  line-height: 1.5;

  a {
    color: ${COLORS.marathonRed};
    text-decoration: none;
    cursor: pointer;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
`;


const Note = styled.p`
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid ${COLORS.marathonRed};
  color: oklch(40% 0.02 240);
  font-style: italic;
  font-size: 14px;
  text-align: center;
`;



const QRCaption = styled.p`
  margin-top: 10px;
  font-size: 12px;
  color: oklch(50% 0.02 240);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const QRContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ActionSection = styled.div`
  padding: 25px;
  background-color: oklch(100% 0 0);
  text-align: center;
  border-top: 1px solid ${COLORS.marathonRed};
  border-top: 0.5px solid ${COLORS.marathonRed};
`;

const SaveButton = styled.button`
  background-color: ${COLORS.marathonRed};
  color: oklch(100% 0 0);
  border: none;
  padding: 14px 30px;
  font-size: 16px;
  border-radius: 50px;
  cursor: pointer;  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: bold;  box-shadow: 0 4px 10px oklch(0% 0 0 / 0.1);
  &:hover {
    filter: brightness(1.1);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px oklch(0% 0 0 / 0.15);
  }
  &:active {
    filter: brightness(0.9);
    transform: translateY(0);
  }
`;
const Hint = styled.p`
  margin-top: 15px;
  font-size: 13px;
  color: oklch(50% 0.02 240);
  font-style: italic;
`;

const ContentWrapper = styled.div`
  display: flex;
  gap: 35px;
  padding: 25px 30px;
  align-items: flex-start;
  justify-content: space-between;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
    padding: 20px;
    align-items: center;
    text-align: center;
  }
`;

export default VCardGenerator;