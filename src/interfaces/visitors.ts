export interface Visitor {
  id: string;
  registrationCode: string;
  name: string;
  company: string;
  email: string;
  cnpj: string;
  phone: string;
  zipCode: string;
  sectors: string[];
  howDidYouKnow: string;
  category: string;
  registrationDate: string;
}

export interface AbsentVisitor {
  registrationCode: string;
  name: string;
  company: string;
  email: string;
}

export interface CheckinPerHourResponse {
  hours: string[]; // Ex: ["08:00", "09:00", ..., "18:00"]
  data: {
    name: string; // Ex: "24/06/2025"
    data: number[]; // Ex: [0, 1, 3, 0, ...] — 1 valor para cada hora
  }[];
}
