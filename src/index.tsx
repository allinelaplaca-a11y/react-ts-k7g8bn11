import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client'; // Importante para o index funcionar
import { createClient } from '@supabase/supabase-js';
import { Trash2, AlertTriangle, CheckCircle, Activity, Users, LogOut, Lock, Mail, Loader2 } from 'lucide-react';

// --- CONFIGURAÇÃO DO SUPABASE ---
// ⚠️ COLOQUE SUAS CHAVES AQUI (As que você salvou no bloco de notas)
const supabaseUrl = 'https://vdqcvfibhokpmomlvczd.supabase.co'; 
const supabaseKey = 'sb_publishable_rXMXh7hu4KZCxbAxDpSAfw_S39ZOrQS';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- INTERFACES ---
interface Atestado {
  id: number;
  created_at: string;
  funcionario_nome: string;
  setor: string;
  cid_codigo: string;
  risco: string;
  status_validacao: string;
}

// --- COMPONENTE PRINCIPAL (APP) ---
function App() {
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingSession(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loadingSession) {
      return <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Carregando...</div>;
  }

  if (!session) {
    return <LoginScreen />;
  }

  return <Dashboard />;
}

// --- TELA DE LOGIN ---
function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Erro ao entrar. Verifique e-mail e senha.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ backgroundColor: '#eff6ff', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <Activity size={32} color="#2563eb" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>Health Intelligence</h1>
          <p style={{ color: '#6b7280', marginTop: '8px' }}>Faça login para acessar</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>E-mail</label>
            <div style={{ position: 'relative' }}>
              <Mail size={20} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '10px' }} />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} placeholder="seu@email.com" />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Senha</label>
            <div style={{ position: 'relative' }}>
              <Lock size={20} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '10px' }} />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} placeholder="••••••••" />
            </div>
          </div>
          {error && <p style={{ color: '#dc2626', fontSize: '14px', textAlign: 'center' }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ backgroundColor: '#2563eb', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>{loading ? 'Entrando...' : 'Entrar na Plataforma'}</button>
        </form>
      </div>
    </div>
  );
}

