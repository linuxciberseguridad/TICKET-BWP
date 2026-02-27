import { TicketPriority, TicketStatus } from "./types";

export const CATEGORIES = [
  "Computadora",
  "Sistema Operativo",
  "Internet",
  "Red",
  "Hardware",
  "Software",
  "Impresoras",
  "Accesos / Credenciales",
  "Otro"
];

export const PRIORITY_COLORS = {
  [TicketPriority.LOW]: "bg-blue-100 text-blue-800 border-blue-200",
  [TicketPriority.MEDIUM]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  [TicketPriority.HIGH]: "bg-orange-100 text-orange-800 border-orange-200",
  [TicketPriority.CRITICAL]: "bg-red-100 text-red-800 border-red-200",
};

export const STATUS_COLORS = {
  [TicketStatus.OPEN]: "bg-emerald-100 text-emerald-800 border-emerald-200",
  [TicketStatus.IN_PROGRESS]: "bg-blue-100 text-blue-800 border-blue-200",
  [TicketStatus.WAITING]: "bg-amber-100 text-amber-800 border-amber-200",
  [TicketStatus.ESCALATED]: "bg-purple-100 text-purple-800 border-purple-200",
  [TicketStatus.RESOLVED]: "bg-gray-100 text-gray-800 border-gray-200",
  [TicketStatus.CLOSED]: "bg-slate-200 text-slate-900 border-slate-300",
};
