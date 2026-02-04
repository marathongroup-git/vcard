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
  note: string;
  photo: string; 
  video?: string; 
}

export const employees: Employee[] = [
  {
    id: "andrea",
    firstName: "Andrea",
    lastName: "Garcia",
    company: "Marathon Group",
    jobTitle: "Project Manager",
    email: "andrea.garcia@example.com",
    phone: "55-1111-2222",
    officePhone: "55-3333-4444",
    extension: "101",
    website: "https://www.marathongroup.mx",
    note: "Project Manager in the tech division.",
    photo: "./images/profile-andrea.jpg",
  },
  {
    id: "carlos",
    firstName: "Carlos",
    lastName: "Rodriguez",
    company: "Marathon Group",
    jobTitle: "Software Developer",
    email: "carlos.rodriguez@example.com",
    phone: "22-1172-2915",
    officePhone: "22-1172-2915",
    extension: "102",
    website: "https://www.marathongroup.mx",
    note: "Frontend specialist.",
    photo: "./images/profile-carlos.jpg",
    },
  {
    id: "claudia",
    firstName: "Claudia",
    lastName: "Martinez",
    company: "Marathon Group",
    jobTitle: "UX/UI Designer",
    email: "claudia.martinez@example.com",
    phone: "55-9999-0000",
    officePhone: "55-1212-3434",
    extension: "103",
    website: "https://www.marathongroup.mx",
    note: "Designing user experiences.",
    photo: "./images/profile-claudia.jpg",
  },
  {
    id: "griselda",
    firstName: "Griselda",
    lastName: "Lopez",
    company: "Marathon Group",
    jobTitle: "QA Tester",
    email: "griselda.lopez@example.com",
    phone: "55-1234-5678",
    officePhone: "55-8765-4321",
    extension: "104",
    website: "https://www.marathongroup.mx",
    note: "Ensuring software quality.",
    photo: "./images/profile-griselda.jpg",
  },
  {
    id: "luisa",
    firstName: "Luisa",
    lastName: "Hernandez",
    company: "Marathon Group",
    jobTitle: "Backend Developer",
    email: "luisa.hernandez@example.com",
    phone: "55-8765-1234",
    officePhone: "55-4321-8765",
    extension: "105",
    website: "https://www.marathongroup.mx",
    note: "Building robust APIs.",
    photo: "./images/profile-luisa.jpg",
  },
  {
    id: "manuel",
    firstName: "Manuel",
    lastName: "Perez",
    company: "Marathon Group",
    jobTitle: "DevOps Engineer",
    email: "manuel.perez@example.com",
    phone: "55-2345-6789",
    officePhone: "55-6789-2345",
    extension: "106",
    website: "https://www.marathongroup.mx",
    note: "Infrastructure and deployments.",
    photo: "./images/profile-manuel.jpg",
  },
  {
    id: "mauricio",
    firstName: "Mauricio",
    lastName: "Gomez",
    company: "Marathon Group",
    jobTitle: "Data Scientist",
    email: "mauricio.gomez@example.com",
    phone: "22-2525-0353",
    officePhone: "55-7890-3456",
    extension: "107",
    website: "https://www.marathongroup.mx",
    note: "Analyzing data for insights.",
    photo: "./images/profile-mauricio.jpg",
    video: "./videos/video-example.mp4",
  },
  {
    id: "nalvarado",
    firstName: "Natalia",
    lastName: "Alvarado",
    company: "Marathon Group",
    jobTitle: "Encargada de Marketing",
    email: "marketing@marathongroup.mx",
    phone: "22-2599-2540",
    officePhone: "55-8901-4567",
    extension: "108",
    website: "https://www.marathongroup.mx",
    note: "Defining product vision.",
    photo: "./images/profile-natalia.jpg",
  },
];
