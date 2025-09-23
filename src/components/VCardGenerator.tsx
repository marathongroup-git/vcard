import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import VCard from 'vcard-creator';

const LOGO_URL = 'https://marathongroup-git.github.io/vcard/logo.png';

type ContactParams = {
  firstName?: string;
  lastName?: string;
  company?: string;
  jobTitle?: string;
  email?: string;
  phone?: string;          // Teléfono móvil
  officePhone?: string;    // Nuevo campo para teléfono de oficina
  extension?: string;      // Nuevo campo para extensión
  website?: string;
  address?: string;
  note?: string;
  photo?: string;
  color?: string;
};

const VCardGenerator: React.FC = () => {
  const [contact, setContact] = useState<ContactParams>({});
  const [isSaved, setIsSaved] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const contactData: ContactParams = {
      firstName: params.get('firstName') || '',
      lastName: params.get('lastName') || '',
      company: params.get('company') || '',
      jobTitle: params.get('jobTitle') || '',
      email: params.get('email') || '',
      phone: params.get('phone') || '',          // Móvil
      officePhone: params.get('officePhone') || '',  // Teléfono oficina
      extension: params.get('extension') || '',      // Extensión
      website: params.get('website') || '',
      address: params.get('address') || '',
      note: params.get('note') || '',
      photo: params.get('photo') || '',
      color: params.get('color') || '#4a6fa5',
    };
    setContact(contactData);
  }, []);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoaded(false);
    setImageError(true);
  };

  const generateVCard = () => {
    const vcard = new VCard();
    vcard.addName(contact.lastName || '', contact.firstName || '');
    if (contact.company) vcard.addCompany(contact.company);
    if (contact.jobTitle) vcard.addJobtitle(contact.jobTitle);
    if (contact.email) vcard.addEmail(contact.email);
    
    // Teléfono móvil
    if (contact.phone) vcard.addPhoneNumber(contact.phone, 'CELL');
    
    // Teléfono de oficina con extensión
    if (contact.officePhone) {
      const officePhoneWithExt = contact.extension 
        ? `${contact.officePhone} x${contact.extension}`
        : contact.officePhone;
      vcard.addPhoneNumber(officePhoneWithExt, 'WORK');
    }

    if (contact.website) vcard.addURL(contact.website);
    if (contact.address) vcard.addAddress(contact.address);
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

  const getInitials = () => {
    const first = contact.firstName ? contact.firstName.charAt(0) : '';
    const last = contact.lastName ? contact.lastName.charAt(0) : '';
    return `${first}${last}` || '?';
  };

  return (
    <Container color={contact.color}>
      <Card>
        <LogoContainer>
          <Logo src={LOGO_URL} alt="Logotipo" />
        </LogoContainer>

        <PhotoSection>
          {contact.photo ? (
            <>
              <ProfileImage 
                src={contact.photo} 
                alt={`${contact.firstName} ${contact.lastName}`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{ display: imageLoaded ? 'block' : 'none' }}
              />
              {(!imageLoaded || imageError) && (
                <InitialsCircle>{getInitials()}</InitialsCircle>
              )}
            </>
          ) : (
            <InitialsCircle>{getInitials()}</InitialsCircle>
          )}
        </PhotoSection>

        <InfoSection>
          <Name>{`${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Nombre no proporcionado'}
            {contact.jobTitle && <Detail> {contact.jobTitle}</Detail>}
          </Name>
          
         
          {contact.company && <Detail> {contact.company}</Detail>}
          {contact.email && <Detail> {contact.email}</Detail>}
          
          {/* Teléfono de oficina con extensión */}
          {contact.officePhone && (
            <Detail>
              Teléfono: {contact.officePhone}
              {contact.extension && <span> x{contact.extension}</span>}
            </Detail>
          )}
          
          {/* Teléfono móvil */}
          {contact.phone && <Detail>Móvil: {contact.phone}</Detail>}
          
          {contact.website && <Detail> {contact.website}</Detail>}
          {contact.address && <Detail>{contact.address}</Detail>}
          {contact.note && <Note>{contact.note}</Note>}
        </InfoSection>

        <ActionSection>
          <SaveButton onClick={generateVCard} disabled={isSaved}>
            {isSaved ? '✓ Guardado' : 'Guardar Contacto'}
          </SaveButton>
          <Hint>Se descargará un archivo .vcf que puedes importar a tus contactos</Hint>
        </ActionSection>
      </Card>
    </Container>
  );
};

// Estilos (se mantienen igual que en la versión anterior)
const Container = styled.div<{ color?: string }>`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, ${props => props.color || '#4a6fa5'} 0%, #2c3e50 100%);
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 500px;
  overflow: hidden;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 30px 0;
  background-color: white;
  border-bottom: 1px solid #f0f0f0;
`;

const Logo = styled.img`
  max-height: 60px;
  max-width: 200px;
  object-fit: contain;
`;

const PhotoSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
  background-color: #f8f9fa;
  position: relative;
`;

const ProfileImage = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 5px solid white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;

const InitialsCircle = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-color: #e9ecef;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 48px;
  font-weight: bold;
  color: #495057;
  border: 5px solid white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;

const InfoSection = styled.div`
  padding: 30px;
`;

const Name = styled.h1`
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 28px;
  text-align: center;
  border-bottom: 2px solid #f1f3f5;
  padding-bottom: 15px;
`;

const Detail = styled.p`
  margin: 10px 0;
  color: #495057;
  font-size: 16px;
  
  strong {
    color: #2c3e50;
    margin-right: 8px;
  }
`;

const Note = styled.p`
  margin-top: 25px;
  padding-top: 15px;
  border-top: 1px dashed #dee2e6;
  color: #6c757d;
  font-style: italic;
  font-size: 14px;
`;

const ActionSection = styled.div`
  padding: 25px;
  background-color: #f8f9fa;
  text-align: center;
  border-top: 1px solid #e9ecef;
`;

const SaveButton = styled.button`
  background-color:rgb(230, 25, 25);
  color: white;
  border: none;
  padding: 14px 30px;
  font-size: 16px;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background-color: #1891414;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const Hint = styled.p`
  margin-top: 15px;
  font-size: 13px;
  color: #6c757d;
`;

export default VCardGenerator;