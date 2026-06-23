import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import VCard from 'vcard-creator';
import { employees, Employee } from '../data/employees';
import PhotoSection from './PhotoSection';
import QRSection from './QRSection';

const LOGO_URL = `${process.env.PUBLIC_URL}/favicons/marathon-logo.png`;
const LOGO_QR = `${process.env.PUBLIC_URL}/favicons/marathon-group-logo.png`;
const COLORS = {
  marathonRed: 'oklch(48.8% 0.211 26.4)',
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
      <>

        <Container>
          <Card>
            <InfoSection>
              <Name>Perfil no disponible</Name>
              <Detail>La tarjeta que intentas consultar no existe o el enlace es incorrecto.</Detail>
              <Detail>Por favor verifica la dirección URL.</Detail>
            </InfoSection>
          </Card>
        </Container>
      </>
    );
  }

  if (!contact) {
    return (
      <>

        <Container>
          <Card>
            <Header style={{ justifyContent: 'center' }}>
              <LogoBox>
                <Logo src={LOGO_URL} alt="Logotipo de Marathon Group" />
              </LogoBox>
            </Header>
            <ProfileSection>
              <InfoSection>
                <Name>Tarjetas Digitales</Name>
                <Detail>Bienvenido al sistema de tarjetas de contacto de Marathon Group.</Detail>
                <Detail>Por favor utiliza el enlace personalizado o escanea el código QR de un colaborador.</Detail>
              </InfoSection>
            </ProfileSection>
          </Card>
        </Container>
      </>
    );
  }

  return (
    <>
      <Container>
        <Card>
          <RedDecoration />
          <BottomRedDecoration />
          <Header>
            <LogoBox>
              <Logo src={LOGO_URL} alt="Marathon Group" />
            </LogoBox>
          </Header>

          {/* PROFILE ROW: foto+info izquierda, QR derecha */}
          <ProfileSection>
            <ProfileLeft>
              <PhotoWrapper>
                <PhotoSection
                  video={contact.video}
                  photo={contact.photo}
                  fallbackImage={`${process.env.PUBLIC_URL}/fallback-image.jpg`}
                  employeeId={contact.id}
                />
                <StatusIndicator />
              </PhotoWrapper>
              <InfoSection>
                <Name>
                  {contact.firstName && <span className="first-name">{contact.firstName}</span>}
                  {contact.firstName && contact.lastName && <br />}
                  {contact.lastName && <span className="last-name">{contact.lastName}</span>}
                  {!contact.firstName && !contact.lastName && 'Nombre no proporcionado'}
                </Name>
                <NameDivider />
                {contact.jobTitle && <JobTitle>{contact.jobTitle}</JobTitle>}

                <CompanyBadge>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={COLORS.marathonRed} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                    <path d="M9 22v-4h6v4"></path>
                    <path d="M8 6h.01"></path>
                    <path d="M16 6h.01"></path>
                    <path d="M12 6h.01"></path>
                    <path d="M12 10h.01"></path>
                    <path d="M12 14h.01"></path>
                    <path d="M16 10h.01"></path>
                    <path d="M16 14h.01"></path>
                    <path d="M8 10h.01"></path>
                    <path d="M8 14h.01"></path>
                  </svg>
                  <span>{contact.company || 'Marathon Group'}</span>
                </CompanyBadge>
              </InfoSection>
            </ProfileLeft>

            <ProfileRight>
              <QRSection
                qrValue={`https://wa.me/${formatPhoneNumber(contact.phone)}`}
                logo={LOGO_QR}
                color={COLORS.marathonRed}
              />
              <QRHintContainer>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={COLORS.marathonRed} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                  <line x1="12" y1="18" x2="12.01" y2="18"></line>
                </svg>
                <QRHint>Escanea el código o<br /><strong>toca para conversar</strong></QRHint>
              </QRHintContainer>
            </ProfileRight>
          </ProfileSection>

          {/* CONTACT BAR: íconos SVG en columnas */}
          <ContactGrid>
            {contact.email && (
              <GridItem as="a" href={`mailto:contacto@marathongroup.mx`}>
                <GridIconWrapper>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={COLORS.marathonRed} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </GridIconWrapper>
                <GridTitle>Correo</GridTitle>
                <GridText>contacto@marathongroup.mx</GridText>
              </GridItem>
            )}
            {contact.email && (contact.phone || contact.officePhone) && <GridDivider />}

            {(contact.phone || contact.officePhone) && (
              <GridItem as="a" href={`tel:${contact.phone || contact.officePhone}`}>
                <GridIconWrapper>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={COLORS.marathonRed} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </GridIconWrapper>
                <GridTitle>Teléfono</GridTitle>
                <GridText>{contact.phone || contact.officePhone}</GridText>
              </GridItem>
            )}

            {contact.website && (
              <>
                {((contact.phone || contact.officePhone) || contact.email) && <GridDivider />}
                <GridItem as="a" href={contact.website} target="_blank" rel="noopener noreferrer">
                  <GridIconWrapper>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={COLORS.marathonRed} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                  </GridIconWrapper>
                  <GridTitle>Sitio web</GridTitle>
                  <GridText>marathongroup.mx</GridText>
                </GridItem>
              </>
            )}

            {contact.company && (
              <>
                {(contact.website || contact.phone || contact.officePhone || contact.email) && <GridDivider />}
                <GridItem as="a" href="https://maps.app.goo.gl/STS1zNa9CGzkhm347" target="_blank" rel="noopener noreferrer">
                  <GridIconWrapper>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={COLORS.marathonRed} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  </GridIconWrapper>
                  <GridTitle>Ubicación</GridTitle>
                  <GridText>{contact.company}</GridText>
                </GridItem>
              </>
            )}
          </ContactGrid>

          <ContentSection>
            {contact.note && (
              <AboutBlock>
                <AboutIconWrapper>
                  <PersonIcon />
                </AboutIconWrapper>
                <AboutContent>
                  <AboutTitle>Sobre mí</AboutTitle>
                  <AboutText>{contact.note}</AboutText>
                </AboutContent>
              </AboutBlock>
            )}

            <ConnectBlock>
              <ConnectDivider>
                <DividerLine />
                <ConnectTitle>Conectemos</ConnectTitle>
                <DividerLine />
              </ConnectDivider>
              <SocialLinks>
                <SocialLink href="https://www.linkedin.com/company/marathongroup-mexico/about/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={COLORS.marathonRed} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </SocialLink>
                <SocialLink href="https://www.facebook.com/MarathonGroupMexico/?locale=es_LA" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={COLORS.marathonRed} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </SocialLink>
                <SocialLink href="https://www.instagram.com/marathongroupmx/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={COLORS.marathonRed} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </SocialLink>
                {contact.email && (
                  <SocialLink href={`mailto:contacto@marathongroup.mx`} aria-label="Email">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={COLORS.marathonRed} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  </SocialLink>
                )}
              </SocialLinks>
            </ConnectBlock>
          </ContentSection>

          <ActionSection>
            <SaveButton onClick={generateVCard} disabled={isSaved}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Guardar contacto
            </SaveButton>
            <Hint>Guarda mi información en tu agenda</Hint>
          </ActionSection>
        </Card>
      </Container>
    </>
  );
};

