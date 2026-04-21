import { useState } from 'react'
import { Card, Label, Input, BtnPrimary, BtnGhost, BtnDanger } from './UI.jsx'

export default function EventManagement({ guildEvents, setGuildEvents }) {
  const [form, setForm] = useState({ name: '', points: '' })
  const [msg,  setMsg]  = useState('')
  const [edits, setEdits] = useState({})
  const [saved, setSaved] = useState({})

  const nextId = () => {
    const nums = guildEvents.map(e => parseInt(e.id.replace('ge',''))).filter(Number.isFinite)
    return `ge${Math.max(0, ...nums) + 1}`
  }

  function addEvent() {
    const name = form.name.trim()
    if (!name) { setMsg('Enter an event name.'); return }
    const points = Math.max(0, parseInt(form.points) || 0)
    setGuildEvents(p => [...p, { id: nextId(), name, points }])
    setForm({ name: '', points: '' })
    setMsg(`✦ "${name}" added!`)
    setTimeout(() => setMsg(''), 2500)
  }

  function startEdit(ev) {
    setEdits(p => ({ ...p, [ev.id]: { name: ev.name, points: ev.points } }))
  }

  function saveEdit(ev) {
    const ed = edits[ev.id]; if (!ed) return
    const name = ed.name.trim(); if (!name) return
    const points = Math.max(0, parseInt(ed.points) || 0)
    setGuildEvents(p => p.map(x => x.id === ev.id ? { ...x, name, points } : x))
    setEdits(p => { const n = { ...p }; delete n[ev.id]; return n })
    setSaved(p => ({ ...p, [ev.id]: true }))
    setTimeout(() => setSaved(p => ({ ...p, [ev.id]: false })), 1800)
  }

  function cancelEdit(id) {
    setEdits(p => { const n = { ...p }; delete n[id]; return n })
  }

  function deleteEvent(id) {
    setGuildEvents(p => p.filter(x => x.id !== id))
  }

  return (
    <div className="fade-up grid grid-cols-[1fr_300px] gap-5 items-start">

      {/* Event list */}
      <Card className="overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/60">
          <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/25 flex items-center justify-center text-lg">🎖️</div>
          <div>
            <div className="text-base font-bold text-gold">Guild Events</div>
            <div className="text-xs text-muted mt-0.5">{guildEvents.length} event{guildEvents.length !== 1 ? 's' : ''} configured</div>
          </div>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-[1fr_130px_130px] border-b border-border/60">
          {['Event Name', 'Points', ''].map((h, i) => (
            <div key={i} className="px-5 py-2.5 text-[0.67rem] font-semibold text-muted uppercase tracking-widest">{h}</div>
          ))}
        </div>

        {/* Rows */}
        {guildEvents.length === 0 ? (
          <div className="p-10 text-center">
            <div className="text-3xl mb-3">🎖️</div>
            <div className="text-sm text-muted">No events yet. Add one →</div>
          </div>
        ) : (
          <div className="max-h-[520px] overflow-y-auto">
            {guildEvents.map(ev => {
              const editing = !!edits[ev.id]
              const isSaved = saved[ev.id]
              return (
                <div
                  key={ev.id}
                  className={`grid grid-cols-[1fr_130px_130px] items-center border-b border-border/60 last:border-0 transition-colors ${isSaved ? 'bg-emerald/[0.08]' : editing ? 'bg-indigo/5' : 'hover:bg-white/[0.02]'}`}
                >
                  <div className="px-5 py-3">
                    {editing
                      ? <Input value={edits[ev.id].name} onChange={e => setEdits(p => ({ ...p, [ev.id]: { ...p[ev.id], name: e.target.value } }))} onKeyDown={e => e.key === 'Enter' && saveEdit(ev)} className="text-sm py-1 px-2 h-8" />
                      : <span className="text-sm font-medium text-txt">{ev.name}</span>
                    }
                  </div>
                  <div className="px-5 py-3">
                    {editing
                      ? <div className="flex items-center gap-1.5">
                          <Input type="number" min={0} value={edits[ev.id].points} onChange={e => setEdits(p => ({ ...p, [ev.id]: { ...p[ev.id], points: e.target.value } }))} onKeyDown={e => e.key === 'Enter' && saveEdit(ev)} className="text-sm py-1 px-2 h-8 w-20" />
                          <span className="text-xs text-muted">pts</span>
                        </div>
                      : isSaved
                        ? <span className="text-xs text-emerald font-semibold">✓ Saved</span>
                        : <span className="text-sm font-bold text-gold">+{ev.points} pts</span>
                    }
                  </div>
                  <div className="px-5 py-3">
                    {editing
                      ? <div className="flex gap-1.5">
                          <button onClick={() => saveEdit(ev)} className="text-xs px-2 py-1 rounded bg-cyan/20 border border-cyan/40 text-cyan hover:bg-indigo/30 cursor-pointer transition-all">Save</button>
                          <button onClick={() => cancelEdit(ev.id)} className="text-xs px-1.5 py-1 rounded bg-border/50 border border-border text-muted hover:text-txt cursor-pointer transition-all">✕</button>
                        </div>
                      : <div className="flex gap-1.5">
                          <BtnGhost className="text-xs py-1 px-2.5" onClick={() => startEdit(ev)}>Edit</BtnGhost>
                          <BtnDanger className="text-xs py-1 px-2" onClick={() => deleteEvent(ev.id)}>Delete</BtnDanger>
                        </div>
                    }
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Add event form */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-gold/10 border border-gold/25 flex items-center justify-center text-sm flex-shrink-0">✦</div>
          <div className="text-sm font-semibold text-txt">Add Event</div>
        </div>
        <div className="space-y-3">
          <div>
            <Label>Event Name</Label>
            <Input
              placeholder="e.g. GvG Won…"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && addEvent()}
            />
          </div>
          <div>
            <Label>Points</Label>
            <Input
              type="number" min={0}
              placeholder="e.g. 5"
              value={form.points}
              onChange={e => setForm(p => ({ ...p, points: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && addEvent()}
            />
          </div>
          {msg && <div className={`text-sm italic ${msg.startsWith('✦') ? 'text-emerald' : 'text-red-400'}`}>{msg}</div>}
          <BtnPrimary className="w-full mt-1" onClick={addEvent}>+ Add Event</BtnPrimary>
        </div>

        {/* Quick presets */}
        <div className="mt-5 pt-4 border-t border-border/50">
          <div className="text-xs text-muted uppercase tracking-widest mb-3">Quick Presets</div>
          <div className="flex flex-col gap-2">
            {[
              { name: 'GvG Won',   points: 5 },
              { name: 'GvG Lose',  points: 3 },
              { name: 'GvG Draw',  points: 4 },
              { name: 'Guild Boss', points: 2 },
            ].map(preset => (
              <button
                key={preset.name}
                onClick={() => setForm({ name: preset.name, points: String(preset.points) })}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-border/30 border border-border/60 hover:border-gold/40 hover:bg-gold/[0.06] transition-all cursor-pointer text-left"
                style={{ background: 'none' }}
              >
                <span className="text-xs font-medium text-muted">{preset.name}</span>
                <span className="text-xs text-gold font-bold">+{preset.points} pts</span>
              </button>
            ))}
          </div>
          <div className="text-[0.68rem] text-muted/50 mt-2 italic">Click a preset to fill the form</div>
        </div>
      </Card>

    </div>
  )
}
