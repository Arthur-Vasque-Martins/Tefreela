import { useState, useEffect, useCallback } from 'react';

// Carrega dados da API ao abrir a tela. Retorna { data, loading, error, reload }.
export default function useLoad(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const load = useCallback(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: '' }));
    fn().then(
      (data) => alive && setState({ data, loading: false, error: '' }),
      (e) => alive && setState({ data: null, loading: false, error: e.message })
    );
    return () => { alive = false; };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(load, [load]);
  return { ...state, reload: load };
}