// Styled Components
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f4f4f5;
  background-image: 
    radial-gradient(circle at 0% 0%, rgba(200, 0, 0, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 100% 100%, rgba(200, 0, 0, 0.05) 0%, transparent 50%),
    linear-gradient(to right, rgba(0, 0, 0, 0.04) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 1px, transparent 1px);
  background-size: 100% 100%, 100% 100%, 32px 32px, 32px 32px;
  background-attachment: fixed;
  padding: 20px;
  font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: oklch(20% 0.05 240);
  text-align: left;

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px oklch(0% 0 0 / 15%);
  width: 100%;
  max-width: 800px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;

  &:hover {
    box-shadow: 0 20px 50px oklch(0% 0 0 / 20%);
  }
`;

const Header = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px 28px 10px;
  background: transparent;
  min-height: 80px;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 20px 16px 10px;
    min-height: 60px;
  }
`;

const RedDecoration = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  width: 140px;
  height: 140px;
  background: ${COLORS.marathonRed};
  border-bottom-left-radius: 100%;
  z-index: 0;

  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
  }
`;

const BottomRedDecoration = styled.div`
  position: absolute;
  left: 0;
  bottom: 0;
  width: 250px;
  height: 100px;
  background: ${COLORS.marathonRed};
  border-top-right-radius: 100%;
  z-index: 0;

  @media (max-width: 768px) {
    width: 120px;
    height: 60px;
  }
`;

const LogoBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Logo = styled.img`
  height: 90px;
  width: auto;
  max-width: 300px;
  object-fit: contain;
`;


const ProfileSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 30px;
  padding: 30px 40px;
  background: transparent;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 16px;
  }
`;

const ProfileLeft = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding-right: 20px;

  @media (max-width: 768px) {
    padding-right: 0;
  }
`;

const ProfileRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  background: white;
  border-radius: 24px;
  padding: 20px;
  width: 100%;
  max-width: 360px;
  min-height: 420px;
  margin: 0 auto;
  box-shadow: 0 10px 30px oklch(0% 0 0 / 0.08);

  @media (max-width: 768px) {
    padding: 16px;
    min-height: auto;
  }
`;

const QRHintContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
`;


const QRHint = styled.p`
  margin: 0;
  font-size: 12px;
  color: oklch(50% 0 0);
  text-align: left;
  line-height: 1.4;

  strong {
    color: oklch(20% 0 0);
    font-weight: 700;
  }
`;

const PhotoWrapper = styled.div`
  position: relative;
  display: inline-block;
  flex-shrink: 0;
  align-self: center;
  margin-bottom: 8px;
