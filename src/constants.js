export const LS_KEY = 'saintz_guild_v1'

export const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

export const TABS = ['Dashboard','Boss Management','Members','Attendance','Points Editor','Screenshots','Event Log','Guild Events','Settings']

export const DEFAULT_GUILD_EVENTS = [
  { id:'ge1', name:'GvG Won',    points:5 },
  { id:'ge2', name:'GvG Lose',   points:3 },
  { id:'ge3', name:'GvG Draw',   points:4 },
  { id:'ge4', name:'Guild Boss', points:2 },
]

export const DEFAULT_FIELD_BOSSES = [
  { id:'b1', name:'Tumier', points:5, category:'field', spawnType:'scheduled', respawnHours:null, lastKilled:null, scheduledTimes:[{day:'Sunday',time:'19:00'}] },
]

export const INITIAL_MEMBERS = [
  { id:1,  name:'Quitss',       totalPoints:148, weeklyPoints:42 },
  { id:2,  name:'xZei',         totalPoints:136, weeklyPoints:38 },
  { id:3,  name:'MisterGats',   totalPoints:155, weeklyPoints:45 },
  { id:4,  name:'neyalkhalifa', totalPoints:121, weeklyPoints:28 },
  { id:5,  name:'Soy',          totalPoints:162, weeklyPoints:50 },
  { id:6,  name:'TaRKoK',       totalPoints:98,  weeklyPoints:22 },
  { id:7,  name:'Seyz',         totalPoints:110, weeklyPoints:41 },
  { id:8,  name:'xTeachDx',     totalPoints:87,  weeklyPoints:18 },
  { id:9,  name:'Estivate',     totalPoints:143, weeklyPoints:44 },
  { id:10, name:'Ashlii',       totalPoints:76,  weeklyPoints:15 },
  { id:11, name:'CarlJane',     totalPoints:132, weeklyPoints:40 },
  { id:12, name:'AsHiBOrN',     totalPoints:61,  weeklyPoints:10 },
  { id:13, name:'frostmourne0', totalPoints:119, weeklyPoints:36 },
  { id:14, name:'neekochan',    totalPoints:54,  weeklyPoints:8  },
  { id:15, name:'vend13',       totalPoints:168, weeklyPoints:52 },
  { id:16, name:'ByGiL',        totalPoints:92,  weeklyPoints:20 },
  { id:17, name:'Sprakanoids',  totalPoints:141, weeklyPoints:43 },
  { id:18, name:'xDaddyChill',  totalPoints:73,  weeklyPoints:14 },
  { id:19, name:'Meijin',       totalPoints:125, weeklyPoints:37 },
  { id:20, name:'Bggy',         totalPoints:47,  weeklyPoints:6  },
  { id:21, name:'Cogwind',      totalPoints:157, weeklyPoints:48 },
  { id:22, name:'KainaH',       totalPoints:83,  weeklyPoints:19 },
  { id:23, name:'Tagailog',     totalPoints:138, weeklyPoints:42 },
  { id:24, name:'protago',      totalPoints:66,  weeklyPoints:12 },
  { id:25, name:'Bo0om',        totalPoints:174, weeklyPoints:55 },
  { id:26, name:'Graya',        totalPoints:103, weeklyPoints:30 },
  { id:27, name:'TheComa',      totalPoints:117, weeklyPoints:35 },
  { id:28, name:'PongsKie',     totalPoints:58,  weeklyPoints:9  },
  { id:29, name:'J0hnwick',     totalPoints:146, weeklyPoints:44 },
  { id:30, name:'JohnyJohny',   totalPoints:79,  weeklyPoints:16 },
  { id:31, name:'LowLife',      totalPoints:128, weeklyPoints:39 },
  { id:32, name:'Zandara',      totalPoints:42,  weeklyPoints:5  },
  { id:33, name:'Yaji',         totalPoints:161, weeklyPoints:49 },
  { id:34, name:'Liey',         totalPoints:95,  weeklyPoints:24 },
  { id:35, name:'DexXx',        totalPoints:133, weeklyPoints:41 },
  { id:36, name:'Nuraht',       totalPoints:70,  weeklyPoints:13 },
  { id:37, name:'Albayana',     totalPoints:149, weeklyPoints:46 },
  { id:38, name:'Mapple',       totalPoints:85,  weeklyPoints:21 },
  { id:39, name:'Dart',         totalPoints:122, weeklyPoints:38 },
  { id:40, name:'Sese',         totalPoints:55,  weeklyPoints:7  },
  { id:41, name:'ZaRRiaH',      totalPoints:165, weeklyPoints:51 },
  { id:42, name:'MerryJane',    totalPoints:108, weeklyPoints:33 },
  { id:43, name:'Watapatafa',   totalPoints:139, weeklyPoints:43 },
  { id:44, name:'eldineee',     totalPoints:64,  weeklyPoints:11 },
]

export const INITIAL_EVENTS = [
  { id:101, bossId:'b6', bossName:'Garmoth',     date:'2026-03-05', time:'20:00', points:6,  category:'field', attendees:[1,3,5,7,9] },
  { id:102, bossId:'a1', bossName:'GvG Victory', date:'2026-03-06', time:'21:00', points:10, category:'arena', attendees:[1,2,3,4,5,6,7,8] },
]

export const formatDate = (d) => new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})

export function fmtCountdown(ms) {
  if (ms <= 0) return 'SPAWNED'
  const s = Math.floor(ms/1000), h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
}

export function rankClass(index, pts, threshold = 40) {
  if (index === 0) return 'r1'
  if (index === 1) return 'r2'
  if (index === 2) return 'r3'
  if (index === 3) return 'r4'
  if (pts >= threshold) return 'r5'
  return 'rn'
}

export function loadFromLS() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch(e) { return null }
}

export function saveToLS(data) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(data)) } catch(e) {}
}
