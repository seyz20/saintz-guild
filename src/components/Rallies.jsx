import { useState } from 'react'
import { Card, Label, Input, BtnPrimary, BtnGhost, BtnDanger } from './UI.jsx'

export default function Rallies({ members, fieldBosses, guildEvents, events, setEvents, setMembers, nextEventId, setNextEventId }) {
  // Step 1: boss input
  const [bossInput, setBossInput]   = useState('')
  const [sessionBosses, setSessionBosses] = useState([]) // [{ sourceId, name, points }]

  // Step 2: attendance grid — checked[memberId][bossIdx] = bool
  const [checked, setChecked]       = useState({})
  const [submitted, setSubmitted]   = useState(false)
  const [submitSummary, setSubmitSummary] = useState(null)

  // All available bosses to pick from (field bosses + guild events)
  const allAvailable = [
    ...fieldBosses.map(b => ({ id: b.id, name: b.name, points: b.points, type: 'field' })),
    ...guildEvents.map(ge => ({ id: ge.id, name: ge.name, points: ge.points, type: 'guild' })),
  ]

  const [bossSearch, setBossSearch] = useState('')
  const filtered = allAvailable.filter(b =>
    b.name.toLowerCase().includes(bossSearch.toLowerCase()) &&
    !sessionBosses.find(s => s.sourceId === b.id)
  )

  function addBoss(boss) {
    setSessionBosses(p => [...p, { sourceId: boss.id, name: boss.name, points: boss.points }])
    setBossSearch('')
    setSubmitted(false)
  }

  function addManualBoss() {
    const name = bossInput.trim()
    if (!name) return
    setSessionBosses(p => [...p, { sourceId: `manual-${Date.now()}`, name, points: 0 }])
    setBossInput('')
    setSubmitted(false)
  }

  function removeBoss(sourceId) {
    setSessionBosses(p => p.filter(b => b.sourceId !== sourceId))
    setChecked(p => {
      const next = {}
      Object.keys(p).forEach(mid => {
        next[mid] = { ...p[mid] }
        delete next[mid][sourceId]
      })
      return next
    })
  }

  function updateBossPoints(sourceId, val) {
    setSessionBosses(p => p.map(b => b.sourceId === sourceId ? { ...b, points: Math.max(0, parseInt(val) || 0) } : b))
  }

  function toggle(memberId, sourceId) {
    setChecked(p => ({
      ...p,
      [memberId]: {
        ...(p[memberId] || {}),
        [sourceId]: !(p[memberId]?.[sourceId]),
      }
    }))
    setSubmitted(false)
  }

  function toggleAllForBoss(sourceId) {
    const allChecked = members.every(m => checked[m.id]?.[sourceId])
    setChecked(p => {
      const next = { ...p }
      members.forEach(m => {
        next[m.id] = { ...(next[m.id] || {}), [sourceId]: !allChecked }
      })
      return next
    })
  }

  function toggleAllForMember(memberId) {
    const allChecked = sessionBosses.every(b => checked[memberId]?.[b.sourceId])
    setChecked(p => {
      const next = { ...p, [memberId]: { ...(p[memberId] || {}) } }
      sessionBosses.forEach(b => { next[memberId][b.sourceId] = !allChecked })
      return next
    })
  }

  function submit() {
    if (sessionBosses.length === 0) return
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10)
    const timeStr = now.toTimeString().slice(0, 5)

    // Track points earned per member
    const pointsEarned = {}

    let eventIdOffset = 0
    sessionBosses.forEach(boss => {
      const attendees = members
        .filter(m => checked[m.id]?.[boss.sourceId])
        .map(m => m.id)

      if (attendees.length === 0) return

      const ev = {
        id: nextEventId + eventIdOffset,
        bossId: boss.sourceId,
        bossName: boss.name,
        date: dateStr,
        time: timeStr,
        points: boss.points,
        category: 'attendance',
        attendees,
      }
      setEvents(p => [ev, ...p])
      eventIdOffset++

      attendees.forEach(id => {
        pointsEarned[id] = (pointsEarned[id] || 0) + boss.points
      })
    })

    setNextEventId(n => n + eventIdOffset)

    // Apply points to members
    setMembers(p => p.map(m => {
      const earn = pointsEarned[m.id] || 0
      if (earn === 0) return m
      return { ...m, totalPoints: m.totalPoints + earn, weeklyPoints: (m.weeklyPoints || 0) + earn }
    }))

    // Build summary
    const summary = {
      bosses: sessionBosses.map(b => ({
        name: b.name,
        points: b.points,
        count: members.filter(m => checked[m.id]?.[b.sourceId]).length,
      })),
      totalMembers: Object.keys(pointsEarned).length,
    }

    setSubmitSummary(summary)
    setSubmitted(true)
    setChecked({})
    setSessionBosses([])
  }

  const totalChecked = members.reduce((sum, m) =>
    sum + sessionBosses.filter(b => checked[m.id]?.[b.sourceId]).length, 0
  )

  return (
    <div className="fade-up space-y-5">

      {/* ── Boss Setup ─────────────────────────────────────────────────── */}
      <Card className="p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-cyan/10 border border-cyan/25 flex items-center justify-center text-lg flex-shrink-0">🐉</div>
          <div>
            <div className="text-sm font-semibold text-txt">Today's Bosses</div>
            <div className="text-xs text-muted mt-0.5">Add the bosses for this session</div>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_1fr] gap-4">
          {/* Pick from existing */}
          <div>
            <Label>Pick from Field Bosses / Guild Events</Label>
            <Input
              placeholder="Search bosses…"
              value={bossSearch}
              onChange={e => setBossSearch(e.target.value)}
              className="mb-2"
            />
            {bossSearch && (
              <div className="border border-border rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                {filtered.length === 0
                  ? <div className="px-4 py-3 text-xs text-muted italic">No matches</div>
                  : filtered.map(b => (
                    <div
                      key={b.id}
                      onClick={() => addBoss(b)}
                      className="flex items-center justify-between px-4 py-2.5 border-b border-border/50 last:border-0 cursor-pointer hover:bg-white/[0.03] transition-colors"
                    >
                      <span className="text-sm font-medium text-txt">{b.name}</span>
                      <span className="text-xs text-gold font-semibold">+{b.points} pts</span>
                    </div>
                  ))
                }
              </div>
            )}
          </div>

          {/* Manual input */}
          <div>
            <Label>Or type a custom boss name</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Boss name…"
                value={bossInput}
                onChange={e => setBossInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addManualBoss()}
              />
              <BtnGhost onClick={addManualBoss} className="whitespace-nowrap px-4">+ Add</BtnGhost>
            </div>
            <div className="text-xs text-muted/50 mt-1.5 italic">Custom bosses start at 0 pts — edit after adding</div>
          </div>
        </div>

        {/* Active session bosses */}
        {sessionBosses.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {sessionBosses.map(b => (
              <div
                key={b.sourceId}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan/10 border border-cyan/25"
              >
                <span className="text-sm font-semibold text-cyan">{b.name}</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted">+</span>
                  <input
                    type="number"
                    min={0}
                    value={b.points}
                    onChange={e => updateBossPoints(b.sourceId, e.target.value)}
                    className="w-10 text-xs font-bold text-gold bg-transparent border-none outline-none text-center"
                  />
                  <span className="text-xs text-muted">pts</span>
                </div>
                <button
                  onClick={() => removeBoss(b.sourceId)}
                  className="text-muted/50 hover:text-red-400 transition-colors text-xs cursor-pointer bg-transparent border-none ml-1"
                >✕</button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Attendance Table ───────────────────────────────────────────── */}
      {sessionBosses.length > 0 && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/25 flex items-center justify-center text-lg flex-shrink-0">📋</div>
              <div>
                <div className="text-sm font-semibold text-txt">Attendance Sheet</div>
                <div className="text-xs text-muted mt-0.5">{totalChecked} check{totalChecked !== 1 ? 's' : ''} · {members.length} members · {sessionBosses.length} boss{sessionBosses.length !== 1 ? 'es' : ''}</div>
              </div>
            </div>
            <BtnPrimary
              onClick={submit}
              disabled={totalChecked === 0}
              className="px-6"
            >
              ✦ Submit Attendance
            </BtnPrimary>
          </div>

          <div className="overflow-x-auto">
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #233A5B' }}>
                  {/* Member name column header */}
                  <th style={{ padding: '10px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em', whiteSpace: 'nowrap', background: '#132238', position: 'sticky', left: 0, zIndex: 2 }}>
                    Member
                  </th>
                  {/* Boss columns */}
                  {sessionBosses.map(b => {
                    const allChecked = members.every(m => checked[m.id]?.[b.sourceId])
                    return (
                      <th
                        key={b.sourceId}
                        style={{ padding: '10px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#818cf8', whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => toggleAllForBoss(b.sourceId)}
                        title="Click to check/uncheck all"
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                          <span>{b.name}</span>
                          <span style={{ fontSize: '10px', color: '#F4B942', fontWeight: 700 }}>+{b.points} pts</span>
                          <div style={{ width: '14px', height: '14px', borderRadius: '4px', border: `1px solid ${allChecked ? '#818cf8' : '#233A5B'}`, background: allChecked ? 'rgba(0,194,255,.25)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#818cf8', marginTop: '2px' }}>
                            {allChecked ? '✓' : ''}
                          </div>
                        </div>
                      </th>
                    )
                  })}
                  {/* Total column */}
                  <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em', whiteSpace: 'nowrap' }}>
                    Pts Earned
                  </th>
                </tr>
              </thead>
              <tbody>
                {members.map((m, mi) => {
                  const earnedPts = sessionBosses.reduce((sum, b) => sum + (checked[m.id]?.[b.sourceId] ? b.points : 0), 0)
                  const anyChecked = sessionBosses.some(b => checked[m.id]?.[b.sourceId])
                  return (
                    <tr
                      key={m.id}
                      style={{
                        borderBottom: '1px solid rgba(19,34,56,.6)',
                        background: anyChecked ? 'rgba(0,194,255,.04)' : '',
                        transition: 'background .15s',
                      }}
                    >
                      {/* Member name — sticky */}
                      <td
                        style={{ padding: '10px 20px', fontSize: '13px', fontWeight: 500, color: '#E5E5E5', whiteSpace: 'nowrap', background: anyChecked ? '#1c1c24' : '#132238', position: 'sticky', left: 0, zIndex: 1, cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => toggleAllForMember(m.id)}
                        title="Click to check/uncheck all for this member"
                      >
                        {m.name}
                      </td>
                      {/* Checkboxes */}
                      {sessionBosses.map(b => {
                        const isChecked = checked[m.id]?.[b.sourceId] || false
                        return (
                          <td
                            key={b.sourceId}
                            style={{ padding: '10px 16px', textAlign: 'center', cursor: 'pointer' }}
                            onClick={() => toggle(m.id, b.sourceId)}
                          >
                            <div style={{
                              width: '20px', height: '20px', borderRadius: '6px',
                              border: `1.5px solid ${isChecked ? '#818cf8' : '#233A5B'}`,
                              background: isChecked ? 'rgba(0,194,255,.25)' : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '11px', color: '#818cf8', fontWeight: 700,
                              margin: '0 auto', transition: 'all .15s',
                            }}>
                              {isChecked && '✓'}
                            </div>
                          </td>
                        )
                      })}
                      {/* Points total */}
                      <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                        {earnedPts > 0
                          ? <span style={{ fontSize: '13px', fontWeight: 700, color: '#F4B942' }}>+{earnedPts}</span>
                          : <span style={{ fontSize: '12px', color: 'rgba(156,163,175,.3)' }}>—</span>
                        }
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Bottom submit bar */}
          <div className="px-5 py-3 border-t border-border/60 flex items-center justify-between">
            <div className="text-xs text-muted">
              Tip: click a <span className="text-cyan">boss header</span> to check all members · click a <span className="text-txt">member name</span> to check all bosses
            </div>
            <BtnPrimary onClick={submit} disabled={totalChecked === 0} className="px-8">
              ✦ Submit Attendance
            </BtnPrimary>
          </div>
        </Card>
      )}

      {/* ── Empty state ─────────────────────────────────────────────────── */}
      {sessionBosses.length === 0 && !submitted && (
        <Card className="p-12 text-center">
          <div className="text-4xl mb-3">📋</div>
          <div className="text-sm font-semibold text-muted mb-1">No bosses added yet</div>
          <div className="text-xs text-muted/60">Add today's bosses above to start taking attendance</div>
        </Card>
      )}

      {/* ── Submit Summary ──────────────────────────────────────────────── */}
      {submitted && submitSummary && (
        <Card className="p-6 border-emerald/25">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-emerald/25 flex items-center justify-center text-lg">✦</div>
            <div>
              <div className="text-sm font-semibold text-emerald">Attendance Submitted!</div>
              <div className="text-xs text-muted mt-0.5">{submitSummary.totalMembers} member{submitSummary.totalMembers !== 1 ? 's' : ''} received points</div>
            </div>
            <BtnGhost className="ml-auto text-xs" onClick={() => { setSubmitted(false); setSubmitSummary(null) }}>
              New Session
            </BtnGhost>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
            {submitSummary.bosses.map((b, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-border/60">
                <div className="text-sm font-semibold text-txt mb-1">{b.name}</div>
                <div className="text-xs text-muted">{b.count} attended</div>
                <div className="text-sm font-bold text-gold mt-1">+{b.points} pts each</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
