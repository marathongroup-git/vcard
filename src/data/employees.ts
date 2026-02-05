export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  jobTitle: string;
  email: string;
  phone?: string;
  officePhone: string;
  extension: string;
  website: string;
  note?: string;
  photo: string; 
  video?: string; 
}

export const employees: Employee[] = [
  {
    id: "chernandez",
    firstName: "Jose Carlos",
    lastName: "Hernández",
    company: "Marathon Group",
    jobTitle: "Coordinador de Ventas",
    email: "chernandez@marathongroup.mx",
    phone: "22-2820-9987",
    officePhone: "22-2690-6700",
    extension: "2114",
    website: "https://www.marathongroup.mx",
    note: "Project Manager in the tech division.",
    photo: "./images/profile-andrea.jpg",
  },
  {
    id: "acuautle",
    firstName: "Arturo",
    lastName: "Cuautle",
    company: "Marathon Group",
    jobTitle: "Ventas Externas",
    email: "acuautle@marathongroup.mx",
    phone: "22-2614-0427",
    officePhone: "22-2690-6700",
    extension: "2194",
    website: "https://www.marathongroup.mx",
    note: "Frontend specialist.",
    photo: "./images/profile-arturo.jpg",
    },
  {
    id: "jcromero",
    firstName: "Julio Cesar",
    lastName: "Romero",
    company: "Marathon Group",
    jobTitle: "Ventas Externas",
    email: "jcromero@marathongroup.mx",
    phone: "22-1391-4802",
    officePhone: "22-2690-6700",
    extension: "2144",
    website: "https://www.marathongroup.mx",
    note: "Designing user experiences.",
    photo: "./images/profile-claudia.jpg",
  },
  {
    id: "eramirez",
    firstName: "Elizabeth",
    lastName: "Ramirez",
    company: "Marathon Group",
    jobTitle: "Ventas Externas",
    email: "eramirez@marathongroup.mx",
    phone: "22-2616-7185",
    officePhone: "22-2690-6700",
    extension: "2106",
    website: "https://www.marathongroup.mx",
    note: "Ensuring software quality.",
    photo: "./images/profile-elizabeth.jpg",
  },
  {
    id: "lbravo",
    firstName: "Luisa",
    lastName: "Bravo",
    company: "Marathon Group",
    jobTitle: "Ventas Externas",
    email: "lbravo@marathongroup.mx",
    phone: "22-2681-0908",
    officePhone: "22-2690-6700",
    extension: "2110",
    website: "https://www.marathongroup.mx",
    note: "Building robust APIs.",
    photo: "./images/profile-luisa.jpg",
  },
  {
    id: "gcarrera",
    firstName: "Griselda",
    lastName: "Carrera",
    company: "Marathon Group",
    jobTitle: "Ventas Internas",
    email: "gcarrera@marathongroup.mx",
    phone: "22-2829-2842",
    officePhone: "22-2690-6700",
    extension: "2120",
    website: "https://www.marathongroup.mx",
    note: "Infrastructure and deployments.",
    photo: "./images/profile-griselda.jpg",
  },
  {
    id: "cislas",
    firstName: "Claudia",
    lastName: "Islas",
    company: "Marathon Group",
    jobTitle: "Ventas Internas",
    email: "cislas@marathongroup.mx",
    phone: "22-2820-9988",
    officePhone: "22-2690-6700",
    extension: "2107",
    website: "https://www.marathongroup.mx",
    note: "Analyzing data for insights.",
    photo: "./images/profile-claudia.jpg",
    video: "./videos/video-example.mp4",
  },
];
