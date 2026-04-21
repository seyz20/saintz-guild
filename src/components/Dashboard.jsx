import { Card, RankBadge, TimeTag } from './UI.jsx'
import { formatDate, fmtCountdown } from '../constants.js'

export default function Dashboard({ members, events, fieldBosses, rewardThreshold, tick }) {
  const sortedByWeekly = [...members].sort((a, b) => (b.weeklyPoints || 0) - (a.weeklyPoints || 0))
  const sortedEvents   = [...events].sort((a, b) => new Date(b.date) - new Date(a.date))
  const recentEvents   = sortedEvents.slice(0, 3)
  const sortedByTotal  = [...members].sort((a, b) => b.totalPoints - a.totalPoints)
  const topMember      = sortedByTotal[0]
  const now            = Date.now()
  const in24h          = now + 24 * 3600 * 1000

  // Upcoming spawns
  const upcoming = []
  fieldBosses.filter(b => b.spawnType === 'scheduled' && b.scheduledTimes.length > 0).forEach(b => {
    [0,1,2,3,4,5,6].forEach(dayOffset => {
      b.scheduledTimes.forEach(s => {
        const [hh, mm] = s.time.split(':').map(Number)
        const d = new Date(); d.setDate(d.getDate() + dayOffset); d.setHours(hh, mm, 0, 0)
        if (s.day) {
          const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getDay()]
          if (dayName !== s.day) return
        }
        const ms = d.getTime()
        if (ms > now && ms <= in24h) upcoming.push({ name: b.name, points: b.points, ms, day: s.day, time: s.time })
      })
    })
  })
  fieldBosses.filter(b => b.spawnType === 'timer').forEach(b => {
    let ms = null
    if (b.nextSpawnAt != null) ms = b.nextSpawnAt
    else if (b.lastKilled != null) ms = b.lastKilled + (b.respawnHours || 10) * 3600 * 1000
    if (ms && ms > now && ms <= in24h) upcoming.push({ name: b.name, points: b.points, ms, type: 'timer' })
  })
  upcoming.sort((a, b) => a.ms - b.ms)

  const spawnColor = (ms) => {
    const diff = ms - now
    if (diff <= 15 * 60 * 1000) return 'text-cyan'
    if (diff <= 60 * 60 * 1000) return 'text-orange-400'
    return 'text-cyan'
  }

  const rewarded = members.filter(m => (m.weeklyPoints || 0) >= rewardThreshold).length

  return (
    <div className="fade-up">
      <div className="grid grid-cols-2 gap-5 mb-5">

        {/* Weekly Ranking */}
        <Card className="p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/25 flex items-center justify-center text-lg flex-shrink-0">🏆</div>
            <div className="text-base font-bold text-gold">Weekly Ranking</div>
          </div>
          <div className="max-h-[400px] overflow-y-auto pr-1 space-y-0">
            {sortedByWeekly.map((m, i) => (
              <div key={m.id} className="flex items-center gap-3 py-2.5 border-b border-border/60 last:border-0">
                <RankBadge index={i} pts={m.weeklyPoints || 0} threshold={rewardThreshold} />
                <div className="flex-1 text-sm font-medium text-txt">{m.name}</div>
                <div className="text-sm font-bold text-gold">
                  {m.weeklyPoints || 0}<span className="text-[0.65rem] text-muted font-normal ml-1">pts</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right: Recent Events + Upcoming Spawns */}
        <div className="flex flex-col gap-5">

          {/* Recent Events */}
          <Card className="p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-cyan/10 border border-cyan/25 flex items-center justify-center text-lg flex-shrink-0">📜</div>
              <div className="text-base font-bold text-cyan">Recent Events</div>
            </div>
            {recentEvents.length === 0
              ? <div className="text-muted italic text-sm">No events yet.</div>
              : recentEvents.map(ev => (
                <div key={ev.id} className="py-2.5 border-b border-border/50 last:border-0">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-semibold text-txt">{ev.bossName}</div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                      ev.category === 'arena'
                        ? 'bg-yellow/10 text-yellow border-yellow/30'
                        : 'bg-cyan/10 text-cyan border-cyan/30'
                    }`}>+{ev.points} pts</span>
                  </div>
                  <div className="text-xs text-muted mt-0.5">{formatDate(ev.date)} · {ev.attendees.length} attended</div>
                </div>
              ))
            }
          </Card>

          {/* Upcoming Spawns */}
          <Card className="p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-yellow/10 border border-yellow/25 flex items-center justify-center text-lg flex-shrink-0">⚡</div>
              <div className="text-base font-bold text-yellow">Upcoming Spawns</div>
              <span className="ml-auto text-xs text-muted">Next 24h</span>
            </div>
            {upcoming.length === 0
              ? <div className="text-muted italic text-sm">No bosses spawning in 24 hours.</div>
              : upcoming.map((u, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0">
                  <div className="text-base">🐉</div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-txt">{u.name}</div>
                    <div className="flex gap-1 mt-0.5 flex-wrap">
                      {u.day && <TimeTag>{u.day.slice(0,3)} {u.time}</TimeTag>}
                      {u.type === 'timer' && <TimeTag>Timer</TimeTag>}
                    </div>
                  </div>
                  <div className={`text-xs font-bold tabular-nums ${spawnColor(u.ms)}`}>
                    {new Date(u.ms) <= new Date(now) ? <span className="pulse-anim">SPAWNED</span> : fmtCountdown(u.ms - now)}
                  </div>
                </div>
              ))
            }
          </Card>
        </div>
      </div>

      {/* Bottom Stats */}
      <Card className="p-4">
        <div className="grid grid-cols-4 divide-x divide-border/50">
          {[
            ['Members', members.length, 'text-gold'],
            ['Events', events.length, 'text-yellow'],
            ['Bosses', fieldBosses.length, 'text-cyan'],
            ['Rewarded', `${rewarded}/${members.length}`, 'text-emerald'],
          ].map(([label, val, color]) => (
            <div key={label} className="flex flex-col items-center py-1 px-4">
              <div className={`text-2xl font-bold ${color}`}>{val}</div>
              <div className="text-xs text-muted uppercase tracking-widest mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
