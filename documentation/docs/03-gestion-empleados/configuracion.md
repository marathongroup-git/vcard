---
sidebar_position: 1
---

# Configuración de Empleados

La información de los empleados se gestiona a través del archivo `src/data/employees.ts`.

## Estructura de Datos

Cada empleado se define como un objeto con las siguientes propiedades:

```typescript
{
  id: "NApellido",
  firstName: "Nombre",
  lastName: "Apellido",
  company: "Empresa",
  jobTitle: "Cargo",
  email: "correo@empresa.com",
  officePhone: "+123456789",
  extension:"Extensión telefono",
  phone: "+987654321",
  website: "https://www.empresa.com",
  nota:"Informacion adicional",//OPCIONAL
  video: "Video Presentacion" //OPCIONAL

}
```

## Agregar un Nuevo Empleado

Para agregar un nuevo empleado, ubica el arreglo `employees` dentro de `src/data/employees.ts` y añade un nuevo objeto al final de la lista.

> **Importante:** Asegúrate de que el campo `id` sea único (ej: primera letra del nombre + apellido), ya que este identificador se usa para generar los enlaces y códigos QR.

### Ejemplo Práctico

Si deseas agregar a "Ana López", el código debería verse así:

```typescript
export const employees: Employee[] = [
  // ... anterior empleado ...
  {
    id: "ALopez",
    firstName: "Ana",
    lastName: "López",
    jobTitle: "Coordinadora de Marketing",
    company: "Marathon Group",
    email: "ana.lopez@marathongroup.mx",
    phone: "+52 55 1234 5678",
    officePhone: "+52 55 8765 4321",
    extension: "2014",
    website: "https://www.marathongroup.mx",
    photo: "images/ana-lopez.jpg" // Asegúrate que esta imagen exista en la carpeta public
  } // <--- No olvides cerrar las llaves
];
```
