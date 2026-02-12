---
sidebar_position: 1
---

# Introducción

Bienvenido a la documentación oficial del **Generador de VCards y Códigos QR** de Marathon Group.

Esta plataforma es una solución integral diseñada para modernizar la gestión de identidades corporativas, permitiendo la creación, distribución y administración de tarjetas de presentación digitales (vCards) de manera eficiente y sostenible.

## 🎯 Objetivo del Proyecto

El objetivo principal es sustituir o complementar las tarjetas de presentación físicas tradicionales con una **versión digital interactiva**. Esto no solo reduce el impacto ambiental por el uso de papel, sino que asegura que la información de contacto de nuestros colaboradores esté siempre accesible y actualizada.

## ✨ Características Principales

### 📇 Tarjetas Digitales (vCards)
*   **Compatibilidad Universal:** Generación de archivos `.vcf` (versión 3.0) compatibles nativamente con iOS (iPhone), Android, Outlook y CRMs.
*   **Información Multimedia:** Capacidad para incluir fotos de perfil, videos de presentación y enlaces a redes sociales, algo imposible en el papel.
*   **Actualización Instantánea:** Si un empleado cambia de puesto o teléfono, su tarjeta digital se actualiza sin necesidad de reimprimir nada.

### 📱 Códigos QR Inteligentes
*   **Acceso Rápido:** Un código QR escaneable que redirige instantáneamente al perfil del colaborador.
*   **Personalización Corporativa:** Los códigos incluyen el logotipo de la empresa y utilizan la paleta de colores corporativa.
*   **Alta Resolución:** Permite descargar los QRs en formato PNG de alta calidad para ser impresos en tarjetas físicas, gafetes o firmas de correo.

### 🛠️ Panel de Administración
*   **Gestión Centralizada:** Un archivo de configuración único (`employees.ts`) para manejar toda la plantilla de colaboradores.
*   **Generador Visual:** Una herramienta interna para buscar empleados y generar sus recursos gráficos en segundos.

## 🚀 Tecnologías Utilizadas

Este proyecto está construido con un stack tecnológico moderno para asegurar rendimiento y escalabilidad:

*   **Frontend:** [React](https://reactjs.org/) con [TypeScript](https://www.typescriptlang.org/) para una interfaz robusta y segura.
*   **Estilos:** `styled-components` y CSS Modules para un diseño modular.
*   **Generación QR:** `qr-code-styling` para códigos estéticos y funcionales.
*   **VCard:** `vcard-creator` para la estandarización de archivos de contacto.
*   **Documentación:** [Docusaurus](https://docusaurus.io/) (lo que estás leyendo ahora).

## 📚 ¿Por dónde empezar?

Dependiendo de tu rol, te recomendamos visitar las siguientes secciones:

*   **Administradores:** Comienza configurando los datos en [Gestión de Empleados](../gestion-empleados/configuracion).
*   **Diseñadores/RRHH:** Aprende a exportar los códigos en [Generación de Recursos](../generacion/panel-generador).
*   **Desarrolladores:** Revisa la arquitectura en [Desarrollo y Componentes](../componentes/biblioteca).

## 🛟 Soporte y Mantenimiento

Este proyecto es mantenido por el equipo de **Sistemas de Marathon Group**.

Para dudas técnicas, reportar errores o solicitar nuevas funcionalidades, por favor contactar a:

*   **Departamento de Sistemas**
*   📧 Email: [sistemas@marathon.com](mailto:sistemas@marathon.com)