// --- DASHBOARD (SISTEMA) ---
function Dashboard() {
  const [atestados, setAtestados] = useState<Atestado[]>([]);
  const [novoAtestado, setNovoAtestado] = useState({ funcionario_nome: '', setor: 'Vendas', cid_codigo: '', risco: 'Normal' });
  const [loading, setLoading] = useState(false);
  const [excluindo, setExcluindo] = useState<number | null>(null);

  useEffect(() => { fetchAtestados(); }, []);

  async function fetchAtestados() {
    setLoading(true);
    const { data, error } = await supabase.from('atestados').select('*').order('created_at', { ascending: false });
    if (error) console.error('Erro ao buscar:', error); else setAtestados(data || []);
    setLoading(false);
  }

  async function salvarRegistro() {
    if (!novoAtestado.funcionario_nome || !novoAtestado.cid_codigo) return alert('Preencha os campos!');
    const statusAuto = novoAtestado.risco === 'Investigar' ? 'INVESTIGAR' : 'OK';
    const { error } = await supabase.from('atestados').insert([{ funcionario_nome: novoAtestado.funcionario_nome, setor: novoAtestado.setor, cid_codigo: novoAtestado.cid_codigo, risco: novoAtestado.risco, status_validacao: statusAuto }]);
    if (error) { alert('Erro ao salvar'); } else { setNovoAtestado({ funcionario_nome: '', setor: 'Vendas', cid_codigo: '', risco: 'Normal' }); fetchAtestados(); }
  }

  async function excluirAtestado(id: number) {
    if(!confirm('Tem certeza?')) return;
    setExcluindo(id);
    const { error } = await supabase.from('atestados').delete().match({ id });
    if (!error) fetchAtestados();
    setExcluindo(null);
  }

  async function handleLogout() { await supabase.auth.signOut(); }

  const totalCasos = atestados.length;
  const alertasRisco = atestados.filter(a => a.status_validacao === 'INVESTIGAR').length;
  const setores = atestados.map(a => a.setor);
  const counts: Record<string, number> = {};
  setores.forEach(function (x) { counts[x] = (counts[x] || 0) + 1; });
  const setorCritico = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, 'Nenhum');

  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', padding: '20px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div><h1 style={{ color: '#111827', fontSize: '28px', fontWeight: 'bold', margin: 0 }}>Health Intelligence</h1><p style={{ color: '#6b7280', margin: '5px 0 0 0' }}>Gestão & Auditoria</p></div>
        <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={fetchAtestados} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', color: '#374151' }}><Activity size={16} /> {loading ? '...' : 'Atualizar'}</button>
            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer', color: '#991b1b' }}><LogOut size={16} /> Sair</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <CardKpi icon={<Users size={20} />} title="TOTAL DE CASOS" value={totalCasos} />
        <CardKpi icon={<AlertTriangle size={20} color="#dc2626" />} title="ALERTAS DE RISCO" value={alertasRisco} isAlert />
        <CardKpi icon={<Activity size={20} />} title="SETOR CRÍTICO" value={setorCritico} />
      </div>

      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ backgroundColor: '#eff6ff', padding: '6px', borderRadius: '6px', color: '#2563eb' }}>+</span> Novo Registro</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '200px' }}><label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>Funcionário</label><input style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} placeholder="Nome" value={novoAtestado.funcionario_nome} onChange={e => setNovoAtestado({...novoAtestado, funcionario_nome: e.target.value})}/></div>
          <div style={{ flex: 1, minWidth: '150px' }}><label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>Setor</label><select style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: 'white' }} value={novoAtestado.setor} onChange={e => setNovoAtestado({...novoAtestado, setor: e.target.value})}><option>Vendas</option><option>TI</option><option>RH</option><option>Operações</option></select></div>
          <div style={{ flex: 1, minWidth: '100px' }}><label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>CID</label><input style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} placeholder="Cód." value={novoAtestado.cid_codigo} onChange={e => setNovoAtestado({...novoAtestado, cid_codigo: e.target.value})}/></div>
          <div style={{ flex: 1, minWidth: '150px' }}><label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>Risco</label><select style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: 'white' }} value={novoAtestado.risco} onChange={e => setNovoAtestado({...novoAtestado, risco: e.target.value})}><option>Normal</option><option>Investigar</option></select></div>
          <button onClick={salvarRegistro} style={{ padding: '10px 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Salvar</button>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}><tr><th style={{ padding: '16px 24px', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Funcionário</th><th style={{ padding: '16px 24px', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Setor</th><th style={{ padding: '16px 24px', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>CID</th><th style={{ padding: '16px 24px', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Status</th><th style={{ padding: '16px 24px', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', textAlign: 'right' }}>Ação</th></tr></thead>
            <tbody style={{ fontSize: '14px', color: '#111827' }}>
              {atestados.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '16px 24px', fontWeight: '600', color: '#111827' }}>{item.funcionario_nome}</td>
                  <td style={{ padding: '16px 24px' }}><span style={{ backgroundColor: item.setor === 'Vendas' ? '#fff7ed' : '#f0f9ff', color: item.setor === 'Vendas' ? '#c2410c' : '#0369a1', padding: '4px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: '600' }}>{item.setor}</span></td>
                  <td style={{ padding: '16px 24px', fontFamily: 'monospace', fontWeight: '600' }}>{item.cid_codigo}</td>
                  <td style={{ padding: '16px 24px' }}>{item.status_validacao === 'INVESTIGAR' ? (<span style={{ color: '#b91c1c', fontWeight: '700', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}><AlertTriangle size={14} /> RISCO</span>) : (<span style={{ color: '#047857', fontWeight: '700', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}><CheckCircle size={14} /> NORMAL</span>)}</td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}><button onClick={() => excluirAtestado(item.id)} disabled={excluindo === item.id} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }} title="Excluir Registro">{excluindo === item.id ? <Loader2 className="animate-spin" size={18}/> : <Trash2 size={18} />}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CardKpi({ icon, title, value, isAlert = false }: any) {
  return (
    <div style={{ flex: 1, minWidth: '240px', backgroundColor: isAlert ? '#fef2f2' : 'white', padding: '24px', borderRadius: '12px', border: isAlert ? '1px solid #fecaca' : 'none', boxShadow: isAlert ? 'none' : '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: isAlert ? '#991b1b' : '#6b7280', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>{icon} {title}</div>
      <div style={{ fontSize: '36px', fontWeight: 'bold', color: isAlert ? '#b91c1c' : '#111827' }}>{value}{isAlert && <span style={{ display: 'block', fontSize: '12px', fontWeight: 'normal', marginTop: '5px' }}>Requerem atenção</span>}</div>
    </div>
  );
}

// --- RENDERIZAÇÃO FINAL (O MÁGICO) ---
const rootElement = document.getElementById('root');
const root = createRoot(rootElement!);
root.render(<App />);
