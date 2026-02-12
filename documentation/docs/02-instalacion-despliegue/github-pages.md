---
sidebar_position: 2
---

# Despliegue en GitHub Pages

El proyecto cuenta con un sistema de **Integración Continua y Despliegue Continuo (CI/CD)** configurado mediante **GitHub Actions**.

Esto significa que el despliegue está **automatizado**: cada vez que actualizas la rama principal, el sitio se publica solo.

## Flujo de Trabajo Automatizado (Recomendado)

El archivo de configuración se encuentra en `.github/workflows/deploy.yml`. Gracias a este flujo, **no necesitas ejecutar comandos de construcción manualmente**.

### ¿Cómo funciona la automatización?

El archivo `.github/workflows/deploy.yml` define que cada vez que haya un `push` en la rama `main`, se ejecuten los pasos de instalación, construcción y despliegue.

Aquí tienes un extracto de la configuración:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main  # Se activa al hacer push en main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: build # Sube la carpeta generada
          branch: gh-pages # A la rama gh-pages
```

### Pasos para Desplegar:

1.  Realiza tus cambios en el código.
2.  Haz un **commit** con tus cambios:
    ```bash
    git add .
    git commit -m "Descripción de mis cambios"
    ```
3.  Haz un **push** a la rama `main`:
    ```bash
    git push origin main
    ```

¡Y listo! GitHub detectará el nuevo commit, iniciará automáticamente el proceso de construcción y actualizará la página en unos minutos.

## Verificación

Una vez finalizado el proceso (puedes ver el estado en la pestaña "Actions" de tu repositorio en GitHub), visita tu sitio en:

**[https://marathongroup-git.github.io/vcard/](https://marathongroup-git.github.io/vcard/)**

> **Importante:** Si ves un error 404 al recargar una página interna (como `/generator`), recuerda que estamos usando `HashRouter` para evitar este problema en servidores estáticos como GitHub Pages.

---

## Despliegue Manual (Opcional)

Si por alguna razón necesitas desplegar manualmente desde tu máquina local, aún conservamos la configuración para hacerlo:

1.  Asegúrate de tener los permisos adecuados en el repositorio.
2.  Ejecuta:
    ```bash
    npm run deploy
    ```
3.  El script `gh-pages` subirá el contenido de la carpeta `build` a la rama `gh-pages`.
