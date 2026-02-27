import express from "express";
import { createServer as createViteServer } from "vite";
import { UserRole, TicketStatus, TicketPriority, User, Ticket, TicketComment } from "./src/types";

// Mock Data
const MOCK_USERS: Record<string, User & { password: string }> = {};

// Generate 20 Users
for (let i = 1; i <= 20; i++) {
  MOCK_USERS[`user${i}`] = { 
    id: `u${i}`, 
    username: `user${i}`, 
    password: "password123", 
    fullName: `Usuario ${i}`, 
    role: UserRole.USER, 
    department: i % 2 === 0 ? "Ventas" : "Marketing", 
    email: `user${i}@enterprise.com` 
  };
}

// Generate 4 Agents
for (let i = 1; i <= 4; i++) {
  MOCK_USERS[`agente${i}`] = { 
    id: `a${i}`, 
    username: `agente${i}`, 
    password: "password123", 
    fullName: `Agente IT ${i}`, 
    role: UserRole.AGENT, 
    department: "IT Support", 
    email: `agente${i}@enterprise.com` 
  };
}

// Generate 3 Admins
for (let i = 1; i <= 3; i++) {
  MOCK_USERS[`admin${i}`] = { 
    id: `admin${i}`, 
    username: `admin${i}`, 
    password: "password123", 
    fullName: `Administrador ${i}`, 
    role: UserRole.ADMIN, 
    department: "IT Management", 
    email: `admin${i}@enterprise.com` 
  };
}

let tickets: Ticket[] = [
  {
    id: "T-1001",
    title: "Problema con acceso a VPN",
    description: "No puedo conectar a la VPN desde mi casa. Sale error de tiempo de espera.",
    status: TicketStatus.OPEN,
    priority: TicketPriority.HIGH,
    category: "Red",
    creatorId: "u1",
    creatorName: "Usuario 1",
    creatorEmail: "user1@enterprise.com",
    creatorDept: "Marketing",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    history: [{ action: "Ticket creado", userId: "u1", userName: "Usuario 1", timestamp: new Date().toISOString() }]
  }
];

let comments: TicketComment[] = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auth API
  app.post("/api/auth/login", (req, res) => {
    const { username } = req.body;
    const user = MOCK_USERS[username];

    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } else {
      res.status(401).json({ message: "Usuario no encontrado" });
    }
  });

  // Get Agents API
  app.get("/api/agents", (req, res) => {
    const agents = Object.values(MOCK_USERS).filter(u => u.role === UserRole.AGENT);
    res.json(agents);
  });

  // Tickets API
  app.get("/api/tickets", (req, res) => {
    const { userId, role } = req.query;
    
    if (role === UserRole.ADMIN) {
      res.json(tickets);
    } else if (role === UserRole.AGENT) {
      // Agents see tickets assigned to them
      res.json(tickets.filter(t => t.agentId === userId));
    } else {
      // Users see only their own tickets
      res.json(tickets.filter(t => t.creatorId === userId));
    }
  });

  app.post("/api/tickets", (req, res) => {
    const { title, description, priority, category, creatorId, creatorName, creatorEmail, creatorDept, agentId, agentName, station, area } = req.body;
    const newTicket: Ticket = {
      id: `T-${1000 + tickets.length + 1}`,
      title,
      description,
      status: agentId ? TicketStatus.IN_PROGRESS : TicketStatus.OPEN,
      priority,
      category,
      creatorId,
      creatorName,
      creatorEmail,
      creatorDept,
      station,
      area,
      agentId,
      agentName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [{ action: "Ticket creado", userId: creatorId, userName: creatorName, timestamp: new Date().toISOString() }]
    };

    if (agentId) {
      newTicket.history.push({
        action: `Asignado a ${agentName} al crear`,
        userId: creatorId,
        userName: creatorName,
        timestamp: new Date().toISOString()
      });
    }

    tickets.push(newTicket);
    res.status(201).json(newTicket);
  });

  app.patch("/api/tickets/:id", (req, res) => {
    const { id } = req.params;
    const { status, agentId, agentName, priority, userId, userName } = req.body;
    const ticketIndex = tickets.findIndex(t => t.id === id);

    if (ticketIndex !== -1) {
      const ticket = tickets[ticketIndex];
      const oldStatus = ticket.status;
      
      if (status) ticket.status = status;
      if (agentId) {
        ticket.agentId = agentId;
        ticket.agentName = agentName;
      }
      if (priority) ticket.priority = priority;
      
      ticket.updatedAt = new Date().toISOString();
      
      let action = "Ticket actualizado";
      if (status && status !== oldStatus) action = `Estado cambiado a ${status}`;
      if (agentId) action = `Asignado a ${agentName}`;
      
      ticket.history.push({
        action,
        userId,
        userName,
        timestamp: new Date().toISOString()
      });

      if (status === TicketStatus.RESOLVED || status === TicketStatus.CLOSED) {
        ticket.resolvedAt = new Date().toISOString();
      }

      res.json(ticket);
    } else {
      res.status(404).json({ message: "Ticket no encontrado" });
    }
  });

  // Comments API
  app.get("/api/tickets/:id/comments", (req, res) => {
    const { id } = req.params;
    res.json(comments.filter(c => c.ticketId === id));
  });

  app.post("/api/tickets/:id/comments", (req, res) => {
    const { id } = req.params;
    const { userId, userName, text } = req.body;
    const newComment: TicketComment = {
      id: Math.random().toString(36).substr(2, 9),
      ticketId: id,
      userId,
      userName,
      text,
      createdAt: new Date().toISOString()
    };
    comments.push(newComment);
    res.status(201).json(newComment);
  });

  // Stats API (Admin only)
  app.get("/api/stats", (req, res) => {
    const stats = {
      total: tickets.length,
      open: tickets.filter(t => t.status === TicketStatus.OPEN).length,
      inProgress: tickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length,
      resolved: tickets.filter(t => t.status === TicketStatus.RESOLVED || t.status === TicketStatus.CLOSED).length,
      byPriority: {
        [TicketPriority.LOW]: tickets.filter(t => t.priority === TicketPriority.LOW).length,
        [TicketPriority.MEDIUM]: tickets.filter(t => t.priority === TicketPriority.MEDIUM).length,
        [TicketPriority.HIGH]: tickets.filter(t => t.priority === TicketPriority.HIGH).length,
        [TicketPriority.CRITICAL]: tickets.filter(t => t.priority === TicketPriority.CRITICAL).length,
      }
    };
    res.json(stats);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
