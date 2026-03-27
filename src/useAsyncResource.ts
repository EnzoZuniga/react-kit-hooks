import { useEffect, useState, useCallback } from 'react';

type IdleState = { status: 'idle' };
type LoadingState = { status: 'loading' };
type SuccessState<T> = { status: 'success'; data: T };
type ErrorState = { status: 'error'; error: Error };

export type AsyncState<T> = IdleState | LoadingState | SuccessState<T> | ErrorState;

export interface AsyncResource<T> {
  state: AsyncState<T>;
  reload: () => void;
}

export function useAsyncResource<T>(
  loader: () => Promise<T>
): AsyncResource<T> {
  const [state, setState] = useState<AsyncState<T>>({ status: 'idle' });

  const load = useCallback(async () => {
    setState({ status: 'loading' });

    try {
      const data = await loader();
      setState({ status: 'success', data });
    } catch (err) {
      setState({
        status: 'error',
        error: err instanceof Error ? err : new Error(String(err)),
      });
    }
  }, [loader]);

  useEffect(() => {
    load();
  }, [load]);

  return { state, reload: load };
}
