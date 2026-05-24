import { useEffect, useMemo, useState } from 'react'
import { health } from './api'
import { DEFAULT_PARCELAS, SHADE_LABELS, loadParcelas, newParcelaId, saveParcelas } from './parcelas'
import { IconEdit, IconHome, IconPlus, IconTrash } from './icons'
import ParcelaForm from './components/ParcelaForm'
import CSPCard from './components/CSPCard'
import BayesianCard from './components/BayesianCard'
import MLCard from './components/MLCard'
import MDPCard from './components/MDPCard'

const EMPTY = {
  id: '', nombre: 'Nueva parcela', region: '',
  altitud: 1500, ph: 5.5, sombra: 1,
  N: 90, P: 30, K: 30,
  temperature: 22, humidity: 70, rainfall: 1500,
}

export default function Dashboard({ onBackToLanding }) {
  const [parcelas, setParcelas] = useState(loadParcelas)
  const [selectedId, setSelectedId] = useState(parcelas[0]?.id)
  const [editing, setEditing] = useState(null)
  const [backendStatus, setBackendStatus] = useState('checking')

  useEffect(() => { saveParcelas(parcelas) }, [parcelas])

  useEffect(() => {
    health().then(() => setBackendStatus('online')).catch(() => setBackendStatus('offline'))
  }, [])

  const selected = useMemo(
    () => parcelas.find((p) => p.id === selectedId) || parcelas[0],
    [parcelas, selectedId],
  )

  const addParcela = () => setEditing({ ...EMPTY, id: newParcelaId() })

  const saveParcela = (p) => {
    const exists = parcelas.some((x) => x.id === p.id)
    const next = exists
      ? parcelas.map((x) => (x.id === p.id ? p : x))
      : [...parcelas, p]
    setParcelas(next)
    setSelectedId(p.id)
    setEditing(null)
  }

  const removeParcela = (id) => {
    const next = parcelas.filter((p) => p.id !== id)
    setParcelas(next.length ? next : DEFAULT_PARCELAS)
    if (selectedId === id) setSelectedId((next[0] || DEFAULT_PARCELAS[0]).id)
  }

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <div className="app-brand">
          <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--cm-coffee)', display: 'inline-block' }} />
          CoffeeMind GT · dashboard
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span className={`chip ${backendStatus === 'online' ? 'chip--ok' : backendStatus === 'offline' ? 'chip--risk' : 'chip--neutral'}`}>
            backend {backendStatus}
          </span>
          <button className="btn btn--ghost" onClick={onBackToLanding}>
            <IconHome /> Inicio
          </button>
        </div>
      </header>

      <aside className="app-sidebar">
        <div>
          <div className="sidebar__title">Parcelas ({parcelas.length})</div>
          {parcelas.map((p) => (
            <div key={p.id} style={{ position: 'relative' }}>
              <button
                className={`parcela-pill ${p.id === selectedId ? 'parcela-pill--active' : ''}`}
                onClick={() => setSelectedId(p.id)}
                style={{ width: '100%' }}
              >
                <span className="parcela-pill__name">{p.nombre}</span>
                <span className="parcela-pill__meta">
                  {p.region || 'sin región'} · {p.altitud} m · pH {p.ph} · {SHADE_LABELS[p.sombra]}
                </span>
              </button>
            </div>
          ))}
        </div>

        <button className="btn btn--primary" onClick={addParcela} style={{ width: '100%', justifyContent: 'center' }}>
          <IconPlus /> Agregar parcela
        </button>
      </aside>

      <main className="app-main">
        {selected && (
          <>
            <div className="app-main__header">
              <div>
                <h2 style={{ marginBottom: '0.25rem' }}>{selected.nombre}</h2>
                <div className="muted small">
                  {selected.region || 'sin región'} · altitud {selected.altitud} m ·
                  pH {selected.ph} · {SHADE_LABELS[selected.sombra]} ·
                  T {selected.temperature}°C · H {selected.humidity}% ·
                  lluvia {selected.rainfall} mm
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn--secondary btn--sm" onClick={() => setEditing(selected)}>
                  <IconEdit /> Editar
                </button>
                <button className="btn btn--ghost btn--sm" onClick={() => removeParcela(selected.id)}>
                  <IconTrash /> Eliminar
                </button>
              </div>
            </div>

            <div className="modules-grid">
              <CSPCard parcela={selected} />
              <BayesianCard parcela={selected} />
              <MLCard parcela={selected} />
              <MDPCard parcela={selected} />
            </div>
          </>
        )}
      </main>

      {editing && (
        <ParcelaForm
          initial={editing}
          onSave={saveParcela}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  )
}
