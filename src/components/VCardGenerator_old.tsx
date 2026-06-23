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

  const getParam = (key: string) => {
    return searchParams.get(key) || new URLSearchParams(window.location.search).get(key);
  };

  useEffect(() => {
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
          <TopSection>
            <LeftContent>
              <PhotoWrapper>
                <PhotoSection
                  video={contact.video}
                  photo={contact.photo}
                  fallbackImage={`${process.env.PUBLIC_URL}/fallback-image.jpg`}
                  employeeId={contact.id}
                />
                <StatusIndicator />
              </PhotoWrapper>
            </LeftContent>

            <RightContent>
              <InfoSection>
                <Name>{`${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Nombre no proporcionado'}</Name>
                {contact.jobTitle && <JobTitle>{contact.jobTitle}</JobTitle>}
                {contact.company && <CompanyName>{contact.company}</CompanyName>}
              </InfoSection>

              <QRContainer>
                <QRSection
                  qrValue={`https://wa.me/${formatPhoneNumber(contact.phone)}`}
                  logo={LOGO_QR}
                  color={COLORS.marathonRed}
                />
              </QRContainer>
            </RightContent>
          </TopSection>

          <ContactBar>
            <ContactBarContent>
              <ContactItem>
                <span>🏢</span>
                <div>
                  <strong>Marathon Group</strong>
                </div>
              </ContactItem>
              <Divider />
              <ContactItem>
                {contact.email && (
                  <>
                    <span>✉️</span>
                    <div>
                      <a href={`mailto:${contact.email}`}>{contact.email}</a>
                    </div>
                  </>
                )}
              </ContactItem>
              <Divider />
              <ContactItem>
                <span>📞</span>
                <div>
                  {contact.phone && <a href={`tel:${contact.phone}`}>{contact.phone}</a>}
                  {contact.officePhone && !contact.phone && <a href={`tel:${contact.officePhone}`}>{contact.officePhone}</a>}
                </div>
              </ContactItem>
              <Divider />
              <ContactItem>
                <span>🌐</span>
                <div>
                  {contact.website && (
                    <a href={contact.website} target="_blank" rel="noopener noreferrer">
                      marathongroup.mx
                    </a>
                  )}
                </div>
              </ContactItem>
            </ContactBarContent>
          </ContactBar>

          <MiddleSection>
            {contact.note && (
              <AboutSection>
                <SectionIcon>👤</SectionIcon>
                <SectionTitle>Sobre mí</SectionTitle>
                <SectionContent>{contact.note}</SectionContent>
              </AboutSection>
            )}

            <SocialSection>
              <SectionIcon>🔗</SectionIcon>
              <SectionTitle>Conéctamos</SectionTitle>
              <SocialLinks>
                <SocialLink href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <LinkedInIcon />
                </SocialLink>
                <SocialLink href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <FacebookIcon />
                </SocialLink>
                <SocialLink href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <InstagramIcon />
                </SocialLink>
                <SocialLink href={`mailto:${contact.email}`} aria-label="Email">
                  <EmailIcon />
                </SocialLink>
              </SocialLinks>
            </SocialSection>
          </MiddleSection>

          <ActionSection>
            <SaveButton onClick={generateVCard} disabled={isSaved}>
              ⬇️ Guardar contacto
            </SaveButton>
            <Hint>Descarga mi información y guárdala en tu agenda</Hint>
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
  max-width: 900px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px oklch(0% 0 0 / 30%);
  }
`;

const TopSection = styled.div`
  display: flex;
  gap: 40px;
  padding: 40px;
  align-items: flex-start;
  background: linear-gradient(135deg, oklch(99% 0 0) 0%, oklch(98% 0 0) 100%);
  border-bottom: 1px solid oklch(90% 0 0);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 30px;
    padding: 30px 20px;
    align-items: center;
  }
`;

const LeftContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  min-width: fit-content;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const PhotoWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const StatusIndicator = styled.div`
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 16px;
  height: 16px;
  background-color: #4ade80;
  border: 3px solid white;
  border-radius: 50%;
  box-shadow: 0 2px 8px oklch(0% 0 0 / 0.2);
`;

const RightContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 30px;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    align-items: center;
    text-align: center;
  }
`;

const InfoSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media (max-width: 768px) {
    align-items: center;
    width: 100%;
  }
`;

const Name = styled.h1`
  margin: 0;
  color: oklch(30% 0.05 240); 
  font-size: 32px;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const JobTitle = styled.h2`
  margin: 0;
  color: oklch(48.8% 0.211 26.4);
  font-size: 18px;
  font-weight: 600;
  padding-bottom: 10px;
  border-bottom: 3px solid ${COLORS.marathonRed};
  display: inline-block;
`;

const CompanyName = styled.p`
  margin: 0;
  color: oklch(40% 0.05 240);
  font-size: 16px;
  font-weight: 500;
`;

const QRContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  min-width: 200px;

  @media (max-width: 768px) {
    width: 100%;
    min-width: 100%;
  }
`;

const ContactBar = styled.div`
  background: linear-gradient(90deg, ${COLORS.marathonRed} 0%, #c1121f 100%);
  color: white;
  padding: 20px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;

  @media (max-width: 768px) {
    padding: 15px 20px;
    overflow-x: auto;
  }
`;

const ContactBarContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  justify-content: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 10px;
    justify-content: flex-start;
  }
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  font-size: 14px;
  white-space: nowrap;

  span {
    font-size: 18px;
  }

  a {
    color: white;
    text-decoration: none;
    font-weight: 500;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.8;
      text-decoration: underline;
    }
  }

  @media (max-width: 768px) {
    padding: 0 10px;
    font-size: 13px;
    gap: 8px;
  }
`;

const Divider = styled.div`
  width: 1px;
  height: 24px;
  background-color: rgba(255, 255, 255, 0.3);
  margin: 0 5px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const MiddleSection = styled.div`
  padding: 40px;
  display: flex;
  gap: 40px;
  background: oklch(99.5% 0 0);
  border-bottom: 1px solid oklch(90% 0 0);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 30px;
    padding: 30px 20px;
  }
`;

const AboutSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SocialSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionIcon = styled.span`
  font-size: 24px;
  line-height: 1;
`;

const SectionTitle = styled.h3`
  margin: 0;
  color: ${COLORS.marathonRed};
  font-size: 18px;
  font-weight: 700;
`;

const SectionContent = styled.p`
  margin: 0;
  color: oklch(40% 0.05 240);
  font-size: 14px;
  line-height: 1.6;
  text-align: justify;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const SocialLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid ${COLORS.marathonRed};
  color: ${COLORS.marathonRed};
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 18px;

  &:hover {
    background-color: ${COLORS.marathonRed};
    color: white;
    transform: translateY(-3px);
    box-shadow: 0 4px 12px oklch(0% 0 0 / 0.15);
  }
`;

const LinkedInIcon = () => (
  <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
    <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 15 0 14.487 0 13.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.604 0 7.225 0 7.225h2.4z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
    <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.166 1.791.166v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.852-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.509-.198-1.09-.333-1.942-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/>
  </svg>
);

const EmailIcon = () => (
  <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
    <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-6.868 4.12a1 1 0 0 1-1.264 0L1 5.383V12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5.383Z"/>
  </svg>
);

const ActionSection = styled.div`
  padding: 40px;
  background-color: oklch(100% 0 0);
  text-align: center;
  border-top: 1px solid oklch(90% 0 0);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
`;

const SaveButton = styled.button`
  background: linear-gradient(135deg, ${COLORS.marathonRed} 0%, #c1121f 100%);
  color: white;
  border: none;
  padding: 16px 40px;
  font-size: 18px;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 700;
  box-shadow: 0 4px 15px oklch(0% 0 0 / 0.2);
  letter-spacing: 0.5px;

  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px oklch(0% 0 0 / 0.3);
    filter: brightness(1.05);
  }

  &:active:not(:disabled) {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    font-size: 16px;
    padding: 14px 30px;
  }
`;

const Hint = styled.p`
  margin: 0;
  font-size: 13px;
  color: oklch(50% 0.02 240);
  font-style: italic;
  letter-spacing: 0.3px;
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

export default VCardGenerator;