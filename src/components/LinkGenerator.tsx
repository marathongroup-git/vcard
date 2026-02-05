import { useState, useEffect, useRef } from 'react';
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

const LOGO_URL = `${process.env.PUBLIC_URL}/favicons/marathon-logo.png`
const QR_LOGO = `${process.env.PUBLIC_URL}/favicons/marathon-group-logo.png`;

const LinkGenerator = () => {
  const [selectedId, setSelectedId] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<QRCodeStyling | null>(null);

  const basePath = process.env.NODE_ENV === 'production' ? process.env.PUBLIC_URL : '';
  const appRoot = window.location.origin + basePath;
  const generatedUrl = selectedId ? `${appRoot}/#/?id=${selectedId}` : '';

  useEffect(() => {
    document.title = 'Generador de QR - Marathon Group';

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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

  const selectedEmployee = employees.find(e => e.id === selectedId);

  return (
    <PageWrapper>
      <NavBar>
        <NavLogo src={LOGO_URL} alt="Marathon Group" />
      </NavBar>
      
      <MainContent>
        <Card>
          <HeaderSection>
            <Title>Generador de QR</Title>
            <Subtitle>Selecciona un colaborador para generar su código</Subtitle>
          </HeaderSection>
          
          <FormControl>
            <Label htmlFor="employee-select">Colaborador</Label>
            <DropdownContainer ref={dropdownRef}>
              <DropdownHeader onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                {selectedEmployee 
                  ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}`
                  : <PlaceholderText>-- Buscar por nombre... --</PlaceholderText>
                }
                <DropdownArrow isOpen={isDropdownOpen}>▼</DropdownArrow>
              </DropdownHeader>
              
              {isDropdownOpen && (
                <DropdownList>
                  <SearchInput
                    type="text"
                    placeholder="Escribe para filtrar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                  {employees
                    .filter(emp => {
                      const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
                      return fullName.includes(searchTerm.toLowerCase());
                    })
                    .map((emp) => (
                      <DropdownItem 
                        key={emp.id} 
                        onClick={() => {
                          setSelectedId(emp.id);
                          setIsDropdownOpen(false);
                          setSearchTerm('');
                          if (!emp.id) {
                              qrCodeInstance.current = null;
                          }
                        }}
                        isSelected={selectedId === emp.id}
                      >
                        {emp.photo ? (
                            <Avatar src={emp.photo.startsWith('http') || emp.photo.startsWith('/') ? emp.photo : `${process.env.PUBLIC_URL}/${emp.photo}`} alt="" onError={(e) => e.currentTarget.style.display = 'none'}/>
                        ) : (
                            <AvatarPlaceholder>{emp.firstName[0]}{emp.lastName[0]}</AvatarPlaceholder>
                        )}
                        <div>
                            <DropdownItemName>{emp.firstName} {emp.lastName}</DropdownItemName>
                            <DropdownItemRole>{emp.jobTitle}</DropdownItemRole>
                        </div>
                      </DropdownItem>
                    ))
                  }
                  {employees.filter(emp => `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                      <NoResults>No se encontraron resultados</NoResults>
                  )}
                </DropdownList>
              )}
            </DropdownContainer>
          </FormControl>

          {selectedId && selectedEmployee && (
            <ResultCard>
              <EmployeePreview>
                <EmployeeName>{selectedEmployee.firstName} {selectedEmployee.lastName}</EmployeeName>
                <EmployeeRole>{selectedEmployee.jobTitle}</EmployeeRole>
              </EmployeePreview>

              <QRWrapper>
                <QRContainerInternal ref={qrRef} />
              </QRWrapper>
              
              <ButtonGroup>
                <LinkButton href={generatedUrl} target="_blank" rel="noopener noreferrer">
                  <span>🔗</span> Abrir Tarjeta
                </LinkButton>
                <DownloadButton onClick={onDownload}>
                  <span>⬇️</span> Descargar PNG
                </DownloadButton>
              </ButtonGroup>
              <UrlText>{generatedUrl}</UrlText>
            </ResultCard>
          )}
        </Card>
      </MainContent>
    </PageWrapper>
  );
};

export default LinkGenerator;

const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: ${COLORS.lightGray};
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', system-ui, sans-serif;
`;

const NavBar = styled.nav`
  background-color: white;
  padding: 15px 40px;
  box-shadow: 0 2px 10px oklch(0% 0 0 / 0.05);
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    padding: 15px 20px;
  }
`;

const NavLogo = styled.img`
  height: 40px;
  object-fit: contain;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 40px 20px;

  @media (max-width: 500px) {
    padding: 20px 15px;
  }
`;

const Card = styled.div`
  background-color: white;
  border-radius: 24px;
  box-shadow: 0 20px 40px oklch(0% 0 0 / 0.08);
  width: 100%;
  max-width: 500px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
  
  @media (max-width: 500px) {
    padding: 25px;
  }
