import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import VCard from 'vcard-creator';


// ejemplo
// Definición de tipos para los parámetros de la URL
type ContactParams = {
  firstName?: string;
  lastName?: string;
  company?: string;
  jobTitle?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  note?: string;
  photo?: string;
  color?: string;
};

const VCardGenerator: React.FC = () => {
  const [contact, setContact] = useState<ContactParams>({});
  const [isSaved, setIsSaved] = useState(false);

  // Extraer parámetros de la URL al cargar el componente
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const contactData: ContactParams = {
      firstName: params.get('firstName') || '',
      lastName: params.get('lastName') || '',
      company: params.get('company') || '',
      jobTitle: params.get('jobTitle') || '',
      email: params.get('email') || '',
      phone: params.get('phone') || '',
      website: params.get('website') || '',
      address: params.get('address') || '',
      note: params.get('note') || '',
      photo: params.get('photo') || '',
      color: params.get('color') || '#4a6fa5',
    };
    setContact(contactData);
  }, []);

  // Generar y descargar la VCard
  const generateVCard = () => {
    const vcard = new VCard();

    // Nombre y organización
    vcard.addName(contact.lastName || '', contact.firstName || '');
    if (contact.company) vcard.addCompany(contact.company);
    if (contact.jobTitle) vcard.addJobtitle(contact.jobTitle);

    // Información de contacto
    if (contact.email) vcard.addEmail(contact.email);
    if (contact.phone) vcard.addPhoneNumber(contact.phone, 'WORK');
    if (contact.website) vcard.addURL(contact.website);
    if (contact.address) vcard.addAddress(contact.address);

    // Notas y foto
    if (contact.note) vcard.addNote(contact.note);
    if (contact.photo) vcard.addPhoto(contact.photo);

    // Crear blob y descargar
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

  // Determinar las iniciales para el avatar
  const getInitials = () => {
    const first = contact.firstName ? contact.firstName.charAt(0) : '';
    const last = contact.lastName ? contact.lastName.charAt(0) : '';
    return `${first}${last}` || '?';
  };

  if (contact.firstName=='Natali')
  return (
    <Container color={contact.color}>
      <Card>
        <AvatarSection>
          {contact.photo ? (
            <AvatarImage src={contact.photo} alt={`${contact.firstName} ${contact.lastName}`} />
          ) : (
            <AvatarInitials>{getInitials()}</AvatarInitials>
          )}
        </AvatarSection>

        <InfoSection>
          <Name>{`${contact.firstName || '---'} ${contact.lastName || ''}`.trim() || 'Nombre no proporcionado'}</Name>
          
          {contact.jobTitle && <Detail><strong>Cargo:</strong> {contact.jobTitle}</Detail>}
          {contact.company && <Detail><strong>Empresa:</strong> {contact.company}</Detail>}
          {contact.email && <Detail><strong>Email:</strong> {contact.email}</Detail>}
          {contact.phone && <Detail><strong>Teléfono:</strong> {contact.phone}</Detail>}
          {contact.website && <Detail><strong>Sitio web:</strong> {contact.website}</Detail>}
          {contact.address && <Detail><strong>Dirección:</strong> {contact.address}</Detail>}
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
  )
  else{
     return (
      <Container color={contact.color}>
      <Card>
        <AvatarSection>
          {contact.photo ? (
            <AvatarImage src={contact.photo} alt={`${contact.firstName} ${contact.lastName}`} />
          ) : (
            <AvatarInitials>{getInitials()}</AvatarInitials>
          )}
        </AvatarSection>

        <InfoSection>
          <Name>{`${contact.firstName || '---'} ${contact.lastName || ''}`.trim() || 'Nombre no proporcionado'}</Name>
          
          {contact.jobTitle && <Detail><strong>Cargo:</strong> {contact.jobTitle}</Detail>}
          {contact.company && <Detail><strong>Empresa:</strong> {contact.company}</Detail>}
          {contact.email && <Detail><strong>Email:</strong> {contact.email}</Detail>}
          {contact.phone && <Detail><strong>Teléfono:</strong> {contact.phone}</Detail>}
          {contact.website && <Detail><strong>Sitio web:</strong> {contact.website}</Detail>}
          {contact.address && <Detail><strong>Dirección:</strong> {contact.address}</Detail>}
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
     )
  }
};

// Estilos con styled-components
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

const AvatarSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa;
  padding: 30px 0;
`;

const AvatarImage = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const AvatarInitials = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: #e9ecef;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 48px;
  font-weight: bold;
  color: #495057;
  border: 4px solid white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const InfoSection = styled.div`
  padding: 25px;
`;

const Name = styled.h1`
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 28px;
  border-bottom: 2px solid #f1f3f5;
  padding-bottom: 10px;
`;

const Detail = styled.p`
  margin: 8px 0;
  color: #495057;
  font-size: 16px;
  
  strong {
    color: #2c3e50;
    margin-right: 5px;
  }
`;

const Note = styled.p`
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px dashed #dee2e6;
  color: #6c757d;
  font-style: italic;
`;

const ActionSection = styled.div`
  padding: 20px;
  background-color: #f8f9fa;
  text-align: center;
`;

const SaveButton = styled.button`
  background-color: #28a745;
  color: white;
  border: none;
  padding: 12px 25px;
  font-size: 16px;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background-color: #218838;
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
  }
  
  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const Hint = styled.p`
  margin-top: 10px;
  font-size: 12px;
  color: #6c757d;
`;

export default VCardGenerator;
export {};