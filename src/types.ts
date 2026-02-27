export enum UserRole {
  USER = 'user',
  AGENT = 'agent',
  ADMIN = 'admin'
}

export enum TicketStatus {
  OPEN = 'Abierto',
  IN_PROGRESS = 'En Proceso',
  WAITING = 'En Espera del Usuario',
  ESCALATED = 'Escalado',
  RESOLVED = 'Resuelto',
  CLOSED = 'Cerrado'
}

export enum TicketPriority {
  LOW = 'Baja',
  MEDIUM = 'Media',
  HIGH = 'Alta',
  CRITICAL = 'Crítica'
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  department: string;
  email: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  creatorDept: string;
  station?: string;
  area?: string;
  agentId?: string;
  agentName?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  history: {
    action: string;
    userId: string;
    userName: string;
    timestamp: string;
  }[];
}
