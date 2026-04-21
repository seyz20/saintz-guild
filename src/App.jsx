import { useState, useEffect } from 'react'
import {
  LS_KEY, TABS, DEFAULT_GUILD_EVENTS,
  DEFAULT_FIELD_BOSSES, INITIAL_MEMBERS, INITIAL_EVENTS,
  formatDate, loadFromLS, saveToLS
} from './constants.js'

import Dashboard        from './components/Dashboard.jsx'
import BossManagement   from './components/BossManagement.jsx'
import Members          from './components/Members.jsx'
import Rallies          from './components/Rallies.jsx'
import PointsEditor     from './components/PointsEditor.jsx'
import EventLog         from './components/EventLog.jsx'
import EventManagement  from './components/EventManagement.jsx'
import Settings         from './components/Settings.jsx'
import Screenshots      from './components/Screenshots.jsx'

// ── Load persisted data once ────────────────────────────────────────────────
const _ls = loadFromLS()

export default function App() {
  const [activeTab, setActiveTab]         = useState('Dashboard')
  const [tick, setTick]                   = useState(0)

  // ── Persisted state ──────────────────────────────────────────────────────
  const [members,         setMembers]         = useState(_ls?.members          ?? INITIAL_MEMBERS)
  const [events,          setEvents]          = useState(_ls?.events           ?? INITIAL_EVENTS)
  const [fieldBosses,     setFieldBosses]     = useState(_ls?.fieldBosses      ?? DEFAULT_FIELD_BOSSES)
  const [guildEvents,     setGuildEvents]     = useState(_ls?.guildEvents      ?? DEFAULT_GUILD_EVENTS)
  const [guildName,       setGuildName]       = useState(_ls?.guildName        ?? 'SaintZ Guild')
  const [guildSubtitle,   setGuildSubtitle]   = useState(_ls?.guildSubtitle    ?? 'Lord Nine · Attendance Records')
  const [nextMemberId,    setNextMemberId]     = useState(_ls?.nextMemberId     ?? 45)
  const [nextEventId,     setNextEventId]      = useState(_ls?.nextEventId      ?? 103)
  const [nextBossId,      setNextBossId]       = useState(_ls?.nextBossId       ?? 2)
  const [rallies,         setRallies]          = useState(_ls?.rallies          ?? [])
  const [nextRallyId,     setNextRallyId]      = useState(_ls?.nextRallyId      ?? 1)
  const [rewardThreshold, setRewardThreshold]  = useState(_ls?.rewardThreshold  ?? 40)
  const [lastReset,       setLastReset]        = useState(_ls?.lastReset ? new Date(_ls.lastReset) : null)
  const [screenshots,         setScreenshots]         = useState(_ls?.screenshots         ?? {})
  const [screenshotLastReset, setScreenshotLastReset] = useState(_ls?.screenshotLastReset ?? null)

  // ── UI-only state ────────────────────────────────────────────────────────
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [importMsg,        setImportMsg]         = useState('')

  // 1-second ticker for countdowns
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  // Auto-save to localStorage
  useEffect(() => {
    saveToLS({
      members, events, fieldBosses, guildEvents, guildName, guildSubtitle,
      nextMemberId, nextEventId, nextBossId,
      rallies, nextRallyId, rewardThreshold,
      lastReset: lastReset ? lastReset.toISOString() : null,
      screenshots, screenshotLastReset,
    })
  }, [members, events, fieldBosses, guildEvents, guildName, guildSubtitle, nextMemberId, nextEventId, nextBossId,
      rallies, nextRallyId, rewardThreshold, lastReset, screenshots, screenshotLastReset])

  // ── Data Transfer ─────────────────────────────────────────────────────────
  function downloadCSV() {
    const sorted = [...members].sort((a, b) => b.weeklyPoints - a.weeklyPoints)
    const now    = new Date()
    const rows   = [
      ['Rank', 'Character Name', 'Weekly Points', 'Total Points'],
      ...sorted.map((m, i) => [
        i + 1,
        m.name,
        m.weeklyPoints || 0,
        m.totalPoints,
      ])
    ]
    const csv  = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `saintz-ranking-${now.toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function downloadJSON() {
    const data = {
      exportedAt: new Date().toISOString(),
      guild: 'SaintZ',
      members, events, fieldBosses,
      nextMemberId, nextEventId, nextBossId,
      rallies, nextRallyId, rewardThreshold,
      lastReset: lastReset ? lastReset.toISOString() : null,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `saintz-guild-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function importJSON(file) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const d = JSON.parse(e.target.result)
        if (!d.members || !d.events) throw new Error('Invalid file')
        setMembers(d.members)
        setEvents(d.events)
        setFieldBosses(d.fieldBosses ?? DEFAULT_FIELD_BOSSES)
        setNextMemberId(d.nextMemberId ?? 45)
        setNextEventId(d.nextEventId   ?? 103)
        setNextBossId(d.nextBossId     ?? 2)
        setRallies(d.rallies           ?? [])
        setNextRallyId(d.nextRallyId   ?? 1)
        setRewardThreshold(d.rewardThreshold ?? 40)
        setLastReset(d.lastReset ? new Date(d.lastReset) : null)
        setImportMsg('✦ Data imported successfully!')
        setTimeout(() => setImportMsg(''), 3000)
      } catch {
        setImportMsg('✕ Invalid JSON file.')
        setTimeout(() => setImportMsg(''), 3000)
      }
    }
    reader.readAsText(file)
  }

  // ── Tab labels ────────────────────────────────────────────────────────────
  const TAB_ICONS = {
    'Dashboard':       '🏠',
    'Boss Management': '🐉',
    'Members':         '👥',
    'Attendance':      '📋',
    'Points Editor':   '✏️',
    'Screenshots':     '📸',
    'Event Log':       '📜',
    'Guild Events':    '🎖️',
    'Settings':        '⚙️',
  }

  return (
    <div className="min-h-screen bg-bg text-txt relative overflow-x-hidden">
      <div className="orb1" /><div className="orb2" /><div className="orb3" />

      <div className="relative z-10 max-w-[1380px] mx-auto px-5 pb-12">

        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <div className="py-8 mb-2">
          <div className="flex items-center gap-5">
            {/* Logo */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black flex-shrink-0 border border-cyan/20"
              style={{ background: 'rgba(0,194,255,0.08)', color: '#00C2FF' }}
            >
              ✙
            </div>

            <div>
              <h1 className="text-4xl font-black tracking-tight text-txt">
                {guildName}
              </h1>
              <p className="text-muted-2 text-sm mt-1 tracking-wide">{guildSubtitle}</p>
            </div>

            {/* Stat chips */}
            <div className="ml-auto flex gap-3">
              {[
                { label: 'Members', val: members.length,     color: 'text-emerald', bg: 'bg-emerald/8  border-emerald/20' },
                { label: 'Events',  val: events.length,      color: 'text-cyan',    bg: 'bg-cyan/8     border-cyan/20'    },
                { label: 'Bosses',  val: fieldBosses.length, color: 'text-yellow',  bg: 'bg-yellow/8   border-yellow/20'  },
              ].map(({ label, val, color, bg }) => (
                <div key={label} className={`px-4 py-2 rounded-xl border ${bg} text-center`}>
                  <div className={`text-xl font-black ${color}`}>{val}</div>
                  <div className="text-[0.65rem] text-muted-2 uppercase tracking-widest">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TABS ───────────────────────────────────────────────────────── */}
        <div className="sticky top-0 z-20 bg-bg/95 backdrop-blur-md border-b border-border mb-6">
          <div className="flex gap-0 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative flex items-center gap-1.5 whitespace-nowrap px-5 py-3 text-sm font-medium transition-all border-none bg-none cursor-pointer ${
                  activeTab === tab
                    ? 'text-cyan font-bold'
                    : 'text-muted-2/70 hover:text-cyan/80'
                }`}
                style={activeTab === tab ? { textShadow: '0 0 10px rgba(0,194,255,0.5)' } : {}}
              >
                <span className="text-base">{TAB_ICONS[tab]}</span>
                <span>{tab}</span>
                {activeTab === tab && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t"
                    style={{ background: 'linear-gradient(90deg,transparent,#00C2FF,#1ED0FF,#00C2FF,transparent)', boxShadow: '0 0 8px rgba(0,194,255,0.5)' }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
        {/* ── TAB CONTENT ────────────────────────────────────────────────── */}
        {activeTab === 'Dashboard' && (
          <Dashboard
            members={members}
            events={events}
            fieldBosses={fieldBosses}
            rewardThreshold={rewardThreshold}
            tick={tick}
          />
        )}

        {activeTab === 'Boss Management' && (
          <BossManagement
            fieldBosses={fieldBosses}
            setFieldBosses={setFieldBosses}
            nextBossId={nextBossId}
            setNextBossId={setNextBossId}
            tick={tick}
          />
        )}

        {activeTab === 'Members' && (
          <Members
            members={members}
            setMembers={setMembers}
            nextMemberId={nextMemberId}
            setNextMemberId={setNextMemberId}
            rewardThreshold={rewardThreshold}
            setRewardThreshold={setRewardThreshold}
            lastReset={lastReset}
            setLastReset={setLastReset}
            showResetConfirm={showResetConfirm}
            setShowResetConfirm={setShowResetConfirm}
            downloadCSV={downloadCSV}
          />
        )}

        {activeTab === 'Attendance' && (
          <Rallies
            members={members}
            setMembers={setMembers}
            fieldBosses={fieldBosses}
            guildEvents={guildEvents}
            events={events}
            setEvents={setEvents}
            nextEventId={nextEventId}
            setNextEventId={setNextEventId}
          />
        )}

        {activeTab === 'Points Editor' && (
          <PointsEditor
            members={members}
            setMembers={setMembers}
            nextMemberId={nextMemberId}
            setNextMemberId={setNextMemberId}
            events={events}
            setEvents={setEvents}
            fieldBosses={fieldBosses}
            setFieldBosses={setFieldBosses}
            nextEventId={nextEventId}
            setNextEventId={setNextEventId}
            nextBossId={nextBossId}
            setNextBossId={setNextBossId}
            rallies={rallies}
            setRallies={setRallies}
            nextRallyId={nextRallyId}
            setNextRallyId={setNextRallyId}
            rewardThreshold={rewardThreshold}
            setRewardThreshold={setRewardThreshold}
            lastReset={lastReset}
            setLastReset={setLastReset}
            showResetConfirm={showResetConfirm}
            setShowResetConfirm={setShowResetConfirm}
            downloadJSON={downloadJSON}
            importJSON={importJSON}
            importMsg={importMsg}
          />
        )}

        {activeTab === 'Event Log' && (
          <EventLog
            members={members}
            setMembers={setMembers}
            events={events}
            setEvents={setEvents}
          />
        )}

        {activeTab === 'Screenshots' && (
          <Screenshots
            members={members}
            screenshots={screenshots}
            setScreenshots={setScreenshots}
            screenshotLastReset={screenshotLastReset}
            setScreenshotLastReset={setScreenshotLastReset}
          />
        )}

        {activeTab === 'Guild Events' && (
          <EventManagement
            guildEvents={guildEvents}
            setGuildEvents={setGuildEvents}
          />
        )}

        {activeTab === 'Settings' && (
          <Settings
            guildName={guildName}
            setGuildName={setGuildName}
            guildSubtitle={guildSubtitle}
            setGuildSubtitle={setGuildSubtitle}
          />
        )}
      </div>
    </div>
  )
}
