import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Ticket as TicketIcon, 
  Users, 
  Settings, 
  LogOut, 
  Search, 
  Filter,
  ChevronRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  History,
  ShieldCheck,
  User as UserIcon,
  Building2,
  Mail,
  ArrowLeft,
  Send,
  BarChart3,
  PieChart,
  TrendingUp,
  MoreVertical,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, UserRole, Ticket, TicketStatus, TicketPriority, TicketComment } from './types';
import { CATEGORIES, PRIORITY_COLORS, STATUS_COLORS } from './constants';

// --- Components ---

const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}>
    {children}
  </span>
);

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className, onClick }) => (
  <div 
    className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${onClick ? 'cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  onClick,
  type = 'button',
  disabled = false
}: { 
  children: React.ReactNode, 
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost',
  className?: string,
  onClick?: () => void,
  type?: 'button' | 'submit',
  disabled?: boolean
}) => {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200',
    secondary: 'bg-slate-800 text-white hover:bg-slate-900 shadow-slate-200',
    outline: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-red-200',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Input = ({ label, ...props }: { label?: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="space-y-1.5">
    {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
    <input
      {...props}
      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
    />
  </div>
);

const Select = ({ label, options, ...props }: { label?: string, options: string[] } & React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div className="space-y-1.5">
    {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
    <select
      {...props}
      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none"
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

// --- Main App ---

export default function App() {
  const [view, setView] = useState<'landing' | 'login' | 'dashboard'>('landing');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>('');
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);

  const STATION_AREAS: Record<string, string[]> = {
    'Estación 1': ['Ventas', 'Auditoría', 'Caja'],
    'Estación 2': ['Almacén', 'Logística', 'Despacho'],
    'Estación 3': ['Recursos Humanos', 'Contabilidad', 'Legal'],
    'Estación 4': ['Gerencia', 'Dirección', 'IT'],
  };

  const handleStationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const station = e.target.value;
    setSelectedStation(station);
    setAvailableAreas(STATION_AREAS[station] || []);
  };

  // Auth Logic
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;

    try {
      setLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        setView('dashboard');
      } else {
        alert('Usuario no encontrado. Usa: user1, agente1 o admin1');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/tickets?userId=${user.id}&role=${user.role}`);
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    if (user?.role !== UserRole.ADMIN) return;
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComments = async (ticketId: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/comments`);
      const data = await res.json();
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedTicket || !commentText.trim()) return;

    try {
      const res = await fetch(`/api/tickets/${selectedTicket.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userName: user.fullName,
          text: commentText
        })
      });
      if (res.ok) {
        setCommentText('');
        fetchComments(selectedTicket.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/agents');
      const data = await res.json();
      setAgents(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (view === 'dashboard') {
      fetchTickets();
      fetchStats();
      fetchAgents();
    }
  }, [view, user]);

  useEffect(() => {
    if (selectedTicket && typeof selectedTicket === 'object' && 'id' in selectedTicket) {
      fetchComments(selectedTicket.id);
    }
  }, [selectedTicket]);

  const handleCreateTicket = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    const agentId = formData.get('agentId') as string;
    const agent = agents.find(a => a.id === agentId);

    const newTicket = {
      title: formData.get('title'),
      description: formData.get('description'),
      priority: formData.get('priority'),
      category: formData.get('category'),
      creatorId: user.id,
      creatorName: user.fullName,
      creatorEmail: user.email,
      creatorDept: user.department,
      station: formData.get('station'),
      area: formData.get('area'),
      agentId: agent?.id,
      agentName: agent?.fullName
    };

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicket)
      });
      if (res.ok) {
        setIsCreating(false);
        fetchTickets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: TicketStatus) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status, 
          userId: user.id, 
          userName: user.fullName 
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedTicket(updated);
        fetchTickets();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const assignToMe = async (ticketId: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          agentId: user.id, 
          agentName: user.fullName,
          status: TicketStatus.IN_PROGRESS,
          userId: user.id, 
          userName: user.fullName 
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedTicket(updated);
        fetchTickets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- Views ---

  if (view === 'landing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl w-full text-center space-y-12"
        >
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold border border-indigo-100">
              <ShieldCheck size={16} />
              Enterprise IT
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-slate-900">
              Plataforma de Gestión de Incidentes
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              Bienvenido. Selecciona tu perfil para ingresar al sistema y gestionar tus requerimientos tecnológicos.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { role: UserRole.USER, title: 'Usuario Final', desc: 'Crear y seguir mis tickets', icon: UserIcon, color: 'indigo' },
              { role: UserRole.AGENT, title: 'Agente IT', desc: 'Gestionar tickets asignados', icon: UserCheck, color: 'emerald' },
              { role: UserRole.ADMIN, title: 'Administrador', desc: 'Visión global y métricas', icon: ShieldCheck, color: 'slate' },
            ].map((item) => (
              <Card 
                key={item.role}
                onClick={() => { setSelectedRole(item.role); setView('login'); }}
                className="p-8 group"
              >
                <div className={`w-14 h-14 rounded-2xl bg-${item.color}-50 text-${item.color}-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <item.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-500">{item.desc}</p>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  if (view === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <Card className="max-w-md w-full p-8 space-y-8">
          <div className="text-center space-y-2">
            <button 
              onClick={() => setView('landing')}
              className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 transition-colors mb-4"
            >
              <ArrowLeft size={14} /> Volver
            </button>
            <h2 className="text-2xl font-bold text-slate-900">Iniciar Sesión</h2>
            <p className="text-slate-500">Ingresa como <span className="font-semibold text-indigo-600 capitalize">{selectedRole}</span></p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <Input 
              label="Nombre de Usuario" 
              name="username" 
              placeholder={selectedRole === 'user' ? 'user1...user20' : selectedRole === 'agent' ? 'agente1...agente4' : 'admin1...admin3'} 
              required 
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Cargando...' : 'Entrar al Sistema'}
            </Button>
          </form>

          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
            <p className="text-xs text-indigo-800 leading-relaxed">
              <strong>Acceso Libre:</strong> No se requiere contraseña. Solo ingresa el nombre de usuario correspondiente.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // --- Dashboard ---

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white text-slate-600 flex flex-col border-r border-slate-200">
        <div className="p-6 flex items-center gap-3 text-slate-900 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <ShieldCheck size={20} />
          </div>
          <span className="font-bold tracking-tight">Enterprise IT</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          <button 
            onClick={() => { setSelectedTicket(null); setIsCreating(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${!selectedTicket && !isCreating ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button 
            onClick={() => { setIsCreating(true); setSelectedTicket(null); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isCreating ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <PlusCircle size={20} />
            Nuevo Ticket
          </button>
          {user?.role === UserRole.AGENT && (
            <button 
              onClick={() => { setSelectedTicket(null); setIsCreating(false); fetchTickets(); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${!selectedTicket && !isCreating ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <TicketIcon size={20} />
              Mis Tickets
            </button>
          )}
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <History size={20} />
            Historial
          </button>
          {user?.role === UserRole.ADMIN && (
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors">
              <Users size={20} />
              Usuarios
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              {user?.fullName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{user?.fullName}</p>
              <p className="text-xs text-slate-500 truncate capitalize">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={() => setView('landing')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-bottom border-slate-200 flex items-center justify-between px-8 shrink-0">
          <h2 className="text-xl font-bold text-slate-900">
            {isCreating ? 'Crear Nuevo Ticket' : selectedTicket ? `Ticket ${selectedTicket.id}` : 'Dashboard Principal'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar tickets..." 
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 w-64"
              />
            </div>
            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {isCreating ? (
              <motion.div 
                key="create"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-4xl mx-auto"
              >
                <div className="bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden">
                  <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">FORMULARIO DE REQUERIMIENTO TÉCNICO</h3>
                      <p className="text-slate-400 text-xs mt-1 tracking-widest uppercase">Enterprise IT - Incident Management System</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Código de Formulario</p>
                      <p className="text-sm font-mono font-bold">IT-FRM-001-V2</p>
                    </div>
                  </div>

                  <form onSubmit={handleCreateTicket} className="p-0">
                    {/* Section 1: Solicitante */}
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                      <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-indigo-600 text-white flex items-center justify-center text-[10px]">01</span>
                        Información del Solicitante
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nombre del Empleado</label>
                          <p className="text-sm font-semibold text-slate-900 border-b border-slate-200 pb-1">{user?.fullName}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Departamento</label>
                          <p className="text-sm font-semibold text-slate-900 border-b border-slate-200 pb-1">{user?.department}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Correo Electrónico</label>
                          <p className="text-sm font-semibold text-slate-900 border-b border-slate-200 pb-1">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Ubicación y Clasificación */}
                    <div className="p-6 border-b border-slate-100">
                      <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-indigo-600 text-white flex items-center justify-center text-[10px]">02</span>
                        Ubicación y Clasificación
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estación de Trabajo</label>
                          <select
                            name="station"
                            onChange={handleStationChange}
                            required
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                          >
                            <option value="">Seleccione Estación</option>
                            <option value="Estación 1">Estación 1</option>
                            <option value="Estación 2">Estación 2</option>
                            <option value="Estación 3">Estación 3</option>
                            <option value="Estación 4">Estación 4</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Área Específica</label>
                          <select
                            name="area"
                            required
                            disabled={!selectedStation}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all disabled:opacity-50"
                          >
                            <option value="">Seleccione Área</option>
                            {availableAreas.map(area => (
                              <option key={area} value={area}>{area}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Categoría de Falla</label>
                          <select
                            name="category"
                            required
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                          >
                            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nivel de Prioridad</label>
                          <select
                            name="priority"
                            required
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                          >
                            {Object.values(TicketPriority).map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Descripción del Incidente */}
                    <div className="p-6 border-b border-slate-100 bg-slate-50/30">
                      <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-indigo-600 text-white flex items-center justify-center text-[10px]">03</span>
                        Descripción Técnica del Incidente
                      </h4>
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Título del Requerimiento</label>
                          <input 
                            name="title"
                            type="text"
                            required
                            placeholder="Resumen corto del problema..."
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-semibold"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Detalle Extenso del Problema</label>
                          <textarea 
                            name="description"
                            rows={6}
                            required
                            placeholder="Proporcione todos los detalles técnicos observados..."
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Asignación Administrativa */}
                    <div className="p-6 bg-white">
                      <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-indigo-600 text-white flex items-center justify-center text-[10px]">04</span>
                        Asignación de Personal IT
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Agente Responsable</label>
                          <select
                            name="agentId"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                          >
                            <option value="">Pendiente de Asignación</option>
                            {agents.map(a => (
                              <option key={a.id} value={a.id}>{a.fullName}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-end pb-1">
                          <p className="text-[10px] text-slate-400 italic">
                            * Al asignar un agente, el ticket cambiará automáticamente a estado "En Proceso".
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-4">
                      <button 
                        type="button"
                        onClick={() => setIsCreating(false)}
                        className="px-6 py-2.5 rounded font-bold text-xs uppercase tracking-widest text-slate-500 hover:text-slate-700 transition-all"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit"
                        className="px-10 py-2.5 rounded font-bold text-xs uppercase tracking-widest bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
                      >
                        Registrar Ticket en Sistema
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            ) : selectedTicket ? (
              <motion.div 
                key="detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-5xl mx-auto space-y-6"
              >
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => setSelectedTicket(null)}
                    className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors"
                  >
                    <ArrowLeft size={18} /> Volver a la lista
                  </button>
                  <div className="flex items-center gap-2">
                    {user?.role !== UserRole.USER && selectedTicket.status !== TicketStatus.CLOSED && (
                      <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                        {!selectedTicket.agentId && (
                          <Button variant="primary" onClick={() => assignToMe(selectedTicket.id)} className="py-1.5 px-3 text-xs">
                            <UserCheck size={14} /> Tomar Ticket
                          </Button>
                        )}
                        {selectedTicket.agentId === user?.id && (
                          <>
                            <Button 
                              variant="outline" 
                              onClick={() => updateTicketStatus(selectedTicket.id, TicketStatus.WAITING)}
                              className={`py-1.5 px-3 text-xs ${selectedTicket.status === TicketStatus.WAITING ? 'bg-amber-50 border-amber-200 text-amber-700' : ''}`}
                            >
                              <Clock size={14} /> Pendiente / Espera
                            </Button>
                            <Button 
                              variant="primary" 
                              onClick={() => updateTicketStatus(selectedTicket.id, TicketStatus.RESOLVED)}
                              className="py-1.5 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 border-emerald-600"
                            >
                              <CheckCircle2 size={14} /> Marcar Resuelto
                            </Button>
                          </>
                        )}
                        <div className="h-6 w-px bg-slate-200 mx-1" />
                        <Select 
                          options={Object.values(TicketStatus)} 
                          value={selectedTicket.status}
                          onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value as TicketStatus)}
                          className="w-40 border-none bg-transparent text-xs font-bold"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <Card className="p-8">
                      <div className="flex items-start justify-between mb-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-slate-900">{selectedTicket.title}</h1>
                            <Badge className={STATUS_COLORS[selectedTicket.status]}>{selectedTicket.status}</Badge>
                          </div>
                          <p className="text-slate-500">Creado el {new Date(selectedTicket.createdAt).toLocaleString()}</p>
                        </div>
                        <Badge className={PRIORITY_COLORS[selectedTicket.priority]}>{selectedTicket.priority}</Badge>
                      </div>
                      <div className="prose prose-slate max-w-none">
                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {selectedTicket.description}
                        </p>
                      </div>
                    </Card>

                    <Card className="p-8">
                      <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <MessageSquare size={20} className="text-indigo-600" />
                        Comentarios y Seguimiento
                      </h3>
                      <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2">
                        {comments.length > 0 ? comments.map((c) => (
                          <div key={c.id} className="flex gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold ${c.userId === user?.id ? 'bg-slate-800 text-white' : 'bg-indigo-100 text-indigo-600'}`}>
                              {c.userName.charAt(0)}
                            </div>
                            <div className={`flex-1 rounded-2xl p-4 border ${c.userId === user?.id ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100'}`}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-bold text-slate-900">{c.userName}</span>
                                <span className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleString()}</span>
                              </div>
                              <p className="text-sm text-slate-600">{c.text}</p>
                            </div>
                          </div>
                        )) : (
                          <p className="text-center text-slate-400 text-sm py-8">No hay comentarios aún.</p>
                        )}
                      </div>
                      <form onSubmit={handleAddComment} className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 font-bold">
                          {user?.fullName.charAt(0)}
                        </div>
                        <div className="flex-1 relative">
                          <textarea 
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Escribe un comentario..."
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 min-h-[100px]"
                          />
                          <Button type="submit" className="absolute bottom-3 right-3 py-1.5 px-3">
                            <Send size={16} /> Enviar
                          </Button>
                        </div>
                      </form>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    <Card className="p-6">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Detalles del Ticket</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <span className="text-sm text-slate-500">Categoría</span>
                          <span className="text-sm font-medium text-slate-900">{selectedTicket.category}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <span className="text-sm text-slate-500">Solicitante</span>
                          <span className="text-sm font-medium text-slate-900">{selectedTicket.creatorName}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <span className="text-sm text-slate-500">Departamento</span>
                          <span className="text-sm font-medium text-slate-900">{selectedTicket.creatorDept}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <span className="text-sm text-slate-500">Agente</span>
                          <span className="text-sm font-medium text-indigo-600">{selectedTicket.agentName || 'Sin asignar'}</span>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6 bg-slate-900 text-white">
                      <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Clock size={16} className="text-indigo-400" /> Tiempo SLA
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <span className="text-xs text-slate-400">Tiempo de Respuesta</span>
                          <span className="text-lg font-bold">02:45:12</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 w-3/4" />
                        </div>
                        <p className="text-[10px] text-slate-500">SLA Objetivo: 4 horas para prioridad Alta</p>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <History size={16} /> Historial de Acciones
                      </h3>
                      <div className="space-y-4">
                        {selectedTicket.history.map((h, i) => (
                          <div key={i} className="flex gap-3 relative">
                            {i !== selectedTicket.history.length - 1 && (
                              <div className="absolute left-[7px] top-5 bottom-0 w-0.5 bg-slate-100" />
                            )}
                            <div className="w-4 h-4 rounded-full bg-indigo-500 mt-1 shrink-0 border-4 border-white shadow-sm" />
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-slate-900">{h.action}</p>
                              <p className="text-[10px] text-slate-500">{h.userName} • {new Date(h.timestamp).toLocaleTimeString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Stats Grid */}
                {user?.role === UserRole.ADMIN && stats && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: 'Total Tickets', value: stats.total, icon: BarChart3, color: 'indigo' },
                      { label: 'Abiertos', value: stats.open, icon: AlertCircle, color: 'emerald' },
                      { label: 'En Proceso', value: stats.inProgress, icon: Clock, color: 'blue' },
                      { label: 'Resueltos', value: stats.resolved, icon: CheckCircle2, color: 'slate' },
                    ].map((s, i) => (
                      <Card key={i} className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-10 h-10 rounded-lg bg-${s.color}-50 text-${s.color}-600 flex items-center justify-center`}>
                            <s.icon size={20} />
                          </div>
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <TrendingUp size={12} /> +12%
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-500">{s.label}</p>
                        <h4 className="text-2xl font-bold text-slate-900">{s.value}</h4>
                      </Card>
                    ))}
                  </div>
                )}

                {user?.role === UserRole.AGENT && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6 bg-white border border-slate-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <TicketIcon size={20} />
                        </div>
                        <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100">Activos</Badge>
                      </div>
                      <p className="text-sm font-medium text-slate-500">Mis Tickets Asignados</p>
                      <h4 className="text-3xl font-bold text-slate-900">{tickets.filter(t => t.status !== TicketStatus.RESOLVED && t.status !== TicketStatus.CLOSED).length}</h4>
                    </Card>
                    <Card className="p-6 bg-white border border-slate-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <CheckCircle2 size={20} />
                        </div>
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100">Éxito</Badge>
                      </div>
                      <p className="text-sm font-medium text-slate-500">Resueltos este mes</p>
                      <h4 className="text-3xl font-bold text-slate-900">{tickets.filter(t => t.status === TicketStatus.RESOLVED).length}</h4>
                    </Card>
                    <Card className="p-6 bg-white border border-slate-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                          <Clock size={20} />
                        </div>
                        <Badge className="bg-slate-100 text-slate-700 border-slate-200">SLA</Badge>
                      </div>
                      <p className="text-sm font-medium text-slate-500">Tiempo Promedio</p>
                      <h4 className="text-3xl font-bold text-slate-900">1.4h</h4>
                    </Card>
                  </div>
                )}

                {/* Tickets Table */}
                <Card>
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">
                      {user?.role === UserRole.USER ? 'Mis Requerimientos' : user?.role === UserRole.AGENT ? 'Bandeja de Entrada IT' : 'Gestión de Incidentes Global'}
                    </h3>
                    <div className="flex items-center gap-2">
                      {user?.role === UserRole.AGENT && (
                        <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100">
                          {tickets.length} Tickets Asignados
                        </Badge>
                      )}
                      <Button variant="outline" className="py-1.5 px-3 text-xs">
                        <Filter size={14} /> Filtrar
                      </Button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                          <th className="px-6 py-4 font-bold">ID</th>
                          <th className="px-6 py-4 font-bold">Asunto</th>
                          <th className="px-6 py-4 font-bold">Estado</th>
                          <th className="px-6 py-4 font-bold">Prioridad</th>
                          <th className="px-6 py-4 font-bold">Solicitante</th>
                          <th className="px-6 py-4 font-bold">Agente</th>
                          <th className="px-6 py-4 font-bold">Fecha</th>
                          <th className="px-6 py-4 font-bold text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {tickets.map((ticket) => (
                          <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-4">
                              <span className="text-sm font-mono font-bold text-slate-400">{ticket.id}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-0.5">
                                <p className="text-sm font-bold text-slate-900">{ticket.title}</p>
                                <p className="text-xs text-slate-500">{ticket.category}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge className={STATUS_COLORS[ticket.status]}>{ticket.status}</Badge>
                            </td>
                            <td className="px-6 py-4">
                              <Badge className={PRIORITY_COLORS[ticket.priority]}>{ticket.priority}</Badge>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">
                                  {ticket.creatorName.charAt(0)}
                                </div>
                                <span className="text-xs font-medium text-slate-700">{ticket.creatorName}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs font-medium text-indigo-600">
                                {ticket.agentName || 'Pendiente'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs text-slate-500">
                                {new Date(ticket.createdAt).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button 
                                onClick={() => setSelectedTicket(ticket)}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                              >
                                <ChevronRight size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {tickets.length === 0 && (
                    <div className="p-12 text-center space-y-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                        <TicketIcon size={32} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-slate-900">No hay tickets registrados</p>
                        <p className="text-slate-500">Comienza creando un nuevo requerimiento de soporte.</p>
                      </div>
                      <Button onClick={() => setIsCreating(true)}>Crear mi primer ticket</Button>
                    </div>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