`;

const HeaderSection = styled.div`
  margin-bottom: 30px;
  text-align: center;
`;

const Title = styled.h1`
  color: ${COLORS.darkText};
  font-size: 28px;
  margin: 0 0 8px 0;
  font-weight: 800;
  letter-spacing: -0.5px;
`;

const Subtitle = styled.p`
  color: oklch(60% 0 0);
  margin: 0;
  font-size: 15px;
`;

const FormControl = styled.div`
  width: 100%;
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-weight: 700;
  margin-bottom: 8px;
  color: ${COLORS.darkText};
  font-size: 14px;
  margin-left: 5px;
`;

const DropdownContainer = styled.div`
  position: relative;
  width: 100%;
`;

const DropdownHeader = styled.div`
  padding: 16px 20px;
  font-size: 16px;
  border-radius: 16px;
  border: 2px solid ${COLORS.borderColor};
  background-color: oklch(99% 0 0);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
  min-height: 56px;

  &:hover {
    border-color: oklch(80% 0 0);
    background-color: white;
  }
`;

const PlaceholderText = styled.span`
  color: oklch(60% 0 0);
`;

const DropdownArrow = styled.span<{ isOpen: boolean }>`
  color: ${COLORS.marathonRed};
  font-size: 0.7rem;
  transition: transform 0.2s ease;
  transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const DropdownList = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid ${COLORS.borderColor};
  border-radius: 16px;
  margin-top: 8px;
  max-height: 350px;
  overflow-y: auto;
  z-index: 100;
  box-shadow: 0 10px 40px -10px oklch(0% 0 0 / 0.1);
  padding: 8px;
  animation: fadeIn 0.1s ease-out;

  @media (max-width: 600px) {
    max-height: 250px;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid ${COLORS.borderColor};
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  font-family: inherit;

  &:focus {
    border-color: ${COLORS.marathonRed};
  }
`;

const DropdownItem = styled.div<{ isSelected?: boolean }>`
  padding: 10px 12px;
  cursor: pointer;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: ${props => props.isSelected ? 'oklch(96% 0 0)' : 'transparent'};
  transition: background-color 0.1s;
  color: ${COLORS.darkText};

  &:hover {
    background-color: oklch(98% 0 0);
  }
`;

const Avatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid ${COLORS.borderColor};
`;

const AvatarPlaceholder = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${COLORS.marathonRed};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
`;

const DropdownItemName = styled.div`
  font-weight: 600;
  font-size: 14px;
`;

const DropdownItemRole = styled.div`
  font-size: 12px;
  color: oklch(50% 0 0);
`;

const NoResults = styled.div`
  padding: 15px;
  text-align: center;
  color: oklch(60% 0 0);
  font-size: 14px;
`;

const ResultCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: 20px;
  animation: slideUp 0.4s ease-out;
  
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const EmployeePreview = styled.div`
  text-align: center;
  margin-bottom: 20px;
`;

const EmployeeName = styled.h3`
  margin: 0;
  color: ${COLORS.marathonRed};
  font-size: 20px;
  font-weight: 700;
`;

const EmployeeRole = styled.p`
  margin: 5px 0 0 0;
  color: oklch(50% 0 0);
  font-size: 14px;
  font-weight: 500;
`;

const QRWrapper = styled.div`
  background: white;
  padding: 20px;
  border-radius: 20px;
  box-shadow: 0 4px 15px oklch(0% 0 0 / 0.05);
  border: 1px solid ${COLORS.borderColor};
  margin-bottom: 25px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  width: 100%;
  
  @media (max-width: 400px) {
    flex-direction: column;
  }
`;

const LinkButton = styled.a`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background-color: white;
  color: ${COLORS.darkText};
  border: 2px solid ${COLORS.borderColor};
  border-radius: 14px;
  text-decoration: none;
  font-weight: 600;
  font-size: 15px;
  transition: all 0.2s;
  
  &:hover {
    background-color: oklch(98% 0 0);
    border-color: ${COLORS.darkText};
    transform: translateY(-2px);
  }
`;

const DownloadButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background-color: ${COLORS.marathonRed};
  color: white;
  border: none;
  border-radius: 14px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: oklch(42% 0.18 26.4);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px oklch(48.8% 0.211 26.4 / 0.25);
  }
`;

const UrlText = styled.div`
  margin-top: 25px;
  padding: 10px 15px;
  background-color: oklch(98% 0 0);
  border-radius: 8px;
  font-size: 11px;
  color: oklch(60% 0 0);
  font-family: monospace;
  word-break: break-all;
  text-align: center;
  width: 100%;
  border: 1px dashed ${COLORS.borderColor};
`;

const QRContainerInternal = styled.div`
  & > div > canvas {
    max-width: 100%;
    display: block;
  }
`;
