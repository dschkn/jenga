import { useEffect, useState } from 'react';
import { emptyState, getDemoRepository, subscribeDemo } from '../../../../../packages/platform/demo.mjs';
export function useDemo() {
  const [state, setState] = useState(emptyState);
  const [error, setError] = useState('');
  useEffect(() => {
    const load = () => { try { setState(getDemoRepository().read()); setError(''); } catch { setError('Локальные данные недоступны. Проверьте настройки хранилища браузера.'); } };
    load(); return subscribeDemo(load);
  }, []);
  function act(action: () => void) {
    try { action(); setError(''); return true; } catch (e) { setError(e instanceof Error ? e.message : 'Не удалось сохранить изменения'); return false; }
  }
  return { state, error, act };
}
