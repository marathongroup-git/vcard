---
sidebar_position: 1
---

# Configuración del Entorno Local

Esta guía te ayudará a clonar el repositorio y ejecutar el proyecto en tu máquina local para desarrollo.

## Requisitos Previos

Asegúrate de tener instalado el siguiente software:

*   **[Node.js](https://nodejs.org/)** (Versión LTS recomendada, v18+).
*   **[Git](https://git-scm.com/)** para el control de versiones.
*   Un editor de código como **[VS Code](https://code.visualstudio.com/)**.

## Clonar el Repositorio

Abre tu terminal y ejecuta el siguiente comando:

```bash
git clone https://github.com/marathon-group/vcard-generator.git
cd vcard-generator
```

> **Nota:** Reemplaza la URL con la dirección real de tu repositorio si es diferente.

## Instalación de Dependencias

Una vez dentro de la carpeta del proyecto, instala las librerías necesarias:

```bash
npm install
# O si prefieres yarn
yarn install
```

Este proceso descargará todas las dependencias listadas en `package.json`, incluyendo React, TypeScript y las herramientas de generación de vCards.

## Ejecución en Modo Desarrollo

Para iniciar el servidor local y ver la aplicación en tu navegador:

```bash
npm start
```

La aplicación se abrirá automáticamente en [http://localhost:3000](http://localhost:3000).
El servidor se recargará automáticamente si realizas cambios en el código.
