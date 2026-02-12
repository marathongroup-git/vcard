---
sidebar_position: 2
---

# Funcionalidades Técnicas

Esta sección profundiza en la implementación del código, detallando cómo se resuelven los desafíos técnicos clave del proyecto.

## 1. Sistema de Resolución de Identidad (Reciclaje)

El componente `VCardGenerator` (en `src/components/VCardGenerator.tsx`) no solo lee un ID, sino que implementa una estrategia de "búsqueda en cascada" para garantizar que siempre se muestre información, incluso si el enlace es antiguo.

### Lógica de Búsqueda

```typescript
useEffect(() => {
    const employeeId = getParam('id'); // 1. Intenta obtener ID explícito

    if (employeeId) {
      // Búsqueda Directa por ID
      const foundEmployee = employees.find(emp => emp.id === employeeId);
      if (foundEmployee) setContact(foundEmployee);
      
    } else {
      // 2. Búsqueda por coincidencia de datos (Reciclaje)
      const urlEmail = getParam('email');
      const urlPhone = getParam('phone');

      if (urlEmail || urlPhone) {
        // Busca en la base de datos alguien que tenga ese correo O teléfono
        const matchedEmployee = employees.find(emp => {
          return (emp.email === urlEmail) || (emp.phone === urlPhone);
        });
        
        if (matchedEmployee) setContact(matchedEmployee);
      }
      
      // 3. Fallback a datos en URL (Modo Legacy)
      // Si no encuentra nada en la BD, usa los datos crudos de la URL
      else {
         const firstName = getParam('firstName');
         // ... construye objeto temporal con params
      }
    }
}, [searchParams]);
```

## 2. Generación y Optimización de VCard

La creación del archivo `.vcf` no es trivial. Los archivos vCard tienen límites estrictos de tamaño para las fotos de perfil en ciertos dispositivos (especialmente iOS).

### Procesamiento de Imagen (Canvas)

Antes de incrustar la foto en la vCard, la procesamos para reducir su tamaño y asegurar compatibilidad.

1.  Obtenemos la imagen como `Blob`.
2.  La dibujamos en un `Canvas` HTML5.
3.  La redimensionamos a un máximo de 300x300px.
4.  Extraemos el Base64 comprimido (JPEG 0.7).

```typescript
// Fragmento de generateVCard
if (contact.photo) {
    const img = new Image();
    // ... carga la imagen ...

    // Redimensionamiento inteligente
    const maxWidth = 300;
    let width = img.width;
    let height = img.height;
    
    if (width > height) {
        if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
        }
    } // ... lógica de resize

    // Renderizado en Canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(img, 0, 0, width, height);

    // Conversión a Base64 optimizado
    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
    const base64 = dataUrl.split(',')[1];
    
    vcard.addPhoto(base64, 'JPEG');
}
```

### Ensamblaje del Archivo

Utilizamos la librería `vcard-creator` para mapear los campos correctamente según el estándar vCard 3.0.

```typescript
const vcard = new VCard();
vcard.addName(contact.lastName, contact.firstName);
vcard.addCompany(contact.company);
vcard.addPhoneNumber(contact.phone, 'CELL');
vcard.addEmail(contact.email);

// Generación del Blob final
const blob = new Blob([vcard.toString()], { type: 'text/x-vcard' });
```

## 3. Renderizado de Códigos QR

Para la generación visual de los códigos QR se utiliza `qr-code-styling`, que permite incrustar imágenes (logos) sin romper la lectura del código.

```typescript
// Ejemplo de configuración en QRSection.tsx
const qrCode = new QRCodeStyling({
    width: 350,
    height: 350,
    data: qrValue,
    dotsOptions: {
        color: color, // Usa variables CSS/JS para consistencia de marca
        type: 'dots', // Estilo de puntos redondeados
    },
    image: logo, // Logo corporativo centrado
    imageOptions: {
        hideBackgroundDots: true, // Limpia el área detrás del logo
        imageSize: 0.4, // Tamaño relativo del logo
    },
});
```

## 4. Estilos Dinámicos

El proyecto utiliza `styled-components` para manejar los temas y colores de forma dinámica.

```typescript
const SaveButton = styled.button`
  background-color: ${COLORS.marathonRed};
  color: oklch(100% 0 0);
  border-radius: 50px;
  
  &:hover {
    transform: translateY(-2px); // Animación suave
    box-shadow: 0 8px 20px oklch(0% 0 0 / 0.15);
  }
`;
```
