import { useState } from 'react'
import { Card, Label, Input, BtnPrimary, BtnGhost, BtnGold, BtnReset, BtnDanger, RankBadge } from './UI.jsx'
import { DEFAULT_FIELD_BOSSES, INITIAL_MEMBERS, INITIAL_EVENTS } from '../constants.js'

export default function PointsEditor({ members, setMembers, nextMemberId, setNextMemberId, events, setEvents, fieldBosses, setFieldBosses, nextEventId, setNextEventId, nextBossId, setNextBossId, rallies, setRallies, nextRallyId, setNextRallyId, rewardThreshold, setRewardThreshold, setThresholdInput, lastReset, setLastReset, showResetConfirm, setShowResetConfirm, downloadJSON, importJSON, importMsg }) {
  const [ptSearch, setPtSearch] = useState('')
  const [ptEdits, setPtEdits] = useState({})
  const [ptSavedFlash, setPtSavedFlash] = useState({})
  const [newName, setNewName] = useState('')

  const sorted = [...members].sort((a, b) => b.totalPoints - a.totalPoints)
  const filtered = sorted.filter(m => m.name.toLowerCase().includes(ptSearch.toLowerCase()))

  function startEdit(m) { setPtEdits(p => ({ ...p, [m.id]: { name: m.name, total: m.totalPoints, weekly: m.weeklyPoints || 0 } })) }
  function saveEdit(m) {
    const ed = ptEdits[m.id]; if (!ed) return
    const name = ed.name.trim() || m.name
    const total = Math.max(0, parseInt(ed.total) || 0)
    const weekly = Math.max(0, parseInt(ed.weekly) || 0)
    setMembers(p => p.map(x => x.id === m.id ? { ...x, name, totalPoints: total, weeklyPoints: weekly } : x))
    setPtEdits(p => { const n = { ...p }; delete n[m.id]; return n })
    setPtSavedFlash(p => ({ ...p, [m.id]: true }))
    setTimeout(() => setPtSavedFlash(p => ({ ...p, [m.id]: false })), 1800)
  }
  function cancelEdit(id) { setPtEdits(p => { const n = { ...p }; delete n[id]; return n }) }

  function addMember() {
    const name = newName.trim(); if (!name) return
    if (members.find(m => m.name.toLowerCase() === name.toLowerCase())) return
    setMembers(p => [...p, { id: nextMemberId, name, totalPoints: 0, weeklyPoints: 0 }])
    setNextMemberId(n => n + 1)
    setNewName('')
  }

  const avg = members.length ? Math.round(members.reduce((s, m) => s + m.totalPoints, 0) / members.length) : 0
  const rewardCount = members.filter(m => (m.weeklyPoints || 0) >= rewardThreshold).length

  return (
    <div className="fade-up">
      {/* Search bar */}
      <div className="mb-4 max-w-xs">
        <Input placeholder="Search members…" value={ptSearch} onChange={e => setPtSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-4 items-start">

        {/* Table */}
        <Card className="overflow-hidden">
          <div className="grid grid-cols-[40px_1fr_1fr_110px_110px_100px] border-b border-border">
            {['#','Character','Rename','Total Pts','Weekly Pts',''].map((h, i) => (
              <div key={i} className="px-3.5 py-2.5 text-[0.67rem] font-semibold text-muted uppercase tracking-widest">{h}</div>
            ))}
          </div>
          <div className="max-h-[520px] overflow-y-auto">
            {filtered.map((m, i) => {
              const rank = sorted.indexOf(m)
              const editing = !!ptEdits[m.id]
              const saved = ptSavedFlash[m.id]
              return (
                <div
                  key={m.id}
                  className={`grid grid-cols-[40px_1fr_1fr_110px_110px_100px] items-center border-b border-border/60 last:border-0 transition-colors ${saved ? 'bg-emerald/[0.08]' : editing ? 'bg-indigo/5' : 'hover:bg-white/[0.02]'}`}
                >
                  <div className="pl-3 py-2.5 flex items-center">
                    <RankBadge index={rank} pts={m.totalPoints} threshold={rewardThreshold} />
                  </div>
                  <div className="px-3 py-2.5 text-sm font-medium text-txt truncate">{m.name}</div>
                  <div className="px-3 py-2.5">
                    {editing
                      ? <Input className="text-sm py-1 px-2 h-8" value={ptEdits[m.id].name} onChange={e => setPtEdits(p => ({ ...p, [m.id]: { ...p[m.id], name: e.target.value } }))} onKeyDown={e => e.key === 'Enter' && saveEdit(m)} placeholder="New name…" />
                      : <span className="text-xs text-muted/40 italic">click Edit</span>
                    }
                  </div>
                  <div className="px-3 py-2.5">
                    {editing
                      ? <Input type="number" min={0} className="text-sm py-1 px-2 h-8" value={ptEdits[m.id].total} onChange={e => setPtEdits(p => ({ ...p, [m.id]: { ...p[m.id], total: e.target.value } }))} onKeyDown={e => e.key === 'Enter' && saveEdit(m)} />
                      : <span className="text-sm font-bold text-yellow">{m.totalPoints}</span>
                    }
                  </div>
                  <div className="px-3 py-2.5">
                    {editing
                      ? <Input type="number" min={0} className="text-sm py-1 px-2 h-8" value={ptEdits[m.id].weekly} onChange={e => setPtEdits(p => ({ ...p, [m.id]: { ...p[m.id], weekly: e.target.value } }))} onKeyDown={e => e.key === 'Enter' && saveEdit(m)} />
                      : <span className={`text-sm font-bold ${(m.weeklyPoints || 0) >= rewardThreshold ? 'text-gold' : 'text-emerald'}`}>{m.weeklyPoints || 0}</span>
                    }
                  </div>
                  <div className="px-3 py-2.5">
                    {saved
                      ? <span className="text-xs text-emerald font-semibold">✓ Saved</span>
                      : editing
                        ? (
                          <div className="flex gap-1">
                            <button onClick={() => saveEdit(m)} className="text-xs px-2 py-1 rounded bg-cyan/20 border border-cyan/40 text-cyan hover:bg-indigo/30 cursor-pointer transition-all">Save</button>
                            <button onClick={() => cancelEdit(m.id)} className="text-xs px-1.5 py-1 rounded bg-border/50 border border-border text-muted hover:text-txt cursor-pointer transition-all">✕</button>
                          </div>
                        )
                        : <button onClick={() => startEdit(m)} className="text-xs px-2.5 py-1 rounded bg-border/50 border border-border text-muted hover:border-gold/40 hover:text-gold cursor-pointer transition-all">Edit</button>
                    }
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Right panel */}
        <div className="space-y-3">
          {/* Add Member */}
          <Card className="p-4">
            <Label>Add Member</Label>
            <Input placeholder="Character name…" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addMember()} className="mb-2.5" />
            <BtnPrimary className="w-full text-sm py-2" onClick={addMember}>+ Add Member</BtnPrimary>
          </Card>

          {/* Quick Stats */}
          <Card className="p-4">
            <div className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">Quick Stats</div>
            {[
              ['Total Members', members.length, 'text-txt'],
              ['Avg Total Pts', avg, 'text-yellow'],
              ['Reward Count', `${rewardCount}/${members.length}`, 'text-gold'],
            ].map(([label, val, color]) => (
              <div key={label} className="flex justify-between items-center py-1.5 border-b border-border/50 last:border-0">
                <span className="text-xs text-muted">{label}</span>
                <span className={`text-sm font-bold ${color}`}>{val}</span>
              </div>
            ))}
          </Card>

          {/* Danger Zone */}
          <Card className="p-4 border-red-500/15">
            <div className="text-xs font-semibold text-red-400 uppercase tracking-widest mb-2">⚠️ Danger Zone</div>
            <div className="text-xs text-muted mb-3 leading-relaxed">Reset all weekly points to zero. Total points unaffected.</div>
            <BtnReset className="w-full justify-center" onClick={() => setShowResetConfirm(true)}>🔄 Reset Weekly Points</BtnReset>
          </Card>

          {/* Data Transfer */}
          <Card className="p-4 border-gold/15">
            <div className="text-xs font-semibold text-gold uppercase tracking-widest mb-2">📦 Data Transfer</div>
            <div className="text-xs text-muted mb-4 leading-relaxed">Export all data as JSON to share with another admin, or import to load their data.</div>
            <div className="space-y-2">
              <BtnGold className="w-full justify-center" onClick={downloadJSON}>⬇ Export JSON</BtnGold>
              <label className="flex items-center justify-center gap-1.5 w-full py-2 px-4 rounded-xl bg-[rgba(19,34,56,0.5)] border border-gold/15 text-muted text-sm font-semibold cursor-pointer transition-all hover:bg-[rgba(19,34,56,0.8)] hover:border-gold/30 hover:text-gold">
                ⬆ Import JSON
                <input type="file" accept=".json" className="hidden" onChange={e => importJSON(e.target.files[0])} />
              </label>
            </div>
            {importMsg && (
              <div className={`mt-2 text-xs text-center ${importMsg.startsWith('✦') ? 'text-emerald' : 'text-red-400'}`}>{importMsg}</div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
