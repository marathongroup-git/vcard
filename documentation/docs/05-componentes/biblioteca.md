# Componentes

Esta sección describe los componentes principales del generador de vCards.

## PhotoSection

El componente `PhotoSection` se utiliza para mostrar fotos o videos de perfil.

### Props

| Prop         | Tipo     | Descripción                          |
|--------------|----------|--------------------------------------|
| `src`        | `string` | URL de la imagen o video.           |
| `alt`        | `string` | Texto alternativo para la imagen.   |
| `isVideo`    | `boolean`| Indica si el contenido es un video. |

### Ejemplo de Uso

```tsx
 <PhotoSection video={contact.video} photo={contact.photo} fallbackImage={`${process.env.PUBLIC_URL}/fallback-image.jpg`}/>
```
---

## QRSection

El componente `QRSection` genera un código QR personalizado.

### Props

| Prop         | Tipo     | Descripción                          |
|--------------|----------|--------------------------------------|
| `qrValue`    | `string` | Valor que se codificará en el QR.   |
| `logo`       | `string` | URL del logotipo dentro del QR.     |
| `color`      | `string` | Color del código QR.                |

### Ejemplo de Uso

```tsx
<QRSection qrValue={`https://wa.me/${formatPhoneNumber(contact.phone)}`} logo={LOGO_QR} color={COLORS.marathonRed}/>
```

---

## VCardGenerator

El componente `VCardGenerator` sirve como la **Página Principal** de la aplicación. No recibe propiedades (`props`), ya que funge como un contenedor inteligente que obtiene su contexto directamente de la URL.

### Responsabilidades

1.  **Lectura de URL:** Utiliza `useSearchParams` para detectar parámetros como `id`, `email` o `phone`.
2.  **Búsqueda de Datos:** Cruza los parámetros de la URL con el archivo `data/employees.ts` para encontrar la información del colaborador.
3.  **Visualización:** Renderiza la tarjeta digital completa (Logo, Foto, Info, QR).
4.  **Generación VCF:** Contiene la lógica `generateVCard()` que ensambla y descarga el archivo de contacto (`.vcf`) en el dispositivo del usuario.

### Props

Este componente **no acepta props**. Es invocado directamente por el enrutador (`react-router-dom`).

### Enrutamiento con Hash (HashRouter)

Dado que la aplicación está alojada en **GitHub Pages**, el servidor no soporta el enrutamiento del lado del cliente tradicional (History API) porque cualquier ruta distinta a `/` (como `/generator`) retornaría un error 404 del servidor.

Para solucionar esto, utilizamos `HashRouter`. Esto significa que todas las rutas se manejan después del símbolo `#` en la URL, lo que el servidor ignora y el cliente gestiona.

*   **Ruta VCard:** `https://marathongroup-git.github.io/vcard/#/?id=chernandez`
*   **Ruta Generador:** `https://marathongroup-git.github.io/vcard/#/generator`

```tsx
// App.tsx
import { HashRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <HashRouter> {/* <--- Clave para GitHub Pages */}
        <Routes>
          <Route path="/" element={<VCardGenerator />} />
          <Route path="/generator" element={<LinkGenerator />} />
        </Routes>
      </HashRouter>
    </div>
  );
}
```