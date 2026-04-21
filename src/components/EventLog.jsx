import { useState } from 'react'
import { Card, ModalCard, Modal, BtnGhost, BtnDanger, BtnPrimary } from './UI.jsx'
import { formatDate } from '../constants.js'

export default function EventLog({ members, setMembers, events, setEvents }) {
  const [editingEvent, setEditingEvent] = useState(null)
  const [editAttendees, setEditAttendees] = useState([])
  const [search, setSearch] = useState('')
  const [openGroups, setOpenGroups] = useState({})

  const sorted = [...events].sort((a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id)

  // Group events that share the same bossId + date + time into one card
  const groups = []
  const seen = new Set()
  sorted.forEach(ev => {
    if (seen.has(ev.id)) return
    const groupKey = `${ev.bossId}|${ev.date}|${ev.time}`
    const siblings = sorted.filter(e =>
      !seen.has(e.id) &&
      `${e.bossId}|${e.date}|${e.time}` === groupKey
    )
    siblings.forEach(e => seen.add(e.id))
    groups.push({ key: groupKey, events: siblings.sort((a, b) => a.id - b.id), bossName: ev.bossName, date: ev.date, time: ev.time, points: ev.points, category: ev.category })
  })

  const filteredGroups = groups.filter(g =>
    g.bossName.toLowerCase().includes(search.toLowerCase()) ||
    g.date.includes(search)
  )

  function downloadCSV() {
    const rows = [['Date', 'Time', 'Boss / Event', 'Points', 'Members Attended', 'Attendee Names']]
    sorted.forEach(ev => {
      const attendeeNames = ev.attendees
        .map(id => members.find(m => m.id === id)?.name ?? `#${id}`)
        .join('; ')
      rows.push([ev.date, ev.time, ev.bossName, ev.points, ev.attendees.length, attendeeNames])
    })
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `saintz-event-log-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function toggleGroup(key) {
    setOpenGroups(p => ({ ...p, [key]: !p[key] }))
  }

  function deleteEvent(eid) {
    const ev = events.find(e => e.id === eid); if (!ev) return
    setMembers(p => p.map(m => ev.attendees.includes(m.id)
      ? { ...m, totalPoints: Math.max(0, m.totalPoints - ev.points) }
      : m
    ))
    setEvents(p => p.filter(e => e.id !== eid))
  }

  function deleteGroup(evIds) {
    evIds.forEach(id => deleteEvent(id))
  }

  function startEdit(ev) { setEditingEvent(ev); setEditAttendees([...ev.attendees]) }

  function saveEdit() {
    const added   = editAttendees.filter(id => !editingEvent.attendees.includes(id))
    const removed = editingEvent.attendees.filter(id => !editAttendees.includes(id))
    setMembers(p => p.map(m => {
      let pts = m.totalPoints
      if (added.includes(m.id))   pts += editingEvent.points
      if (removed.includes(m.id)) pts  = Math.max(0, pts - editingEvent.points)
      return { ...m, totalPoints: pts }
    }))
    setEvents(p => p.map(e => e.id === editingEvent.id ? { ...e, attendees: editAttendees } : e))
    setEditingEvent(null)
  }

  const totalEvents = filteredGroups.reduce((s, g) => s + g.events.length, 0)

  return (
    <div className="fade-up">
      {/* Search + toolbar */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <input
          className="w-72 bg-[rgba(19,34,56,0.5)] border border-border text-txt placeholder-muted/40 rounded-xl px-3 py-2 text-sm outline-none transition-all focus:border-cyan/60 focus:ring-2 focus:ring-cyan/10"
          placeholder="Search events…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted">{totalEvents} event{totalEvents !== 1 ? 's' : ''}</span>
          {events.length > 0 && (
            <button
              onClick={downloadCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[rgba(24,44,71,0.7)] border border-gold/30 text-gold text-sm font-semibold cursor-pointer transition-all hover:border-gold/70 hover:text-gold-h"
            >
              ⬇ CSV
            </button>
          )}
        </div>
      </div>

      {filteredGroups.length === 0 ? (
        <Card className="p-10 text-center">
          <div className="text-3xl mb-3">📜</div>
          <div className="text-sm font-semibold text-muted">No events found.</div>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {filteredGroups.map(g => {
            const isMulti = g.events.length > 1
            const isOpen  = openGroups[g.key]
            const totalAttendees = [...new Set(g.events.flatMap(e => e.attendees))].length

            return (
              <Card key={g.key} className="overflow-hidden">
                {/* Header row */}
                <div className="flex items-center gap-4 p-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 border ${
                    g.category === 'arena' ? 'bg-purple/10 border-purple/25' : 'bg-cyan/10 border-cyan/25'
                  }`}>
                    {g.category === 'arena' ? '⚔️' : '🐉'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-txt">{g.bossName}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                        g.category === 'arena'
                          ? 'bg-purple/10 text-yellow border-yellow/30'
                          : 'bg-cyan/10 text-cyan border-indigo/30'
                      }`}>+{g.points} pts</span>
                      {isMulti && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/25 text-red-400 font-semibold">
                          {g.events.length} rallies
                        </span>
                      )}
                      <span className="text-xs text-muted">{formatDate(g.date)} · {g.time}</span>
                    </div>
                    <div className="text-xs text-muted mt-0.5">
                      {isMulti ? `${totalAttendees} total members` : `${g.events[0].attendees.length} members`}
                    </div>
                  </div>

                  <div className="flex gap-1.5 flex-shrink-0 items-center">
                    {/* Single event: show Edit + Delete directly */}
                    {!isMulti && (
                      <BtnGhost className="text-xs py-1 px-2.5" onClick={() => startEdit(g.events[0])}>Edit</BtnGhost>
                    )}
                    <BtnDanger
                      className="text-xs py-1 px-2.5"
                      onClick={() => deleteGroup(g.events.map(e => e.id))}
                    >
                      {isMulti ? 'Delete All' : 'Delete'}
                    </BtnDanger>
                    {/* Collapsible toggle for multi-rally */}
                    {isMulti && (
                      <button
                        onClick={() => toggleGroup(g.key)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-border/40 border border-border text-muted hover:border-gold/40 hover:text-gold transition-all cursor-pointer text-xs"
                      >
                        {isOpen ? '▲' : '▼'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Single event attendees (always visible) */}
                {!isMulti && (
                  <div className="flex flex-wrap gap-1.5 px-4 pb-4 -mt-1">
                    {g.events[0].attendees.map(id => members.find(m => m.id === id)).filter(Boolean).map(m => (
                      <span key={m.id} className="text-xs px-2 py-0.5 rounded-full bg-white/[0.05] border border-border/70 text-muted">
                        {m.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Multi-rally collapsible body */}
                {isMulti && isOpen && (
                  <div className="border-t border-border/60">
                    {g.events.map((ev, idx) => {
                      const rallyMembers = ev.attendees.map(id => members.find(m => m.id === id)).filter(Boolean)
                      return (
                        <div key={ev.id} className={`px-4 py-3 ${idx < g.events.length - 1 ? 'border-b border-border/40' : ''}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-lg">
                                Rally {idx + 1}
                              </span>
                              <span className="text-xs text-muted">{rallyMembers.length} members</span>
                            </div>
                            <div className="flex gap-1.5">
                              <BtnGhost className="text-xs py-0.5 px-2" onClick={() => startEdit(ev)}>Edit</BtnGhost>
                              <BtnDanger className="text-xs py-0.5 px-2" onClick={() => deleteEvent(ev.id)}>Delete</BtnDanger>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {rallyMembers.length === 0
                              ? <span className="text-xs text-muted/50 italic">No attendees</span>
                              : rallyMembers.map(m => (
                                <span key={m.id} className="text-xs px-2 py-0.5 rounded-full bg-red-500/[0.06] border border-red-500/20 text-red-200">
                                  {m.name}
                                </span>
                              ))
                            }
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Edit Attendance Modal */}
      <Modal show={!!editingEvent} onClose={() => setEditingEvent(null)}>
        <ModalCard className="w-[420px] max-h-[80vh] overflow-y-auto p-7">
          <div className="text-base font-bold text-yellow mb-1">Edit Attendance</div>
          <div className="text-sm text-muted mb-5">
            {editingEvent?.bossName} · {editingEvent && formatDate(editingEvent.date)}
          </div>
          <div className="space-y-0 rounded-xl border border-border overflow-hidden mb-5">
            {members.map(m => {
              const checked = editAttendees.includes(m.id)
              return (
                <div
                  key={m.id}
                  onClick={() => setEditAttendees(p => p.includes(m.id) ? p.filter(id => id !== m.id) : [...p, m.id])}
                  className={`flex items-center gap-3 px-4 py-2.5 border-b border-border/50 last:border-0 cursor-pointer transition-colors ${checked ? 'bg-yellow/[0.06]' : 'hover:bg-white/[0.03]'}`}
                >
                  <div className={`w-[18px] h-[18px] rounded border flex items-center justify-center flex-shrink-0 transition-all ${checked ? 'border-gold bg-gold/20 shadow-[0_0_8px_rgba(244,185,66,0.3)]' : 'border-border/70'}`}>
                    {checked && <span className="text-yellow text-xs">✓</span>}
                  </div>
                  <span className="text-sm font-medium text-txt">{m.name}</span>
                </div>
              )
            })}
          </div>
          <div className="flex gap-2.5">
            <BtnPrimary className="flex-1" onClick={saveEdit}>Save Changes</BtnPrimary>
            <BtnGhost className="flex-1" onClick={() => setEditingEvent(null)}>Cancel</BtnGhost>
          </div>
        </ModalCard>
      </Modal>
    </div>
  )
}

