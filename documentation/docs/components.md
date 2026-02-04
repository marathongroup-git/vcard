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
<PhotoSection src="profile.jpg" alt="Foto de perfil" isVideo={false} />
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
<QRSection qrValue="https://example.com" logo="logo.png" color="#000000" />
```

---

## VCardGenerator

El componente `VCardGenerator` es el núcleo de la aplicación, encargado de generar las tarjetas de presentación.

### Props

| Prop         | Tipo     | Descripción                          |
|--------------|----------|--------------------------------------|
| `employees`  | `array`  | Lista de empleados para generar vCards. |

### Ejemplo de Uso

```tsx
<VCardGenerator employees={[{ name: "John Doe", email: "john@example.com" }]} />
```