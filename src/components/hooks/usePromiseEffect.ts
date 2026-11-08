import * as React from 'react';

// TODO: Add more functionality to this.
// Copied from: https://levelup.gitconnected.com/react-hooks-gotchas-setstate-in-async-effects-d2fd84b02305

export enum RequestStatus {
  Idle = 'IDLE',
  Pending = 'PENDING',
  Fulfilled = 'FULFILLED',
  Rejected = 'REJECTED',
}

type PromiseState<T> =
  | { status: RequestStatus.Idle | RequestStatus.Pending; value: null; error: null }
  | { status: RequestStatus.Fulfilled; value: T; error: null }
  | { status: RequestStatus.Rejected; value: null; error: Error };

export function usePromiseEffect<T>(effect: () => Promise<T>, deps: React.DependencyList) {
  const [state, setState] = React.useState<PromiseState<T>>({
    status: RequestStatus.Idle,
    value: null,
    error: null,
  });

  React.useEffect(() => {
    effect()
      .then((value) => setState({ status: RequestStatus.Fulfilled, value, error: null }))
      .catch((error) => setState({ status: RequestStatus.Rejected, value: null, error }));
  }, deps);

  // chose the shape you prefer for the return type,
  // here are some examples:
  // return [state.value, state.status === 'pending', state.error]
  // return [state.value, state.status, state.error]

  return state;
}