`;

const StatusIndicator = styled.div`
  position: absolute;
  bottom: 8px;
  right: 12px;
  width: 18px;
  height: 18px;
  background-color: ${COLORS.marathonRed};
  border: 3px solid white;
  border-radius: 50%;
  box-shadow: 0 2px 6px oklch(0% 0 0 / 0.2);
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  gap: 8px;
  padding-top: 4px;
  width: max-content;
  max-width: 100%;

  @media (max-width: 768px) {
    align-items: center;
    text-align: center;
  }
`;

const Name = styled.h1`
  margin: 0;
  
  color: oklch(20% 0.05 240);
  font-size: 32px;
  line-height: 1.1;

  .first-name {
    font-weight: 600;
  }
  .last-name {
    font-weight: 800;
  }

  @media (max-width: 480px) {
    font-size: 26px;
  }
`;

const JobTitle = styled.h2`
  margin: 0;
  color: oklch(35% 0.05 240);
  font-size: 16px;
  font-weight: 500;
  line-height: 1.4;
  margin-top: 8px;
`;

const NameDivider = styled.div`
  width: 70px;
  height: 3px;
  background: ${COLORS.marathonRed};
  border-radius: 2px;
  align-self: flex-start;
  margin: 4px 0;
`;

const CompanyBadge = styled.div`
  display: inline-flex;
  align-items: center;
  align-self: center;
  gap: 10px;
  background-color: #FEF2F2;
  color: #111827;
  font-weight: 700;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 12px;
  margin-top: 16px;
`;

const ContactGrid = styled.div`
  background: white;
  padding: 24px;
  display: flex;
  align-items: stretch;
  justify-content: center;
  border-radius: 24px;
  margin: 20px 40px;
  position: relative;
  z-index: 1;
  box-shadow: 0 8px 30px oklch(0% 0 0 / 0.06);

  @media (max-width: 768px) {
    margin: 16px;
    padding: 16px;
    flex-wrap: wrap;
    gap: 12px;
  }
`;

const GridItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  padding: 0 16px;
  flex: 1;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    min-width: 40%;
    padding: 8px;
  }
`;

const GridIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background-color: #FEF2F2;
  border-radius: 50%;
  margin-bottom: 4px;
`;

const GridTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: oklch(20% 0.05 240);
  text-align: center;
`;

const GridText = styled.div`
  font-size: 12px;
  font-weight: 400;
  color: oklch(40% 0.05 240);
  text-align: center;
  word-break: break-word;
`;

const GridDivider = styled.div`
  width: 1px;
  background-color: oklch(90% 0 0);
  align-self: stretch;
  margin: 0 8px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const ContentSection = styled.div`
  padding: 20px 40px;
  display: flex;
  flex-direction: column;
  gap: 30px;
  background: transparent;

  @media (max-width: 768px) {
    padding: 16px;
    gap: 24px;
  }
`;

const AboutBlock = styled.div`
  display: flex;
  gap: 15px;
  align-items: flex-start;
`;

const AboutIconWrapper = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: oklch(96% 0.005 15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${COLORS.marathonRed};
`;

const AboutContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

const AboutTitle = styled.h3`
  margin: 0;
  color: ${COLORS.marathonRed};
  font-size: 17px;
  font-weight: 700;
  text-align: left;
`;

const AboutText = styled.p`
  margin: 0;
  color: oklch(40% 0.05 240);
  font-size: 14px;
  line-height: 1.6;
  text-align: justify;
`;

const ConnectBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 20px;
`;

const ConnectDivider = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  gap: 16px;
`;

const DividerLine = styled.div`
  flex: 1;
  height: 1px;
  background-color: ${COLORS.marathonRed};
`;

const ConnectTitle = styled.h3`
  margin: 0;
  color: oklch(20% 0.05 240);
  font-size: 16px;
  font-weight: 700;
  text-align: center;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
`;


const SocialLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: #FEF2F2;
  color: ${COLORS.marathonRed};
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    background: #FEE2E2;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(200, 0, 0, 0.12);
  }
`;

const ActionSection = styled.div`
  padding: 30px;
  background-color: transparent;
  position: relative;
  z-index: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  border-top: 1px solid oklch(90% 0 0);

  @media (max-width: 768px) {
    padding: 20px 15px;
  }
`;

const SaveButton = styled.button`
  background: linear-gradient(135deg, ${COLORS.marathonRed} 0%, #a00817 100%);
  color: white;
  border: none;
  padding: 14px 36px;
  font-size: 16px;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 700;
  box-shadow: 0 4px 15px oklch(0% 0 0 / 0.2);
  letter-spacing: 0.3px;
  display: flex;
  align-items: center;
  gap: 10px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px oklch(0% 0 0 / 0.25);
    filter: brightness(1.08);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    font-size: 15px;
    padding: 12px 30px;
  }
`;

const Hint = styled.p`
  margin: 0;
  font-size: 12px;
  color: oklch(50% 0.02 240);
  font-style: italic;
  letter-spacing: 0.2px;
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


const PersonIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);



export default VCardGenerator;
