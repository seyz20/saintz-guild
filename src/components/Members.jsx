import { useState } from 'react'
import { Card, Modal, ModalCard, Label, Input, BtnPrimary, BtnGhost, BtnGold, BtnReset, BtnDanger, RankBadge } from './UI.jsx'

export default function Members({ members, setMembers, nextMemberId, setNextMemberId, rewardThreshold, setRewardThreshold, lastReset, setLastReset, showResetConfirm, setShowResetConfirm, downloadCSV }) {
  const [newMemberName, setNewMemberName] = useState('')
  const [memberMsg, setMemberMsg] = useState('')
  const [thresholdInput, setThresholdInput] = useState(String(rewardThreshold))

  const sorted = [...members].sort((a, b) => b.totalPoints - a.totalPoints)

  function addMember() {
    const name = newMemberName.trim()
    if (!name) return
    if (members.find(m => m.name.toLowerCase() === name.toLowerCase())) { setMemberMsg('Member already exists.'); return }
    setMembers(p => [...p, { id: nextMemberId, name, totalPoints: 0, weeklyPoints: 0 }])
    setNextMemberId(n => n + 1)
    setNewMemberName('')
    setMemberMsg(`${name} enlisted!`)
    setTimeout(() => setMemberMsg(''), 3000)
  }

  function removeMember(id) {
    setMembers(p => p.filter(m => m.id !== id))
  }

  function resetWeekly() {
    setMembers(p => p.map(m => ({ ...m, weeklyPoints: 0 })))
    setLastReset(new Date())
    setShowResetConfirm(false)
  }

  return (
    <div className="fade-up">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <div className="text-base font-bold text-txt">Guild Roster</div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted">{members.length} members</span>
            {lastReset && (
              <span className="text-xs text-muted">· reset <span className="text-emerald font-medium">{lastReset.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span></span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <BtnGold onClick={downloadCSV}>⬇ CSV</BtnGold>
          <BtnReset onClick={() => setShowResetConfirm(true)}>↺ Reset Weekly</BtnReset>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-4 items-start">

        {/* Table */}
        <Card className="overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[48px_1fr_90px_90px_120px_72px] border-b border-border">
            {['#','Character','Weekly','Total','Badge',''].map((h, i) => (
              <div key={i} className="px-3.5 py-2.5 text-[0.67rem] font-semibold text-muted uppercase tracking-widest" style={{ textAlign: i >= 2 ? 'center' : 'left' }}>{h}</div>
            ))}
          </div>
          {/* Rows */}
          <div className="max-h-[520px] overflow-y-auto">
            {sorted.map((m, i) => {
              const q = (m.weeklyPoints || 0) >= rewardThreshold
              const rank = i + 1
              return (
                <div
                  key={m.id}
                  className={`grid grid-cols-[48px_1fr_90px_90px_120px_72px] items-center border-b border-border/60 last:border-0 transition-colors ${q ? 'hover:bg-gold/[0.07]' : 'hover:bg-purple/[0.07]'}`}
                >
                  <div className="py-2.5 pl-3.5 flex items-center">
                    <RankBadge index={i} pts={m.totalPoints} threshold={rewardThreshold} />
                  </div>
                  <div className="px-3 py-2.5 text-sm font-medium text-txt">{m.name}</div>
                  <div className="px-3 py-2.5 text-center">
                    <div className={`text-sm font-bold ${q ? 'text-gold' : 'text-emerald'}`}>{m.weeklyPoints || 0}</div>
                    <div className="mt-1 h-[2px] rounded-full bg-border/50 overflow-hidden mx-1">
                      <div
                        className={`h-full rounded-full ${q ? 'bg-gold' : 'bg-green-500/60'}`}
                        style={{ width: `${Math.min(100, Math.round(((m.weeklyPoints || 0) / rewardThreshold) * 100))}%` }}
                      />
                    </div>
                  </div>
                  <div className="px-3 py-2.5 text-center text-sm font-bold text-yellow">{m.totalPoints}</div>
                  <div className="px-3 py-2.5 text-center">
                    {q
                      ? <span className="text-[0.68rem] font-bold text-gold px-2 py-0.5 rounded bg-gold/10 border border-gold/25">🏅 Rewarded</span>
                      : <span className="text-xs text-muted">{rewardThreshold - (m.weeklyPoints || 0)} left</span>
                    }
                  </div>
                  <div className="px-3 py-2.5 text-center">
                    <BtnDanger onClick={() => removeMember(m.id)}>✕</BtnDanger>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Right panel */}
        <div className="space-y-3">
          {/* Enlist */}
          <Card className="p-4">
            <Label>Enlist Member</Label>
            <Input
              placeholder="Character name…"
              value={newMemberName}
              onChange={e => setNewMemberName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addMember()}
              className="mb-2.5"
            />
            <BtnPrimary className="w-full text-sm py-2" onClick={addMember}>+ Enlist</BtnPrimary>
            {memberMsg && <div className="mt-2 text-sm text-emerald">{memberMsg}</div>}
          </Card>

          {/* Weekly Summary */}
          <Card className="p-4">
            <div className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">Weekly Summary</div>
            {[
              ['Total Members', members.length, 'text-txt'],
              ['Rewarded', members.filter(m => (m.weeklyPoints||0) >= rewardThreshold).length, 'text-gold'],
              ['In Progress', members.filter(m => (m.weeklyPoints||0) > 0 && (m.weeklyPoints||0) < rewardThreshold).length, 'text-cyan'],
              ['Not Started', members.filter(m => (m.weeklyPoints||0) === 0).length, 'text-red-400'],
            ].map(([label, val, color]) => (
              <div key={label} className="flex justify-between items-center py-1.5 border-b border-border/50 last:border-0">
                <span className="text-xs text-muted">{label}</span>
                <span className={`text-sm font-bold ${color}`}>{val}</span>
              </div>
            ))}
          </Card>

          {/* Reward Threshold */}
          <Card className="p-4 border-gold/15">
            <div className="text-xs font-semibold text-gold uppercase tracking-widest mb-2">🏅 Reward Threshold</div>
            <div className="text-xs text-muted mb-3 leading-relaxed">Weekly pts needed for reward badge.</div>
            <div className="flex gap-2">
              <Input
                type="number" min={1} max={999}
                value={thresholdInput}
                onChange={e => setThresholdInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (v => { if (v > 0) { setRewardThreshold(v); setThresholdInput(String(v)) } })(parseInt(thresholdInput))}
                className="text-center font-bold text-gold text-base"
              />
              <BtnGold onClick={() => { const v = parseInt(thresholdInput); if (v > 0) { setRewardThreshold(v); setThresholdInput(String(v)) } }}>Set</BtnGold>
            </div>
          </Card>
        </div>
      </div>

      {/* Reset Confirm Modal */}
      <Modal show={showResetConfirm} onClose={() => setShowResetConfirm(false)}>
        <ModalCard className="w-[440px] p-8 text-center">
          <div className="text-4xl mb-3">🔄</div>
          <div className="text-lg font-bold text-txt mb-2">Reset Weekly Points?</div>
          <div className="text-sm text-muted mb-2">This will set all members' <span className="text-emerald font-semibold">Weekly Points</span> back to zero.</div>
          <div className="text-sm text-muted mb-5">Total points will <strong className="text-txt">not</strong> be affected.</div>
          <div className="bg-red-500/8 border border-red-500/20 rounded-xl p-4 mb-5 text-left">
            <div className="text-xs font-semibold text-red-400 mb-1">💡 Save before resetting</div>
            <div className="text-xs text-muted mb-3">Download a CSV snapshot before clearing.</div>
            <BtnGold className="w-full justify-center" onClick={() => { downloadCSV(); setShowResetConfirm(false) }}>⬇️ Download CSV & Close</BtnGold>
          </div>
          <div className="flex gap-2.5">
            <BtnGhost className="flex-1 py-2.5" onClick={() => setShowResetConfirm(false)}>Cancel</BtnGhost>
            <button
              onClick={resetWeekly}
              className="flex-1 py-2.5 bg-red-500/20 border border-red-500/45 text-red-400 font-semibold text-sm rounded-xl cursor-pointer hover:bg-red-500/30 transition-all"
            >
              🔄 Yes, Reset Weekly
            </button>
          </div>
        </ModalCard>
      </Modal>
    </div>
  )
}
