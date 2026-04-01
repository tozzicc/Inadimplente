import { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Users, 
  AlertTriangle, 
  Plus, 
  Search,
  LayoutDashboard,
  Table as TableIcon,
  Settings,
  LogOut,
  Edit2,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import type { Inadimplente, Status } from './types';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const CHART_DATA = [
  { month: 'Jan', valor: 4500 },
  { month: 'Fev', valor: 5200 },
  { month: 'Mar', valor: 8900 },
  { month: 'Abr', valor: 6100 },
];

export default function App() {
  const [data, setData] = useState<Inadimplente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Inadimplente | null>(null);

  // Fetch data from API
  const fetchData = async () => {
    try {
      const response = await fetch(`${API_URL}/inadimplentes`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  useMemo(() => {
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const totalOverdue = data.filter(d => d.status === 'Atrasado').reduce((acc, curr) => acc + curr.valor, 0);
    const totalPending = data.filter(d => d.status === 'Pendente').reduce((acc, curr) => acc + curr.valor, 0);
    const debtorCount = new Set(data.filter(d => d.status !== 'Pago').map(d => d.id)).size;
    return { totalOverdue, totalPending, debtorCount };
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(item => 
      item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.documento.includes(searchTerm)
    );
  }, [data, searchTerm]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza?')) {
      try {
        await fetch(`${API_URL}/inadimplentes/${id}`, { method: 'DELETE' });
        fetchData();
      } catch (error) {
        console.error('Erro ao excluir:', error);
      }
    }
  };

  const handleSave = async (item: Partial<Inadimplente>) => {
    try {
      const url = editingItem 
        ? `${API_URL}/inadimplentes/${editingItem.id}` 
        : `${API_URL}/inadimplentes`;
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        throw new Error(`Erro do servidor: ${response.statusText}`);
      }

      await fetchData();
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Falha ao salvar dados. Verifique se o servidor backend está rodando e se o Prisma foi inicializado corretamente.');
    }
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo">
          <BarChart3 size={28} />
          <span>FinTrack Pro</span>
        </div>
        <nav className="nav-links">
          <button className="nav-item active"><LayoutDashboard size={20} />Dashboard</button>
          <button className="nav-item"><TableIcon size={20} />Inadimplentes</button>
          <button className="nav-item"><Users size={20} />Clientes</button>
          <button className="nav-item"><Settings size={20} />Configurações</button>
        </nav>
        <div style={{ marginTop: 'auto' }}>
          <button className="nav-item"><LogOut size={20} />Sair</button>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div>
            <h1>Dashboard Financeiro</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Gestão de Inadimplência</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input type="text" placeholder="Buscar..." className="input" style={{ paddingLeft: '2.5rem', width: '250px' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={() => { setEditingItem(null); setIsModalOpen(true); }}><Plus size={18} />Novo</button>
          </div>
        </header>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="label">Em Atraso</div>
            <div className="value" style={{ color: 'var(--accent-red)' }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalOverdue)}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--accent-red)' }}><AlertTriangle size={12} />Ações necessárias</div>
          </div>
          <div className="stat-card">
            <div className="label">Pendente</div>
            <div className="value" style={{ color: 'var(--accent-orange)' }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalPending)}</div>
          </div>
          <div className="stat-card">
            <div className="label">Ativos</div>
            <div className="value">{stats.debtorCount}</div>
          </div>
        </div>

        <div className="stat-card" style={{ marginBottom: '2.5rem', height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={CHART_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
              <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                {CHART_DATA.map((_, index) => <Cell key={`cell-${index}`} fill={index === 2 ? 'var(--accent-red)' : 'var(--accent-blue)'} fillOpacity={0.8} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr><th>Nome</th><th>Documento</th><th>Valor</th><th>Vencimento</th><th>Status</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.id}>
                  <td>{item.nome}</td>
                  <td>{item.documento}</td>
                  <td>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor)}</td>
                  <td>{new Date(item.dataVencimento).toLocaleDateString('pt-BR')}</td>
                  <td><span className={`badge badge-${item.status.toLowerCase() === 'atrasado' ? 'overdue' : item.status.toLowerCase() === 'pendente' ? 'pending' : 'paid'}`}>{item.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="action-btn" onClick={() => { setEditingItem(item); setIsModalOpen(true); }}><Edit2 size={16} /></button>
                      <button className="action-btn" onClick={() => handleDelete(item.id)}><Trash2 size={16} /></button>
                      <button className="action-btn"><ExternalLink size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingItem ? 'Editar' : 'Novo'}</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              handleSave({
                nome: f.get('nome') as string,
                documento: f.get('documento') as string,
                valor: parseFloat(f.get('valor') as string),
                dataVencimento: f.get('dataVencimento') as string,
                status: f.get('status') as Status,
              });
            }}>
              <div className="form-group"><label>Nome</label><input name="nome" className="input" defaultValue={editingItem?.nome} required /></div>
              <div className="form-group"><label>Documento</label><input name="documento" className="input" defaultValue={editingItem?.documento} required /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group"><label>Valor</label><input name="valor" type="number" step="0.01" className="input" defaultValue={editingItem?.valor} required /></div>
                <div className="form-group"><label>Vencimento</label><input name="dataVencimento" type="date" className="input" defaultValue={editingItem?.dataVencimento} required /></div>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" className="input" defaultValue={editingItem?.status || 'Pendente'}>
                  <option value="Pendente">Pendente</option><option value="Atrasado">Atrasado</option><option value="Pago">Pago</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="action-btn" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
