import { DAYS } from '../constants.js'
import { Label, Input, Select } from './UI.jsx'

export default function BossFormFields({ form, setForm }) {
  const addSchedule = () =>
    setForm(f => ({ ...f, scheduledTimes: [...f.scheduledTimes, { day: 'Sunday', time: '19:00' }] }))
  const removeSchedule = i =>
    setForm(f => ({ ...f, scheduledTimes: f.scheduledTimes.filter((_, idx) => idx !== i) }))
  const updateSchedule = (i, key, val) =>
    setForm(f => ({ ...f, scheduledTimes: f.scheduledTimes.map((s, idx) => idx === i ? { ...s, [key]: val } : s) }))

  return (
    <div className="space-y-4">
      <div>
        <Label>Boss Name</Label>
        <Input
          placeholder="e.g. Ferrid…"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        />
      </div>

      <div>
        <Label>Attendance Points</Label>
        <Input
          type="number" min={1} max={20}
          value={form.points}
          onChange={e => setForm(f => ({ ...f, points: e.target.value }))}
        />
      </div>

      <div>
        <Label>Spawn Type</Label>
        <div className="grid grid-cols-2 gap-2.5">
          {[['timer','⏱ Timer','Respawns after kill'],['scheduled','📅 Scheduled','Fixed day & time']].map(([val, label, desc]) => (
            <div
              key={val}
              onClick={() => setForm(f => ({ ...f, spawnType: val }))}
              className={`p-3 rounded-xl cursor-pointer border-[1.5px] transition-all ${
                form.spawnType === val
                  ? 'border-purple/80 bg-purple/20'
                  : 'border-border bg-[rgba(19,34,56,0.3)] hover:border-border/80'
              }`}
            >
              <div className={`text-sm font-semibold ${form.spawnType === val ? 'text-yellow' : 'text-muted'}`}>{label}</div>
              <div className="text-xs text-muted mt-0.5">{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {form.spawnType === 'timer' && (
        <div>
          <Label>Respawn Timer (hours)</Label>
          <Input
            type="number" min={1} max={72}
            value={form.respawnHours}
            onChange={e => setForm(f => ({ ...f, respawnHours: e.target.value }))}
          />
        </div>
      )}

      {form.spawnType === 'scheduled' && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label>Spawn Schedule</Label>
            <button
              onClick={addSchedule}
              className="text-xs px-2.5 py-1 rounded-lg bg-[rgba(19,34,56,0.6)] border border-border text-muted hover:border-gold/50 hover:text-gold transition-all"
            >
              + Add Slot
            </button>
          </div>
          {form.scheduledTimes.length === 0 && (
            <div className="text-center p-4 rounded-xl border border-dashed border-border/50 text-muted/50 text-sm">
              No schedule yet — click + Add Slot
            </div>
          )}
          {form.scheduledTimes.map((s, i) => (
            <div key={i} className="flex gap-2 items-end mb-2 p-3 rounded-xl bg-[rgba(19,34,56,0.2)] border border-border/70">
              <div className="flex-1">
                <div className="text-[0.65rem] text-muted tracking-widest uppercase mb-1">Day</div>
                <Select
                  value={s.day}
                  onChange={e => updateSchedule(i, 'day', e.target.value)}
                  className="text-sm py-1.5"
                >
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </Select>
              </div>
              <div className="flex-1">
                <div className="text-[0.65rem] text-muted tracking-widest uppercase mb-1">Time</div>
                <Input
                  type="time"
                  value={s.time}
                  onChange={e => updateSchedule(i, 'time', e.target.value)}
                  className="text-sm py-1.5"
                />
              </div>
              {form.scheduledTimes.length > 1 && (
                <button
                  onClick={() => removeSchedule(i)}
                  className="mb-0.5 px-2 py-1.5 text-xs text-red-400 border border-red-500/25 rounded-lg hover:bg-red-500/10 transition-all"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
