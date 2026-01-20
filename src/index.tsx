
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { AlertTriangle, CheckCircle, RefreshCw, X, Check, Loader2, Plus, Save, Activity, Users, TrendingUp, Trash2 } from 'lucide-react';

// ==================================================
// CONFIGURAÇÃO (SUAS CHAVES AQUI)
// ==================================================

const SUPABASE_URL = "https://vdqcvfibhokpmomlvczd.supabase.co"; 
const SUPABASE_KEY = "sb_publishable_rXMXh7hu4KZCxbAxDpSAfw_S39ZOrQS"; 

// ==================================================

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function App() {
  const [atestados, setAtestados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, risco: 0, setorCritico: '-' });

  // Estados para o Formulário
  const [novoNome, setNovoNome] = useState("");
  const [novoSetor, setNovoSetor] = useState("Vendas");
  const [novoCid, setNovoCid] = useState("");
  const [novoStatus, setNovoStatus] = useState("Normal");
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(null); // ID do item sendo excluído

  function calcularEstatisticas(dados) {
    if (!dados || dados.length === 0) {
      setStats({ total: 0, risco: 0, setorCritico: '-' });
      return;
    }

    const total = dados.length;
    const risco = dados.filter(item => item.status_validacao === 'INVESTIGAR').length;
    
    const setores = dados.map(d => d.setor);
    const contagem = {};
    let maiorSetor = '-';
    let maxCount = 0;

    for (const s of setores) {
      contagem[s] = (contagem[s] || 0) + 1;
      if (contagem[s] > maxCount) {
        maxCount = contagem[s];
        maiorSetor = s;
      }
    }

    setStats({ total, risco, setorCritico: maiorSetor });
  }

  async function buscarDados() {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("atestados")
        .select("*");
        
      if (error) throw error;
      setAtestados(data || []);
      calcularEstatisticas(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // --- NOVA FUNÇÃO: EXCLUIR ---
  async function excluirAtestado(id) {
    if (!confirm("Tem certeza que deseja excluir este registro?")) return;

    setExcluindo(id);
    try {
      const { error } = await supabase
        .from('atestados')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Atualiza a lista localmente sem precisar recarregar tudo do zero
      const novaLista = atestados.filter(item => item.id !== id);
      setAtestados(novaLista);
      calcularEstatisticas(novaLista);
      
    } catch (err: any) {
      alert("Erro ao excluir: " + err.message);
    } finally {
      setExcluindo(null);
    }
  }
  // -----------------------------

  async function cadastrarAtestado(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      const novoAtestado = {
        funcionario_nome: novoNome,
        setor: novoSetor,
        cid_codigo: novoCid,
        status_validacao: novoStatus
      };

      const { error } = await supabase.from('atestados').insert([novoAtestado]);
      if (error) throw error;

      setNovoNome("");
      setNovoCid("");
      buscarDados(); 

    } catch (err: any) {
      alert("Erro: " + err.message);
    } finally {
      setSalvando(false);
    }
  }

  useEffect(() => {
    buscarDados();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#111827', letterSpacing: '-0.5px' }}>Health Intelligence</h1>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>Gestão & Auditoria</p>
          </div>
          <button onClick={buscarDados} style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: '#374151' }}>
            <RefreshCw size={16} /> Atualizar
          </button>
        </div>

        {/* DASHBOARD */}
        {!loading && !error && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px', color: '#6b7280', fontSize: '12px', fontWeight: 'bold' }}><Users size={16} /> TOTAL DE CASOS</div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#111827' }}>{stats.total}</div>
            </div>
            <div style={{ backgroundColor: '#fff1f2', padding: '20px', borderRadius: '12px', border: '1px solid #fecdd3' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px', color: '#9f1239', fontSize: '12px', fontWeight: 'bold' }}><Activity size={16} /> ALERTAS DE RISCO</div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#be123c' }}>{stats.risco}</div>
              <div style={{ fontSize: '12px', color: '#be123c' }}>Requerem atenção</div>
            </div>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px', color: '#6b7280', fontSize: '12px', fontWeight: 'bold' }}><TrendingUp size={16} /> SETOR CRÍTICO</div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#111827' }}>{stats.setorCritico}</div>
            </div>
          </div>
        )}

        {/* FORMULÁRIO */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', marginBottom: '30px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#1f2937' }}>
            <div style={{ backgroundColor: '#eff6ff', padding: '6px', borderRadius: '6px' }}><Plus size={18} color="#2563eb" /></div>
            Novo Registro
          </h2>
          <form onSubmit={cadastrarAtestado} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '20px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#4b5563' }}>Funcionário</label>
              <input type="text" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} placeholder="Nome" required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#4b5563' }}>Setor</label>
              <select value={novoSetor} onChange={(e) => setNovoSetor(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: 'white' }}>
                <option value="Vendas">Vendas</option>
                <option value="TI">TI</option>
                <option value="Financeiro">Financeiro</option>
                <option value="RH">RH</option>
                <option value="Operações">Operações</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#4b5563' }}>CID</label>
              <input type="text" value={novoCid} onChange={(e) => setNovoCid(e.target.value)} placeholder="Cód." required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#4b5563' }}>Risco</label>
              <select value={novoStatus} onChange={(e) => setNovoStatus(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: 'white' }}>
                <option value="Normal">Normal</option>
                <option value="INVESTIGAR">INVESTIGAR</option>
              </select>
            </div>
            <button type="submit" disabled={salvando} style={{ backgroundColor: salvando ? '#93c5fd' : '#2563eb', color: 'white', padding: '10px', borderRadius: '6px', border: 'none', fontWeight: '600', cursor: salvando ? 'not-allowed' : 'pointer' }}>
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </form>
        </div>

        {/* TABELA COM BOTÃO DE EXCLUIR */}
        {!loading && !error && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: '#6b7280' }}>FUNCIONÁRIO</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: '#6b7280' }}>SETOR</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: '#6b7280' }}>CID</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: '#6b7280' }}>STATUS</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', color: '#6b7280' }}>AÇÃO</th>
                </tr>
              </thead>
              <tbody>
                {atestados.map((item: any) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '16px 24px', fontWeight: '600', color: '#111827' }}>{item.funcionario_nome}</td>
                    <td style={{ padding: '16px 24px' }}><span style={{ backgroundColor: item.setor === 'Vendas' ? '#fff7ed' : '#f0f9ff', color: item.setor === 'Vendas' ? '#c2410c' : '#0369a1', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>{item.setor}</span></td>
                    <td style={{ padding: '16px 24px', fontFamily: 'monospace', fontWeight: '600' }}>{item.cid_codigo}</td>
                    <td style={{ padding: '16px 24px' }}>
                      {item.status_validacao === 'INVESTIGAR' ? (
                        <span style={{ color: '#b91c1c', fontWeight: '700', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>⚠️ RISCO</span>
                      ) : (
                        <span style={{ color: '#047857', fontWeight: '700', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>✅ NORMAL</span>
                      )}
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <button 
                        onClick={() => excluirAtestado(item.id)}
                        disabled={excluindo === item.id}
                        style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}
                        title="Excluir Registro"
                      >
                        {excluindo === item.id ? <Loader2 className="animate-spin" size={18}/> : <Trash2 size={18} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

import { createRoot } from 'react-dom/client';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement!);

root.render(
  <App />
);
