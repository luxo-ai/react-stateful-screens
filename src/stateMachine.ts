import type { KeyLike, SafeIntersection } from './helpers/types';

const TERMINAL_KEY = 'TERM';
export type TerminalKey = typeof TERMINAL_KEY;

export const isTerminalKey = (key: KeyLike): key is TerminalKey => {
  return key === TERMINAL_KEY;
};

type TransitionConfig<StateKey extends KeyLike, Event extends KeyLike> = {
  on: {
    [E in Event]?: {
      // | ((ctx) => StateKey | TerminalKey)
      goTo: StateKey | TerminalKey;
    };
  };
};

export type StateMachineConfig<State, StateKey extends KeyLike, Event extends KeyLike> = {
  [K in StateKey]: SafeIntersection<TransitionConfig<StateKey, Event>, State>;
};

type Action<Event> = {
  event: Event;
  // TODO: find a way to make these side-effects pure?
  onExit?: () => void;
  onTransition?: () => void;
};

const stateMachineFactory = <
  State = undefined,
  StateKey extends KeyLike = string,
  Event extends KeyLike = string,
>(
  config: StateMachineConfig<State, StateKey, Event>
) => {
  return (current: StateKey | TerminalKey, action: Action<Event>) => {
    // nothing to be done here if we are at the terminal state
    if (isTerminalKey(current)) {
      return current;
    }

    const transition = config[current].on[action.event];
    // no such transition exists for this event
    if (!transition) {
      return current;
    }

    const nextState = transition.goTo;
    action.onTransition?.();
    if (isTerminalKey(nextState)) {
      action.onExit?.();
    }

    return nextState;
  };
};

export default stateMachineFactory;
