import { useState } from 'react'
import { Card, ModalCard, Modal, Label, BtnPrimary, BtnGhost, BtnDanger, TimeTag } from './UI.jsx'
import BossFormFields from './BossFormFields.jsx'
import { fmtCountdown } from '../constants.js'

export default function BossManagement({ fieldBosses, setFieldBosses, nextBossId, setNextBossId, tick }) {
  const [bossForm, setBossForm] = useState({ name: '', points: 3, spawnType: 'timer', respawnHours: 10, scheduledTimes: [{ day: 'Sunday', time: '19:00' }] })
  const [bossFormMsg, setBossFormMsg] = useState('')
  const [editingBoss, setEditingBoss] = useState(null)
  const [editBossForm, setEditBossForm] = useState(null)

  const now = Date.now()
  const [spawnInputs, setSpawnInputs] = useState({})

  const countdowns = fieldBosses.reduce((acc, b) => {
    if (b.spawnType === 'timer') {
      if (b.nextSpawnAt != null)
        acc[b.id] = Math.max(0, b.nextSpawnAt - now)
      else if (b.lastKilled != null)
        acc[b.id] = Math.max(0, b.lastKilled + (b.respawnHours || 10) * 3600000 - now)
    }
    return acc
  }, {})

  function submitBossForm() {
    const name = bossForm.name.trim()
    if (!name) { setBossFormMsg('Enter a boss name.'); return }
    if (fieldBosses.find(b => b.name.toLowerCase() === name.toLowerCase())) { setBossFormMsg('Boss already exists.'); return }
    const times = bossForm.scheduledTimes.filter(s => s.time && s.time.trim())
    if (bossForm.spawnType === 'scheduled' && times.length === 0) { setBossFormMsg('Add at least one spawn slot.'); return }
    setFieldBosses(p => [...p, {
      id: `b${nextBossId}`, name, points: Number(bossForm.points), category: 'field',
      spawnType: bossForm.spawnType,
      respawnHours: bossForm.spawnType === 'timer' ? Number(bossForm.respawnHours) : null,
      lastKilled: null,
      scheduledTimes: bossForm.spawnType === 'scheduled' ? times : []
    }])
    setNextBossId(n => n + 1)
    setBossForm({ name: '', points: 3, spawnType: 'timer', respawnHours: 10, scheduledTimes: [{ day: 'Sunday', time: '19:00' }] })
    setBossFormMsg(`✦ ${name} added!`)
    setTimeout(() => setBossFormMsg(''), 3000)
  }

  function saveEditBoss() {
    const name = editBossForm.name.trim(); if (!name) return
    const times = editBossForm.scheduledTimes.filter(s => s.time && s.time.trim())
    setFieldBosses(p => p.map(b => b.id !== editingBoss.id ? b : {
      ...b, name, points: Number(editBossForm.points),
      spawnType: editBossForm.spawnType,
      respawnHours: editBossForm.spawnType === 'timer' ? Number(editBossForm.respawnHours) : null,
      scheduledTimes: editBossForm.spawnType === 'scheduled' ? times : []
    }))
    setEditingBoss(null)
  }

  return (
    <div className="fade-up grid grid-cols-[340px_1fr] gap-5 items-start">

      {/* Add Boss */}
      <Card className="p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 rounded-xl bg-purple/10 border border-purple/25 flex items-center justify-center text-lg">🐉</div>
          <div>
            <div className="text-sm font-semibold text-txt">Add Field Boss</div>
            <div className="text-xs text-muted mt-0.5">Track spawns & attendance</div>
          </div>
        </div>
        <BossFormFields form={bossForm} setForm={setBossForm} />
        {bossFormMsg && (
          <div className={`text-sm mb-3 italic ${bossFormMsg.startsWith('✦') ? 'text-emerald' : 'text-red-400'}`}>{bossFormMsg}</div>
        )}
        <BtnPrimary className="w-full mt-2" onClick={submitBossForm}>+ Add Boss</BtnPrimary>
      </Card>

      {/* Boss List */}
      <div className="space-y-3">
        {fieldBosses.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-3xl mb-3">🐉</div>
            <div className="text-sm font-semibold text-muted">No bosses added yet.</div>
          </Card>
        ) : fieldBosses.map(b => {
          const cd = countdowns[b.id]
          const spawned = b.spawnType === 'timer' && b.lastKilled != null && cd === 0
          return (
            <Card key={b.id} className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple/10 border border-purple/25 flex items-center justify-center text-xl flex-shrink-0">🐉</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-bold text-txt">{b.name}</div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/25">+{b.points} pts</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-cyan/10 text-cyan border border-cyan/25">
                      {b.spawnType === 'timer' ? '⏱ Timer' : '📅 Scheduled'}
                    </span>
                  </div>

                  {b.spawnType === 'scheduled' && b.scheduledTimes.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {b.scheduledTimes.map((s, i) => (
                        <TimeTag key={i}>{s.day?.slice(0,3)} {s.time}</TimeTag>
                      ))}
                    </div>
                  )}

                  {b.spawnType === 'timer' && (
                    <div className="mt-2">
                      {/* Countdown display */}
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        {(b.nextSpawnAt == null && b.lastKilled == null)
                          ? <span className="text-xs text-muted italic">No spawn time set</span>
                          : spawned
                            ? <span className="text-sm font-bold text-emerald pulse-anim">⚡ SPAWNED</span>
                            : <span className="text-sm font-bold text-orange-400 tabular-nums">{fmtCountdown(cd)}</span>
                        }
                        {b.respawnHours && !b.nextSpawnAt && <span className="text-xs text-muted">{b.respawnHours}h respawn</span>}
                        {b.nextSpawnAt && (
                          <span className="text-xs text-cyan">
                            spawns {new Date(b.nextSpawnAt).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}
                          </span>
                        )}
                      </div>
                      {/* Custom spawn time input */}
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[rgba(19,34,56,0.4)] border border-border/60">
                        <span className="text-xs text-muted whitespace-nowrap">Next spawn:</span>
                        <input
                          type="datetime-local"
                          value={spawnInputs[b.id] ?? ''}
                          onChange={e => setSpawnInputs(p => ({ ...p, [b.id]: e.target.value }))}
                          className="flex-1 bg-transparent border-none outline-none text-xs text-txt [color-scheme:dark] min-w-0"
                        />
                        <button
                          onClick={() => {
                            const v = spawnInputs[b.id]
                            if (!v) return
                            const ms = new Date(v).getTime()
                            if (isNaN(ms)) return
                            setFieldBosses(p => p.map(x => x.id === b.id ? { ...x, nextSpawnAt: ms, lastKilled: null } : x))
                            setSpawnInputs(p => ({ ...p, [b.id]: '' }))
                          }}
                          className="text-xs px-2 py-1 rounded-lg bg-cyan/20 border border-cyan/40 text-cyan hover:bg-indigo/30 transition-all whitespace-nowrap"
                        >
                          Set
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  {b.spawnType === 'timer' && (
                    <>
                      <button
                        onClick={() => setFieldBosses(p => p.map(x => x.id === b.id ? { ...x, lastKilled: Date.now(), nextSpawnAt: null } : x))}
                        className="text-xs px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/20 transition-all"
                      >
                        ☠ Killed
                      </button>
                      {(b.lastKilled != null || b.nextSpawnAt != null) && (
                        <button
                          onClick={() => setFieldBosses(p => p.map(x => x.id === b.id ? { ...x, lastKilled: null, nextSpawnAt: null } : x))}
                          className="text-xs px-2.5 py-1 rounded-lg bg-border/50 border border-border text-muted hover:border-gold/40 hover:text-gold transition-all"
                        >
                          ↺ Clear
                        </button>
                      )}
                    </>
                  )}
                  <BtnGhost className="text-xs py-1 px-2.5" onClick={() => { setEditingBoss(b); setEditBossForm({ name: b.name, points: b.points, spawnType: b.spawnType, respawnHours: b.respawnHours || 10, scheduledTimes: b.scheduledTimes.length ? [...b.scheduledTimes] : [{ day: 'Sunday', time: '19:00' }] }) }}>Edit</BtnGhost>
                  <BtnDanger className="text-xs py-1 px-2.5" onClick={() => setFieldBosses(p => p.filter(x => x.id !== b.id))}>Delete</BtnDanger>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Edit Boss Modal */}
      <Modal show={!!editingBoss} onClose={() => setEditingBoss(null)}>
        <ModalCard className="w-[420px] max-h-[85vh] overflow-y-auto p-7">
          <div className="text-base font-bold text-yellow mb-1">Edit Boss</div>
          <div className="text-sm text-muted mb-5">{editingBoss?.name}</div>
          {editBossForm && <BossFormFields form={editBossForm} setForm={setEditBossForm} />}
          <div className="flex gap-2.5 mt-4">
            <BtnPrimary className="flex-1" onClick={saveEditBoss}>Save Changes</BtnPrimary>
            <BtnGhost className="flex-1" onClick={() => setEditingBoss(null)}>Cancel</BtnGhost>
          </div>
        </ModalCard>
      </Modal>
    </div>
  )
}
