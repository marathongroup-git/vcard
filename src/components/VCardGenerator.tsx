import { useEffect, useState } from 'react';
import styled from 'styled-components';
import VCard from 'vcard-creator';
import { employees, Employee } from '../data/employees';
import PhotoSection from './PhotoSection';
import QRSection from './QRSection';

const LOGO_URL = 'https://marathongroup-git.github.io/vcard/logo.png';
const LOGO_QR = `${process.env.PUBLIC_URL}/favicons/marathon-group-logo.png`;
const COLORS = {
  marathonRed: 'oklch(48.8% 0.211 26.4)',
}

const VCardGenerator = () => {
  const [contact, setContact] = useState<Employee | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const employeeId = params.get('id');

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

        document.title = 'Empleado no encontrado';
      }
    } else {
      setNotFound(true);

      document.title = 'Generador de vCard';
    }
  }, []);


  const generateVCard = () => {
    if (!contact) return;
    const vcard = new VCard();
    vcard.addName(contact.lastName || '', contact.firstName || '');
    if (contact.company) vcard.addCompany(contact.company);
    if (contact.jobTitle) vcard.addJobtitle(contact.jobTitle);
    if (contact.email) vcard.addEmail(contact.email);

    if (contact.phone) vcard.addPhoneNumber(contact.phone, 'CELL');

    if (contact.officePhone) {
      const officePhoneWithExt = contact.extension
        ? `${contact.officePhone} x${contact.extension}`
        : contact.officePhone;
      vcard.addPhoneNumber(officePhoneWithExt, 'WORK');
    }

    if (contact.website) vcard.addURL(contact.website);
    if (contact.note) vcard.addNote(contact.note);
    if (contact.photo) vcard.addPhoto(contact.photo);

    const blob = new Blob([vcard.toString()], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${contact.firstName || 'contact'}_${contact.lastName || 'vcard'}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const formatPhoneNumber = (phone: string | undefined): string => {
    if (!phone) return '';
    // Eliminar caracteres no numéricos y agregar el código de país (+52 para México)
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.startsWith('52') ? `+${cleaned}` : `+52${cleaned}`;
  };

  if (notFound) {
    return (
      <Container>
        <Card>
          <InfoSection>
            <Name>Empleado no encontrado</Name>
            <Detail>Por favor, verifica que el `id` en la URL sea correcto.</Detail>
            <Detail>Ejemplo: `?id=carlos`</Detail>
          </InfoSection>
        </Card>
      </Container>
    );
  }

  if (!contact) {
    return (
      <Container>
        <Card>
          <InfoSection>
            <Name>Bienvenido</Name>
            <Detail>Proporciona el `id` de un empleado en la URL para generar su vCard.</Detail>
            <Detail>Ejemplo: `?id=carlos`</Detail>
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
              <Name>{`${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Nombre no proporcionado'}
                {contact.jobTitle && <Detail> {contact.jobTitle}</Detail>}
              </Name>

              {contact.company && <Detail> {contact.company}</Detail>}
              {contact.email && <Detail><a href={`mailto:${contact.email}`}>{contact.email}</a></Detail>}

              {contact.officePhone && (
                <Detail>
                  Teléfono: <a href={`tel:${contact.officePhone}`}>{contact.officePhone}</a>
                  {contact.extension && <span> x{contact.extension}</span>}
                </Detail>
              )}

              {contact.phone && <Detail>Móvil: <a href={`tel:${contact.phone}`}>{contact.phone}</a></Detail>}

              {contact.website && (
                <Detail>
                  <a href={contact.website} target="_blank" rel="noopener noreferrer">
                    {contact.website.replace(/(^\w+:|^)\/\//, '')}
                  </a>
                </Detail>
              )}
              {contact.note && <Note>{contact.note}</Note>}
            </InfoSection>

            <QRSection
              qrValue={`https://wa.me/${formatPhoneNumber(contact.phone)}`}
              logo={LOGO_QR}
              color={COLORS.marathonRed}
            />
          </ContentWrapper>

          <ActionSection>
            <SaveButton onClick={generateVCard} disabled={isSaved}>
              {isSaved ? '✓ Guardado' : 'Guardar Contacto'}
            </SaveButton>
            <Hint>Se descargará un archivo .vcf que puedes importar a tus contactos</Hint>
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
  border-bottom: 1px solid oklch(95% 0.05 90);
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
  margin: 0 0 15px 0;
  color: oklch(30% 0.05 240); 
  font-size: 28px;
  text-align: center;
  border-bottom: 1px solid oklch(48.8% 0.1 26.4); 
  padding-bottom: 10px;
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
  border-top: 1px solid oklch(48.8% 0.1 26.4);
  color: oklch(40% 0.02 240);
  font-style: italic;
  font-size: 14px;
  text-align: center;
`;



const ActionSection = styled.div`
  padding: 25px;
  background-color: oklch(97% 0 0);
  text-align: center;
  border-top: 1px solid oklch(95% 0.05 90);
  border-top: 1px dashed oklch(90% 0.01 95);
`;

const SaveButton = styled.button`
  background-color: oklch(48.8% 0.211 26.4);
  color: oklch(100% 0 0);
  border: none;
  padding: 14px 30px;
  font-size: 16px;
  border-radius: 50px;
  cursor: pointer;  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: bold;  box-shadow: 0 4px 10px oklch(0% 0 0 / 0.1);

  &:hover {
    background-color: oklch(55% 0.211 26.4); 
    transform: translateY(-2px);
    box-shadow: 0 8px 20px oklch(0% 0 0 / 0.15);
  }

  &:active {
    background-color: oklch(40% 0.211 26.4);
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