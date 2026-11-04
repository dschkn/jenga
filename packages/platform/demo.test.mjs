import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemoRepository, DEMO_KEY } from './demo.mjs';
function setup() {
 const data = new Map(); let notices=0;
 const storage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};
 return {repo:createDemoRepository(storage,()=>notices++),storage,data,notices:()=>notices};
}
test('clean state, room and messages persist across repository instances',()=>{
 const {repo,storage}=setup(); assert.equal(repo.read().inbox.length,0); assert.equal(repo.read().messages.length,0);
 const room=repo.createRoom('Обсуждение',['teacher-1','teacher-1']);
 repo.send(room,'teacher-1','  Начинаем  ');
 const restored=createDemoRepository(storage).read();
 assert.equal(restored.messages[0].text,'Начинаем'); assert.deepEqual(restored.rooms[1].memberIds,['teacher-1']);
 assert.throws(()=>repo.send('missing','teacher-1','message')); assert.throws(()=>repo.send(room,'teacher-1',' '));
});
test('group launch is idempotent and links event, chat and publication',()=>{
 const {repo}=setup(); const group={id:'group-1',name:'Новая группа',startDate:'2026-11-10'};
 repo.groupStarted(group);repo.groupStarted(group);
 assert.equal(repo.read().events.length,1);assert.equal(repo.read().messages.length,1);
 assert.equal(repo.read().posts[0].groupId,group.id);assert.equal(repo.read().posts[0].status,'draft');
 repo.markRead(repo.read().events[0].id,'admin');repo.markRead(repo.read().events[0].id,'admin');
 assert.deepEqual(repo.read().events[0].readBy,['admin']);
 repo.groupCancelled(group.id);assert.equal(repo.read().events[0].kind,'group-cancel');
 repo.groupStarted(group);assert.equal(repo.read().events[0].kind,'group-start');
});
test('inbox and calls share one contact; refusal needs reason',()=>{
 const {repo}=setup();const inbox=repo.receive('email','Тестовый клиент','Хочу учиться');
 repo.updateInbox(inbox,'in_progress','admin-1');
 assert.throws(()=>repo.logCall(inbox,'outgoing','refused','',''));
 assert.equal(repo.read().calls.length,0);
 repo.logCall(inbox,'outgoing','refused','Дорого','Вернуться позже');
 assert.equal(repo.read().inbox.length,1);assert.equal(repo.read().inbox[0].status,'closed');
 assert.equal(repo.read().calls[0].inboxId,inbox);
 assert.throws(()=>repo.logCall('missing','outgoing','connected','',''));
});
test('publication validation, scheduling, edit, simulation, delete',()=>{
 const {repo}=setup();const post={text:'Анонс',channel:'Демо',scheduledAt:'',status:'draft'};
 assert.throws(()=>repo.savePost({...post,text:''}));
 assert.throws(()=>repo.savePost({...post,status:'scheduled',scheduledAt:'2020-01-01'}));
 const id=repo.savePost(post);
 repo.savePost({...post,id,text:'Обновлённый анонс',status:'scheduled',scheduledAt:new Date(Date.now()+86400000).toISOString()});
 assert.equal(repo.read().posts.length,1);repo.simulatePublish(id);repo.simulatePublish(id);
 assert.equal(repo.read().posts[0].status,'simulated');assert.equal(repo.read().events.length,1);
 assert.throws(()=>repo.savePost({...post,id}));repo.deletePost(id);assert.equal(repo.read().posts.length,0);
});
test('corrupt and blocked storage errors are visible; reset is namespace-scoped',()=>{
 const {repo,data}=setup();data.set('unrelated','keep');data.set(DEMO_KEY,'broken');assert.throws(()=>repo.read());
 repo.reset();assert.equal(data.get('unrelated'),'keep');assert.equal(repo.read().version,2);
 const broken=createDemoRepository({getItem:()=>null,setItem:()=>{throw new Error('quota');}});
 assert.throws(()=>broken.receive('website','Test','hello'),/quota/);
});
test('failed storage write does not change the in-memory state',()=>{
 const repo=createDemoRepository({getItem:()=>null,setItem:()=>{throw new Error('quota');}});
 assert.throws(()=>repo.receive('website','Test','hello'));
 assert.equal(repo.read().inbox.length,0);
});
