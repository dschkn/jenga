import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getDemoRepository } from '../../../../../packages/platform/demo.mjs';
import { useCurrentUser } from '../../hooks/use-auth';
import { Button } from '../../components/ui/button';
import { useDemo } from './useDemo';
import { Empty, ModuleShell } from './Shell';
export default function Events() {
 const {state,error,act}=useDemo(); const {userId}=useCurrentUser(); const [unread,setUnread]=useState(false);
 const events=state.events.filter(e=>!unread||!e.readBy.includes(userId));
 return <ModuleShell title="Jenga Events" description="Старты групп и действия команды. События появляются автоматически после ваших действий." error={error}><div className="flex flex-wrap items-center justify-between gap-3"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={unread} onChange={e=>setUnread(e.target.checked)}/>Только непрочитанные</label><Button variant="outline" disabled={!state.events.some(e=>!e.readBy.includes(userId))} onClick={()=>act(()=>state.events.forEach(e=>getDemoRepository().markRead(e.id,userId)))}>Прочитать все</Button></div>{!events.length&&<Empty>Событий пока нет. Запустите новую группу или добавьте обращение в Inbox.</Empty>}{events.map(e=><article key={e.id} className={`rounded-lg border p-4 ${e.readBy.includes(userId)?'bg-card':'border-yellow-300 bg-yellow-50 text-black'}`}><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-medium">{e.title}</h2><time className="text-xs text-muted-foreground">{new Date(e.createdAt).toLocaleString('ru')}</time></div>{!e.readBy.includes(userId)&&<Button variant="outline" size="sm" onClick={()=>act(()=>getDemoRepository().markRead(e.id,userId))}>Прочитано</Button>}</div><Link className="mt-3 inline-block text-sm underline" to={e.kind.startsWith('group')?'/groups':e.kind==='inbox'?'/inbox':e.kind==='call'?'/calls':'/publish'}>Открыть раздел →</Link></article>)}</ModuleShell>;
}
