import React, { useEffect, useMemo, useRef, useState } from 'react'

type Result = 'Granted' | 'Declined'
type Activity = { ts:number; game:string; result:Result; detail?:string; requiredSymbol:string; producedSymbol:string }

const SYMBOLS = ['⭐','🎯','✅','🔑'] as const

function useLocalStorage<T>(key:string, initial:T){
  const [state,setState] = useState<T>(()=>{
    try{ const raw=localStorage.getItem(key); return raw? JSON.parse(raw): initial }catch{ return initial }
  })
  useEffect(()=>{ try{ localStorage.setItem(key, JSON.stringify(state)) }catch{} },[key,state])
  return [state,setState] as const
}

function useRequiredSymbol(){
  const [symbol,setSymbol] = useLocalStorage<string>('requiredSymbol', SYMBOLS[0])
  const rotate = ()=> setSymbol(prev=> SYMBOLS[(SYMBOLS.indexOf(prev as any)+1)%SYMBOLS.length])
  return {symbol, rotate}
}

function useActivities(){
  const [items,setItems] = useLocalStorage<Activity[]>('recentActivities', [])
  const add = (a:Activity)=> setItems(prev=> [a, ...prev].slice(0,5))
  const clear = ()=> setItems([])
  return {items, add, clear}
}

function Banner({result}:{result:Result|null}){
  if(!result) return null
  const ok = result==='Granted'
  return <div role="status" className={`banner ${ok? 'banner-ok':'banner-bad'}`}>{ok? 'Access Granted ✅':'Access Declined ❌'}</div>
}

function Modal({open,onClose,children,title}:{open:boolean; onClose:()=>void; children:React.ReactNode; title:string}){
  const ref = useRef<HTMLDivElement>(null)
  useEffect(()=>{
    if(!open) return
    const prev = document.activeElement as HTMLElement | null
    const first = ref.current?.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    first?.focus()
    const onKey=(e:KeyboardEvent)=>{ if(e.key==='Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return ()=>{ window.removeEventListener('keydown', onKey); prev?.focus() }
  },[open,onClose])
  if(!open) return null
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="card w-[min(92vw,720px)] p-5" onClick={e=>e.stopPropagation()} ref={ref} aria-modal="true" role="dialog" aria-label={title}>
        <div className="flex items-center justify-between mb-3"><h3 className="text-lg font-extrabold">{title}</h3><button className="btn" onClick={onClose} aria-label="Close">✖</button></div>
        {children}
      </div>
    </div>
  )
}

function useCenteredLayout(){
  useEffect(()=>{
    history.scrollRestoration = 'manual'
    const reCenter = ()=>{ window.scrollTo(0,0) }
    window.addEventListener('popstate', reCenter)
    reCenter()
    return ()=> window.removeEventListener('popstate', reCenter)
  },[])
}

function Header({required}:{required:string}){
  return (
    <div className="w-full max-w-5xl flex items-center gap-3 px-4">
      <div className="w-6 h-6 rounded-[4px] bg-[conic-gradient(from_45deg,#ea4335_0_90deg,#4285f4_0_180deg,#34a853_0_270deg,#fbbc05_0_360deg)]" aria-hidden />
      <div className="flex-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold">Multi-Game Access</h1>
        <p className="text-white/70 text-sm">Win or match the rule to unlock.</p>
      </div>
      <div className="flex items-center gap-2 text-sm"><span className="opacity-70">Required:</span><span className="text-xl">{required}</span></div>
    </div>
  )
}

function Cards({onOpen}:{onOpen:(id:string)=>void}){
  const items = [
    {id:'chess', icon:'♟️', title:'Chess', desc:'Two‑Move Checkmate'},
    {id:'dice', icon:'🎲', title:'Dice', desc:'Need total 7'},
    {id:'tictactoe', icon:'⭕❌', title:'Tic‑Tac‑Toe', desc:'Beat CPU'},
    {id:'rps', icon:'✊✋✌️', title:'Stone–Paper–Scissor', desc:'Win round'},
    {id:'voice', icon:'🎤', title:'Voice Checker', desc:'Say “open”'},
  ]
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 w-full max-w-5xl px-4 mt-6">
      {items.map(it=> (
        <button key={it.id} className="card p-4 text-left hover:translate-y-[-2px] transition" onClick={()=>onOpen(it.id)} aria-label={`Open ${it.title}`}>
          <div className="text-2xl mb-2">{it.icon}</div>
          <div className="font-extrabold">{it.title}</div>
          <div className="text-white/70 text-sm">{it.desc}</div>
        </button>
      ))}
    </div>
  )
}

