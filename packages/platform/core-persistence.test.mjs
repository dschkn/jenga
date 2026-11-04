import test from 'node:test';
import assert from 'node:assert/strict';
import { DataStore } from '../../apps/crm/src/data/store.ts';
test('new groups and schedule survive a reload with Date fields restored',()=>{
 const data=new Map([['unrelated','keep']]);
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:key=>data.get(key),setItem:(key,value)=>data.set(key,value)}});
 const first=new DataStore();first.enableDemoPersistence();
 const start=new Date('2026-11-10T10:00:00Z');
 first.addGroup({id:'group-test',name:'Тест',startDate:start,studentIds:[],lessonIds:[],scheduleIds:[]});
 first.addScheduleItem({id:'lesson-test',groupId:'group-test',start,end:new Date('2026-11-10T11:00:00Z')});
 const next=new DataStore();next.enableDemoPersistence();
 assert.equal(next.getAllGroups().length,1);assert.equal(next.getGroup('group-test').startDate.getTime(),start.getTime());
 assert.equal(next.getScheduleItem('lesson-test').start.getTime(),start.getTime());
 assert.equal(data.get('unrelated'),'keep');
 delete globalThis.localStorage;
});
