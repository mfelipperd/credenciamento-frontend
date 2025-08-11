export interface IListFair {
  id: string;
  name: string;
  location: string;
  date: string; // ISO 8601 date string, e.g. "2025-08-05"
  createdAt: string; // ISO 8601 timestamp, e.g. "2025-05-27T00:26:33.260Z"

  // Novos campos opcionais
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  startTime?: string;
  endTime?: string;
  startDateTime?: string;
  endDateTime?: string;
}

export interface ICreateFair {
  name: string;
  location: string;
  date: string; // ISO 8601 date string

  // Campos opcionais de endereço
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;

  // Campos opcionais de horário
  startTime?: string; // formato HH:mm
  endTime?: string; // formato HH:mm
  startDateTime?: string; // ISO 8601 completo
  endDateTime?: string; // ISO 8601 completo
}
