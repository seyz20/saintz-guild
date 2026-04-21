import { useState } from 'react'
import { Card, Input, Label, BtnDanger } from './UI.jsx'

export default function Screenshots({ members, screenshots, setScreenshots, screenshotLastReset, setScreenshotLastReset }) {
  const [search, setSearch]             = useState('')
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  // screenshots: { [memberId]: { weekly: number, allTime: number } }

  const tracked   = members.filter(m => screenshots[m.id] !== undefined)
  const untracked = members.filter(m => screenshots[m.id] === undefined)
  const filtered  = untracked.filter(m => m.name.toLowerCase().includes(search.toLowerCase()))

  const sorted = [...tracked].sort((a, b) => {
    const aw = screenshots[a.id]?.weekly ?? 0
    const bw = screenshots[b.id]?.weekly ?? 0
    return bw - aw
  })

  function addMember(m) {
    setScreenshots(p => ({ ...p, [m.id]: { weekly: 0, allTime: 0 } }))
    setSearch('')
  }

  function increment(memberId) {
    setScreenshots(p => ({
      ...p,
      [memberId]: {
        weekly:  (p[memberId]?.weekly  ?? 0) + 1,
        allTime: (p[memberId]?.allTime ?? 0) + 1,
      }
    }))
  }

  function decrement(memberId) {
    setScreenshots(p => ({
      ...p,
      [memberId]: {
        weekly:  Math.max(0, (p[memberId]?.weekly  ?? 0) - 1),
        allTime: Math.max(0, (p[memberId]?.allTime ?? 0) - 1),
      }
    }))
  }

  function removeMember(memberId) {
    setScreenshots(p => { const n = { ...p }; delete n[memberId]; return n })
  }

  function resetWeekly() {
    setScreenshots(p => {
      const n = {}
      Object.keys(p).forEach(id => { n[id] = { ...p[id], weekly: 0 } })
      return n
    })
    setScreenshotLastReset(new Date().toISOString())
    setShowResetConfirm(false)
  }

  const topCount = sorted[0] ? (screenshots[sorted[0].id]?.weekly ?? 0) : 0

  return (
    <div className="fade-up space-y-5">

      {/* ── Top bar: search + reset ─────────────────────────────────── */}
      <div className="flex items-start gap-4">

        {/* Search & add */}
        <div className="w-72 relative">
          <Label>Add Member to Track</Label>
          <Input
            placeholder="Search members…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && filtered.length > 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-[#0F1B2D] border border-border rounded-xl overflow-hidden shadow-xl z-20 max-h-56 overflow-y-auto">
              {filtered.map(m => (
                <div
                  key={m.id}
                  onClick={() => addMember(m)}
                  className="flex items-center justify-between px-4 py-2.5 border-b border-border/50 last:border-0 cursor-pointer hover:bg-cyan/[0.05] transition-colors"
                >
                  <span className="text-sm font-medium text-txt">{m.name}</span>
                  <span className="text-xs text-cyan font-semibold">+ Add</span>
                </div>
              ))}
            </div>
          )}
          {search && filtered.length === 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-[#0F1B2D] border border-border rounded-xl px-4 py-3 text-xs text-muted italic z-20">
              {untracked.length === 0 ? 'All members are tracked.' : 'No matches.'}
            </div>
          )}
        </div>

        {/* Stats + reset */}
        <div className="ml-auto flex items-end gap-3 pb-0.5">
          {screenshotLastReset && (
            <div className="text-xs text-muted-2 text-right leading-relaxed">
              Last reset<br/>
              <span className="text-emerald font-semibold">
                {new Date(screenshotLastReset).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
              </span>
            </div>
          )}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[rgba(24,44,71,.7)] border border-red-500/25 text-red-400 text-sm font-semibold cursor-pointer transition-all hover:bg-red-500/[0.12] hover:border-red-500/50"
          >
            ↺ Reset Weekly
          </button>
        </div>
      </div>

      {/* ── Counter cards ────────────────────────────────────────────── */}
      {tracked.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
          {sorted.map((m, i) => {
            const weekly  = screenshots[m.id]?.weekly  ?? 0
            const allTime = screenshots[m.id]?.allTime ?? 0
            const isTop   = i === 0 && weekly > 0
            return (
              <Card
                key={m.id}
                className={`p-4 transition-all ${isTop ? 'border-gold/40' : ''}`}
                style={isTop ? { boxShadow: '0 0 20px rgba(244,185,66,0.08)' } : {}}
              >
                {/* Name + remove */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    {isTop && <span className="text-base flex-shrink-0">👑</span>}
                    <span className="text-sm font-bold text-txt truncate">{m.name}</span>
                  </div>
                  <button
                    onClick={() => removeMember(m.id)}
                    className="text-muted-2/50 hover:text-red-400 transition-colors text-xs cursor-pointer bg-transparent border-none flex-shrink-0 ml-1"
                  >✕</button>
                </div>

                {/* Big weekly counter */}
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => decrement(m.id)}
                    className="w-8 h-8 rounded-lg bg-[rgba(24,44,71,.8)] border border-border flex items-center justify-center text-lg text-muted cursor-pointer hover:border-red-400/50 hover:text-red-400 transition-all"
                  >−</button>

                  <div className="text-center">
                    <div className={`text-3xl font-black tabular-nums ${isTop ? 'text-gold' : weekly > 0 ? 'text-cyan' : 'text-muted-2'}`}>
                      {weekly}
                    </div>
                    <div className="text-[0.65rem] text-muted-2 uppercase tracking-widest mt-0.5">this week</div>
                  </div>

                  <button
                    onClick={() => increment(m.id)}
                    className="w-8 h-8 rounded-lg bg-[rgba(24,44,71,.8)] border border-border flex items-center justify-center text-lg text-muted cursor-pointer hover:border-emerald/50 hover:text-emerald transition-all"
                  >+</button>
                </div>

                {/* All-time */}
                <div className="text-center pt-2 border-t border-border/50">
                  <span className="text-xs text-muted-2">All-time: </span>
                  <span className="text-xs font-bold text-muted">{allTime}</span>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* ── Leaderboard table ────────────────────────────────────────── */}
      {tracked.length > 0 && (
        <Card className="overflow-hidden">
          {/* Table header */}
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border">
            <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/25 flex items-center justify-center text-lg flex-shrink-0">📸</div>
            <div>
              <div className="text-sm font-bold text-gold">Screenshot Leaderboard</div>
              <div className="text-xs text-muted-2 mt-0.5">Sorted by weekly count</div>
            </div>
            <div className="ml-auto text-xs text-muted-2">{tracked.length} tracked</div>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[44px_1fr_140px_140px_80px] border-b border-border">
            {['#', 'Member', 'This Week', 'All-Time', ''].map((h, i) => (
              <div key={i} className="px-4 py-2.5 text-[0.67rem] font-semibold text-muted-2 uppercase tracking-widest">
                {h}
              </div>
            ))}
          </div>

          {/* Rows */}
          <div className="max-h-[480px] overflow-y-auto">
            {sorted.map((m, i) => {
              const weekly  = screenshots[m.id]?.weekly  ?? 0
              const allTime = screenshots[m.id]?.allTime ?? 0
              const pct     = topCount > 0 ? Math.round((weekly / topCount) * 100) : 0
              return (
                <div
                  key={m.id}
                  className="grid grid-cols-[44px_1fr_140px_140px_80px] items-center border-b border-border/50 last:border-0 hover:bg-white/[0.015] transition-colors"
                >
                  {/* Rank */}
                  <div className="pl-4 py-3">
                    <div className={`rank-badge ${i===0?'r1':i===1?'r2':i===2?'r3':i===3?'r4':'rn'}`}>
                      {i + 1}
                    </div>
                  </div>

                  {/* Name */}
                  <div className="px-4 py-3 text-sm font-medium text-txt">{m.name}</div>

                  {/* Weekly + progress bar */}
                  <div className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold tabular-nums ${weekly > 0 ? 'text-cyan' : 'text-muted-2'}`}>{weekly}</span>
                      <span className="text-xs text-muted-2">📸</span>
                    </div>
                    <div className="mt-1.5 h-[3px] rounded-full bg-[#3B4F68] overflow-hidden w-20">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: i === 0 ? '#F6C64E' : '#3FA7FF' }}
                      />
                    </div>
                  </div>

                  {/* All-time */}
                  <div className="px-4 py-3 text-sm font-bold text-muted">{allTime}</div>

                  {/* Actions */}
                  <div className="px-4 py-3">
                    <BtnDanger onClick={() => removeMember(m.id)} className="text-xs py-1 px-2">Remove</BtnDanger>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Empty state */}
      {tracked.length === 0 && (
        <Card className="p-14 text-center">
          <div className="text-4xl mb-3">📸</div>
          <div className="text-sm font-semibold text-muted mb-1">No members tracked yet</div>
          <div className="text-xs text-muted-2">Search for a member above and click Add to start tracking</div>
        </Card>
      )}

      {/* Reset confirm modal */}
      {showResetConfirm && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={e => e.target === e.currentTarget && setShowResetConfirm(false)}
        >
          <div className="bg-bg-2 border border-border rounded-2xl p-8 w-[400px] text-center shadow-2xl">
            <div className="text-4xl mb-3">🔄</div>
            <div className="text-lg font-bold text-txt mb-2">Reset Weekly Screenshots?</div>
            <div className="text-sm text-muted-2 mb-6">
              This sets everyone's <span className="text-cyan font-semibold">weekly count</span> back to zero.
              All-time counts are unaffected.
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-[rgba(24,44,71,.6)] border border-border text-muted text-sm font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={resetWeekly}
                className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/45 text-red-400 font-semibold text-sm cursor-pointer hover:bg-red-500/30 transition-all"
              >
                ↺ Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
