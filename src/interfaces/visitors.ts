export interface Fair {
  id: string;
  name: string;
  location: string;
  date: string;
  createdAt: string;
}

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
  fair_visitor: Fair[];
}
export interface VisitorEdit extends Omit<Visitor, "fair_visitor"> {
  name: string;
  fairIds: string[];
}

export interface AbsentVisitor {
  registrationCode: string;
  name: string;
  company: string;
  email: string;
}

export interface VisitorLookupFairHistory {
  fairId: string;
  fairName: string;
  fairYear: number;
  state: string;
  registrationDate: string;
}

export interface VisitorLookupResult {
  registrationCode: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  cnpj: string;
  role: string;
  segment: string;
  city: string;
  state: string;
  missingFields: string[];
  fairHistory: VisitorLookupFairHistory[];
}

export interface CheckinPerHourResponse {
  hours: string[]; // Ex: ["08:00", "09:00", ..., "18:00"]
  data: {
    name: string; // Ex: "24/06/2025"
    data: number[]; // Ex: [0, 1, 3, 0, ...] — 1 valor para cada hora
  }[];
}
