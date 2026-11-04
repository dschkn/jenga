import { useState } from 'react';
import { Button } from '../../components/ui/button';
export default function ResetDemo() {
 const [error,setError]=useState('');
 if (import.meta.env.VITE_DATA_SOURCE === 'supabase') return null;
 return <section className="space-y-3 rounded-lg border bg-card p-4"><h2 className="font-semibold">Пустое тестовое пространство</h2><p className="text-sm text-muted-foreground">Начните новый тест без групп, расписаний, клиентов, сотрудников и записей пяти модулей. Очистка касается только локального демо версии 0.2 в этом браузере. Старая версия и серверные данные не затрагиваются.</p><Button variant="outline" onClick={()=>{if(!window.confirm('Удалить все созданные вами локальные тестовые данные версии 0.2 и начать заново?'))return;try{Object.keys(localStorage).filter(k=>k.startsWith('jenga-demo-v02-')).forEach(k=>localStorage.removeItem(k));window.location.assign('/groups');}catch{setError('Браузер не разрешил очистку локального хранилища');}}}>Начать тест с нуля</Button>{error&&<p role="alert">{error}</p>}</section>;
}
