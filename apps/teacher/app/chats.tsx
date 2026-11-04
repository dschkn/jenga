'use client';
import { useEffect, useState } from 'react';
import { emptyState, getDemoRepository, subscribeDemo } from '../../../packages/platform/demo.mjs';

export default function Chats() {
 const [state,setState]=useState(emptyState); const [roomId,setRoomId]=useState('team'); const [draft,setDraft]=useState(''); const [error,setError]=useState('');
 useEffect(()=>{
  const load=()=>{try{setState(getDemoRepository().read());}catch{setError('Локальные данные недоступны');}};
  load();return subscribeDemo(load);
 },[]);
 return <section className="jenga-chats"><header><p>Jenga · Демо-пространство</p><h1>Чаты</h1><p>Обсуждения преподавателей и администраторов</p></header><p className="chat-notice">Локальная демонстрация. Сообщения видны в этом браузере на этом адресе приложения. Синхронизация между CRM и Teacher на разных адресах ещё не подключена.</p>{error&&<p role="alert">{error}</p>}<label>Обсуждение<select value={roomId} onChange={e=>setRoomId(e.target.value)}>{state.rooms.map(r=><option value={r.id} key={r.id}>{r.title}</option>)}</select></label><div className="chat-log" role="log" aria-live="polite">{!state.messages.some(m=>m.roomId===roomId)&&<p>Сообщений пока нет. Напишите администраторам.</p>}{state.messages.filter(m=>m.roomId===roomId).map(m=><article key={m.id}><small>{m.authorId==='teacher-demo'?'Вы':m.authorId==='system'?'Jenga Events':'Сотрудник'} · {new Date(m.createdAt).toLocaleString('ru')}</small><p>{m.text}</p></article>)}</div><form onSubmit={e=>{e.preventDefault();try{getDemoRepository().send(roomId,'teacher-demo',draft);setDraft('');setError('');}catch(e){setError(e instanceof Error?e.message:'Ошибка сохранения');}}}><label>Сообщение<textarea value={draft} onChange={e=>setDraft(e.target.value)} maxLength={4000} placeholder="Написать администраторам…"/></label><button disabled={!draft.trim()} type="submit">Отправить</button></form></section>;
}