function Recent({items, onClear}:{items:Activity[]; onClear:()=>void}){
  return (
    <div className="w-full max-w-5xl px-4 mt-8">
      <div className="flex items-center justify-between mb-2"><h3 className="font-extrabold">Recent Activities</h3><button className="btn" onClick={onClear}>Clear History</button></div>
      <div className="card divide-y divide-white/10">
        {items.length===0? <div className="p-3 text-white/60">No attempts yet</div> : items.map((a,i)=> (
          <div className="p-3 flex items-center justify-between" key={i}>
            <div className="text-white/80 text-sm">{new Date(a.ts).toLocaleString()}</div>
            <div className="flex-1 px-3 text-sm">{a.game} — <span className={a.result==='Granted'? 'text-emerald-300':'text-rose-300'}>{a.result}</span>{a.detail? ` — ${a.detail}`:''}</div>
            <div className="text-sm">Req {a.requiredSymbol} | Got {a.producedSymbol}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DiceGame({onResult}:{onResult:(granted:boolean, produced:string, detail:string)=>void}){
  const roll=()=>{
    const a = (Math.random()*6|0)+1
    const b = (Math.random()*6|0)+1
    const sum = a+b
    const granted = sum===7
    onResult(granted, '🎲', `sum=${sum}`)
  }
  return (
    <div className="space-y-3">
      <div>Roll two dice. Need a total of 7.</div>
      <button className="btn" onClick={roll} aria-label="Roll dice">🎲 Roll</button>
    </div>
  )
}

function RpsGame({onResult}:{onResult:(granted:boolean, produced:string, detail:string)=>void}){
  const opts = ['rock','paper','scissors'] as const
  function icon(x:string){ return x==='rock'?'✊':x==='paper'?'✋':'✌️' }
  const play=(user:(typeof opts)[number])=>{
    const cpu = opts[Math.random()*3|0]
    const win = (user==='rock'&&cpu==='scissors')||(user==='paper'&&cpu==='rock')||(user==='scissors'&&cpu==='paper')
    onResult(win, icon(user), `you=${user} cpu=${cpu}`)
  }
  return (
    <div className="flex gap-2">
      <button className="btn" onClick={()=>play('rock')} aria-label="Pick rock">✊</button>
      <button className="btn" onClick={()=>play('paper')} aria-label="Pick paper">✋</button>
      <button className="btn" onClick={()=>play('scissors')} aria-label="Pick scissors">✌️</button>
    </div>
  )
}

function TttGame({onResult}:{onResult:(granted:boolean, produced:string, detail:string)=>void}){
  const [b,setB]=useState<string[]>(Array(9).fill(''))
  const HUMAN='X', CPU='O'
  const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
  function winner(B:string[]){ for(const [a,c,d] of lines){ if(B[a]&&B[a]===B[c]&&B[a]===B[d]) return B[a] } return B.every(Boolean)?'D':null }
  function cpu(B:string[]){ const empty=B.map((v,i)=>v?null:i).filter(v=>v!==null) as number[]; if(!empty.length) return B; return B.map((v,i)=> i===empty[Math.random()*empty.length|0]? CPU : v)
  }
  function play(i:number){ if(b[i]) return; const B=[...b]; B[i]=HUMAN; let w=winner(B); if(w){ finish(w,B); return } const B2=cpu(B); setB(B2); w=winner(B2); if(w) finish(w,B2) }
  function finish(w:string, B:string[]){ const res = w==='X'; onResult(res, res?'⭕':'❌', `board=${B.join('')}`) }
  return (
    <div className="grid grid-cols-3 gap-2">
      {b.map((v,i)=> <button key={i} className="btn w-16 h-16 text-xl" onClick={()=>play(i)} aria-label={`cell ${i+1}`}>{v}</button>)}
    </div>
  )
}

function VoiceGame({onResult}:{onResult:(granted:boolean, produced:string, detail:string)=>void}){
  const [supported] = useState(()=> 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
  const recRef = useRef<any>(null)
  const [listening,setListening] = useState(false)
  useEffect(()=>{
    if(!supported) return
    const SR:any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const rec = new SR(); recRef.current = rec
    rec.lang='en-US'; rec.interimResults=false; rec.continuous=false
    rec.onstart=()=>setListening(true)
    rec.onend=()=>setListening(false)
    rec.onresult=(ev:any)=>{
      const t = (ev.results[0][0].transcript||'').trim().toLowerCase().replace(/[!.,?]/g,'')
      const ok = t==='open'
      onResult(ok, '🎤', `said="${t}"`)
    }
  },[supported,onResult])
  const start=()=>{ if(recRef.current){ try{ recRef.current.start() }catch{} } }
  return (
    <div className="space-y-3">
      {supported? <>
        <button className="btn" onMouseDown={start} onClick={start} aria-label="Hold to speak">{listening? 'Listening…':'Hold to Speak'}</button>
        <div className="text-sm text-white/70">Say exact word: open</div>
      </> : <>
        <div className="text-sm text-white/80">Speech API unsupported. Type the secret word:</div>
        <FallbackInput onResult={onResult}/>
      </>}
    </div>
  )
}

function FallbackInput({onResult}:{onResult:(granted:boolean, produced:string, detail:string)=>void}){
  const [v,setV]=useState('')
  return (
    <div className="flex gap-2">
      <input value={v} onChange={e=>setV(e.target.value)} className="card px-3 py-2 outline-none" aria-label="type the secret" />
      <button className="btn" onClick={()=> onResult(v.trim().toLowerCase()==='open','🎤',`typed="${v}"`) }>Submit</button>
    </div>
  )
}

// Minimal chess puzzle (mate in 2) — simplified legal moves subset for demo
function ChessGame({onResult}:{onResult:(granted:boolean, produced:string, detail:string)=>void}){
  // For brevity: simulate success after two user moves
  const [moves,setMoves]=useState<string[]>([])
  function clickSquare(idx:number){ const file = 'abcdefgh'[idx%8]; const rank = 8-(idx/8|0); setMoves(m=>{ const nm=[...m, `${file}${rank}`]; if(nm.length>=2){ onResult(true,'♟','moves='+nm.join(',')) } return nm }) }
  return (
    <div>
      <div className="grid grid-cols-8">
        {Array.from({length:64}).map((_,i)=> <button key={i} onClick={()=>clickSquare(i)} className="w-10 h-10" style={{background: ((i+(i/8|0))%2)? '#b58863':'#f0d9b5'}} aria-label={`square ${i}`}></button>)}
      </div>
      <div className="text-sm text-white/70 mt-2">Find mate in two (demo: pick any two squares)</div>
    </div>
  )
}

export default function App(){
  useCenteredLayout()
  const {symbol, rotate} = useRequiredSymbol()
  const {items, add, clear} = useActivities()
  const [banner,setBanner]=useState<Result|null>(null)
  const [open,setOpen]=useState<string|null>(null)

  useEffect(()=>{ const last = localStorage.getItem('lastResult'); if(last){ /* keep */ } },[])

  function record(game:string, provisionalGranted:boolean, producedSymbol:string, detail:string){
    const matched = producedSymbol===symbol
    const finalGranted = provisionalGranted && matched
    const result:Result = finalGranted? 'Granted':'Declined'
    setBanner(result)
    const act:Activity = { ts:Date.now(), game, result, detail, requiredSymbol:symbol, producedSymbol }
    add(act)
    localStorage.setItem('lastResult', JSON.stringify({result, ts: act.ts}))
    rotate()
    setTimeout(()=> setBanner(null), 2000)
  }

  function onGameResult(game:string){
    return (granted:boolean, produced:string, detail:string)=>{
      record(game, granted, produced, detail)
      setOpen(null)
    }
  }

  const modals = {
    dice: <DiceGame onResult={onGameResult('Dice')}/>,
    rps: <RpsGame onResult={onGameResult('Stone–Paper–Scissor')}/>,
    tictactoe: <TttGame onResult={onGameResult('Tic‑Tac‑Toe')}/>,
    voice: <VoiceGame onResult={onGameResult('Voice')}/>,
    chess: <ChessGame onResult={onGameResult('Chess')}/>,
  } as const

  return (
    <div className="min-h-screen w-screen flex items-center justify-center">
      <Banner result={banner}/>
      <div className="w-full max-w-6xl">
        <Header required={symbol}/>
        <Cards onOpen={setOpen}/>
        <Recent items={items} onClear={clear}/>
      </div>

      <Modal open={!!open} onClose={()=>setOpen(null)} title={{dice:'Dice', rps:'Stone–Paper–Scissor', tictactoe:'Tic‑Tac‑Toe', voice:'Voice Checker', chess:'Chess'}[open as keyof typeof modals] || ''}>
        {open? (modals as any)[open]: null}
      </Modal>
    </div>
  )
}


