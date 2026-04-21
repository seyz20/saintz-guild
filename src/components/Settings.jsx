import { useState } from 'react'
import { Card, Label, Input, BtnPrimary } from './UI.jsx'

export default function Settings({ guildName, setGuildName, guildSubtitle, setGuildSubtitle }) {
  const [nameForm,     setNameForm]     = useState(guildName)
  const [subtitleForm, setSubtitleForm] = useState(guildSubtitle)
  const [saved,        setSaved]        = useState(false)

  function save() {
    const name = nameForm.trim() || 'SaintZ Guild'
    const sub  = subtitleForm.trim()
    setGuildName(name)
    setGuildSubtitle(sub)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="fade-up max-w-lg">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-border/60">
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg">⚙️</div>
          <div>
            <div className="text-base font-bold text-txt">Settings</div>
            <div className="text-xs text-muted mt-0.5">Customize your guild</div>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <Label>Guild Name</Label>
            <Input
              placeholder="e.g. SaintZ Guild"
              value={nameForm}
              onChange={e => setNameForm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && save()}
              className="text-base"
            />
            <p className="text-xs text-muted/60 mt-1.5">Shown in the header and exported files.</p>
          </div>

          <div>
            <Label>Subtitle</Label>
            <Input
              placeholder="e.g. Lord Nine · Attendance Records"
              value={subtitleForm}
              onChange={e => setSubtitleForm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && save()}
            />
            <p className="text-xs text-muted/60 mt-1.5">Small text shown below the guild name.</p>
          </div>

          <div className="pt-2">
            {saved
              ? <div className="w-full py-2.5 rounded-xl text-center text-sm font-semibold text-emerald bg-emerald/[0.08] border border-green-500/20">✓ Saved!</div>
              : <BtnPrimary className="w-full" onClick={save}>Save Changes</BtnPrimary>
            }
          </div>
        </div>
      </Card>
    </div>
  )
}
