import { useState } from 'react';
import { getDemoRepository } from '../../../../../packages/platform/demo.mjs';
import { useCurrentUser } from '../../hooks/use-auth';
import { getAdminDirectory } from '../../data/adminDirectory';
import { getTeacherDirectory } from '../../data/teacherDirectory';
import { Button } from '../../components/ui/button';
import { useDemo } from './useDemo';
import { Empty, fieldClass, ModuleShell } from './Shell';
export default function Chats() {
 const { state, error, act } = useDemo(); const { userId } = useCurrentUser();
 const [roomId,setRoomId] = useState('team'); const [draft,setDraft] = useState(''); const [title,setTitle] = useState(''); const [member,setMember] = useState('');
 const people = [...getAdminDirectory(), ...getTeacherDirectory()].filter(p=>p.active);
 const names = new Map(people.map(p=>[p.id,p.name]));
 return <ModuleShell title="Jenga Chats" description="Общий чат и отдельные обсуждения с сотрудниками и преподавателями." error={error}>
 <div className="grid gap-4 md:grid-cols-[240px_1fr]"><aside className="space-y-3"><form className="space-y-2 rounded-lg border p-3" onSubmit={e=>{e.preventDefault();act(()=>{setRoomId(getDemoRepository().createRoom(title,member?[member,userId]:[userId]));setTitle('');});}}><input aria-label="Название чата" placeholder="Название нового чата" className={fieldClass} value={title} onChange={e=>setTitle(e.target.value)} required maxLength={100}/><select aria-label="Участник" className={fieldClass} value={member} onChange={e=>setMember(e.target.value)}><option value="">Обсуждение команды</option>{people.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select><Button className="w-full" disabled={!title.trim()}>Создать чат</Button></form>{state.rooms.map(r=><button key={r.id} className={`w-full rounded-lg border p-3 text-left text-sm ${roomId===r.id?'bg-yellow-100 text-black':'bg-card'}`} onClick={()=>setRoomId(r.id)}>{r.title}<span className="block text-xs text-muted-foreground">{r.memberIds.map(id=>names.get(id)||'Сотрудник').join(', ') || 'Вся команда'}</span></button>)}</aside>
 <div className="min-w-0 rounded-lg border bg-card p-4"><h2 className="font-semibold">{state.rooms.find(r=>r.id===roomId)?.title}</h2><div className="my-4 h-80 space-y-3 overflow-y-auto" role="log" aria-live="polite">{!state.messages.some(m=>m.roomId===roomId)&&<Empty>Начните обсуждение. Здесь появятся сообщения команды.</Empty>}{state.messages.filter(m=>m.roomId===roomId).map(m=><article key={m.id} className="rounded-lg bg-muted p-3"><div className="text-xs text-muted-foreground">{m.authorId==='system'?'Jenga Events':m.authorId===userId?'Вы':names.get(m.authorId)||'Преподаватель'} · {new Date(m.createdAt).toLocaleString('ru')}</div><p className="mt-1 whitespace-pre-wrap break-words text-sm">{m.text}</p></article>)}</div><form className="flex flex-wrap gap-2" onSubmit={e=>{e.preventDefault();if(act(()=>getDemoRepository().send(roomId,userId,draft)))setDraft('');}}><input className={fieldClass+' flex-1 min-w-40'} aria-label="Сообщение" placeholder="Написать сообщение…" maxLength={4000} value={draft} onChange={e=>setDraft(e.target.value)}/><Button disabled={!draft.trim()}>Отправить</Button></form></div></div></ModuleShell>;
}
