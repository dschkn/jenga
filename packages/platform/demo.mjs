/** Local-only adapter. No network transports, credentials or production writes. */
export const DEMO_KEY = 'jenga-demo-v02-communications';
const CHANGE = 'jenga-demo-communications-change';
export const emptyState = () => ({ version: 2, rooms: [{ id: 'team', title: 'Команда', memberIds: [] }], messages: [], events: [], inbox: [], calls: [], posts: [] });
let sequence = 0;
const id = () => globalThis.crypto?.randomUUID?.() ?? `demo-${Date.now().toString(36)}-${++sequence}-${Math.random().toString(36).slice(2)}`;
const now = () => new Date().toISOString();
export function createDemoRepository(storage, notify = () => {}) {
  let memory = emptyState();
  function read() {
    const raw = storage?.getItem(DEMO_KEY);
    if (!raw) return memory;
    const value = JSON.parse(raw);
    if (value.version !== 2 || !['rooms','messages','events','inbox','calls','posts'].every(k => Array.isArray(value[k]))) throw new Error('Неверный формат локальных данных');
    return value;
  }
  function write(change) {
    const state = JSON.parse(JSON.stringify(read()));
    const result = change(state);
    // Fail visibly instead of falsely claiming that a quota-blocked write was saved.
    storage?.setItem(DEMO_KEY, JSON.stringify(state));
    memory = state;
    notify();
    return result;
  }
  function event(state, title, entityId, kind) {
    state.events.unshift({ id: id(), title, entityId, kind, createdAt: now(), readBy: [] });
  }
  return {
    read,
    reset: () => { storage?.setItem(DEMO_KEY, JSON.stringify(emptyState())); memory = emptyState(); notify(); },
    createRoom(title, memberIds = []) { return write(s => {
      if (!title.trim()) throw new Error('Укажите название чата');
      const room = { id: id(), title: title.trim(), memberIds: [...new Set(memberIds)] };
      s.rooms.push(room); return room.id;
    }); },
    send(roomId, authorId, text) { return write(s => {
      if (!s.rooms.some(r => r.id === roomId)) throw new Error('Чат не найден');
      if (!text.trim()) throw new Error('Введите сообщение');
      s.messages.push({ id: id(), roomId, authorId, text: text.trim(), createdAt: now() });
    }); },
    markRead(eventId, userId) { write(s => {
      const e = s.events.find(e => e.id === eventId);
      if (e && !e.readBy.includes(userId)) e.readBy.push(userId);
    }); },
    groupStarted(group) { write(s => {
      if (s.events.some(e => e.kind === 'group-start' && e.entityId === group.id)) return;
      event(s, `Старт группы «${group.name}»`, group.id, 'group-start');
      s.messages.push({ id: id(), roomId: 'team', authorId: 'system', text: `Стартует группа «${group.name}». Дата: ${group.startDate.slice(0,10)}.`, createdAt: now() });
      s.posts.unshift({ id: id(), groupId: group.id, text: `Открываем группу «${group.name}»! Начало: ${group.startDate.slice(0,10)}.`, channel: 'Канал организации (демо)', status: 'draft', scheduledAt: '', createdAt: now() });
    }); },
    groupCancelled(groupId) { write(s => {
      event(s, 'Старт группы отменён', groupId, 'group-cancel');
      s.events = s.events.filter(e => !(e.kind === 'group-start' && e.entityId === groupId));
      s.posts.forEach(p => { if (p.groupId === groupId && p.status !== 'simulated') { p.status = 'draft'; p.scheduledAt = ''; } });
      s.messages.push({ id: id(), roomId: 'team', authorId: 'system', text: 'Старт группы отменён. Проверьте черновик публикации.', createdAt: now() });
    }); },
    receive(source, name, text) { return write(s => {
      if (!['website','email'].includes(source) || !name.trim() || !text.trim()) throw new Error('Заполните источник, имя и обращение');
      const item = { id: id(), source, name: name.trim(), text: text.trim(), status: 'new', assigneeId: '', createdAt: now() };
      s.inbox.unshift(item); event(s, `Новое обращение: ${item.name}`, item.id, 'inbox'); return item.id;
    }); },
    updateInbox(itemId, status, assigneeId) { write(s => {
      if (!['new','in_progress','closed','spam'].includes(status)) throw new Error('Недопустимый статус');
      const item = s.inbox.find(i => i.id === itemId);
      if (!item) throw new Error('Обращение не найдено');
      Object.assign(item, { status, assigneeId });
    }); },
    logCall(inboxId, direction, outcome, reason, note) { return write(s => {
      const item = s.inbox.find(i => i.id === inboxId);
      if (!item) throw new Error('Выберите обращение из Inbox');
      if (!['incoming','outgoing'].includes(direction) || !['connected','no_answer','refused'].includes(outcome)) throw new Error('Укажите результат звонка');
      if (outcome === 'refused' && !reason.trim()) throw new Error('Укажите причину отказа');
      const call = { id: id(), inboxId, direction, outcome, reason: outcome === 'refused' ? reason : '', note: note.trim(), createdAt: now() };
      s.calls.unshift(call);
      if (outcome === 'connected') item.status = 'in_progress';
      if (outcome === 'refused') item.status = 'closed';
      event(s, `Результат звонка: ${item.name}`, call.id, 'call'); return call.id;
    }); },
    savePost(post) { return write(s => {
      if (!post.text.trim() || post.text.length > 4096) throw new Error('Текст должен содержать от 1 до 4096 символов');
      if (!['draft','scheduled'].includes(post.status)) throw new Error('Недопустимый статус');
      if (post.status === 'scheduled' && !(new Date(post.scheduledAt).getTime() > Date.now())) throw new Error('Выберите время в будущем');
      const existing = s.posts.find(p => p.id === post.id);
      if (existing?.status === 'simulated') throw new Error('Создайте новый черновик');
      const value = { id: existing?.id || id(), groupId: post.groupId || '', text: post.text.trim(), channel: post.channel.trim() || 'Канал организации (демо)', status: post.status, scheduledAt: post.status === 'scheduled' ? post.scheduledAt : '', createdAt: existing?.createdAt || now() };
      if (existing) Object.assign(existing, value); else s.posts.unshift(value);
      return value.id;
    }); },
    simulatePublish(postId) { write(s => {
      const p = s.posts.find(p => p.id === postId);
      if (!p || p.status === 'simulated') return;
      p.status = 'simulated'; event(s, 'Публикация проверена в демо', p.id, 'publish');
    }); },
    deletePost(postId) { write(s => { s.posts = s.posts.filter(p => p.id !== postId); }); },
  };
}
let repository;
export function getDemoRepository() {
  if (!repository) repository = createDemoRepository(typeof window === 'undefined' ? undefined : window.localStorage, () => window.dispatchEvent(new Event(CHANGE)));
  return repository;
}
export function subscribeDemo(listener) {
  const storageListener = e => { if (e.key === DEMO_KEY || e.key === null) listener(); };
  window.addEventListener(CHANGE, listener);
  window.addEventListener('storage', storageListener);
  return () => { window.removeEventListener(CHANGE, listener); window.removeEventListener('storage', storageListener); };
}
