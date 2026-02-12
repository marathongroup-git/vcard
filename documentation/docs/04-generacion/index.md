---
sidebar_position: 2
---

# Exportación Pública

Esta guía explica cómo los propios empleados o usuarios finales pueden descargar sus credenciales desde la vista pública de la tarjeta.

1.  Abre la aplicación en tu navegador.
2.  Verás una lista de tarjetas para cada empleado configurado.
3.  Haz clic en **"Descargar vCard"** para obtener el archivo `.vcf`.
4.  Haz clic en **"Descargar QR"** para obtener la imagen del código QR para compartir rápidamente.

> **Nota:** Para descargas de alta resolución destinadas a impresión, utiliza el [Panel Generador](./panel-generador).

---

## Estructura de la VCard

El archivo generado (*.vcf*) incluye toda la información de contacto esencial y añade funcionalidades multimedia extra.

### Datos Incluidos
Al abrir el archivo VCF en contactos (iOS/Android) o Outlook, verás:

*   **Identidad:** Nombre completo con prefijos y sufijos adecuados.
*   **Empresarial:** Cargo (Puesto), Empresa y Departamento.
*   **Contacto Directo:**
    *   Teléfono Celular (con enlace directo a llamada/WhatsApp).
    *   Correo Electrónico Corporativo.
    *   Sitio Web de la empresa.
*   **Multimedia (Novedad):**
    *   **Foto de Perfil:** Se incrusta la foto del empleado directamente en el contacto.
    *   **QR Integrado en Notas:** Se agrega una URL en el campo de "Notas" o "Sitio Web Personal" que apunta de regreso a la tarjeta digital, permitiendo que quien guarde el contacto siempre pueda volver a ver la versión web actualizada (con videos, catálogos, etc.).

### Ejemplo del Contenido Generado
Un archivo VCard típico generado por el sistema se ve así internamente:

```text
BEGIN:VCARD
VERSION:3.0
N:Perez;Juan;;;
FN:Juan Perez
ORG:Marathon Group
TITLE:Gerente de Ventas
TEL;TYPE=CELL:+521234567890
EMAIL;TYPE=WORK:juan.perez@marathon.com
URL:https://marathongroup.mx
NOTE:Visita mi tarjeta digital: https://marathongroup-git.github.io/vcard/#/?id=123
PHOTO;ENCODING=b:[BASE64_DE_LA_IMAGEN...]
END:VCARD
```
