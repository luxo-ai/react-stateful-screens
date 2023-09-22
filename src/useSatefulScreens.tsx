import cloneDeep from 'lodash.clonedeep';
import React, { useCallback, useMemo, useReducer } from 'react';
import type { Stack } from './helpers';
import { stackPeak, stackPop, stackPush } from './helpers';
import type { KeyLike } from './helpers/types';
import type { StateMachineConfig, TerminalKey } from './stateMachine';
import stateMachineFactory, { isTerminalKey } from './stateMachine';

type HookArgs<State, StateKey extends KeyLike, Event extends KeyLike> = {
  initialScreen: StateKey;
  initialState: State;
  screens: StateMachineConfig<
    { render: (props: ScreenProps<Event, State>) => JSX.Element | null },
    StateKey,
    Event
  >;
  onExit?: () => void;
};

export type ScreenProps<Event extends KeyLike, State> = {
  state: State;
  goForward: (event: Event, onProgress?: (state: State) => State) => void;
  goBack: (() => void) | null;
};

type ReducerState<State, StateKey> = {
  history: Stack<StateKey | TerminalKey>;
  context: State;
};

type Action<State, Event extends KeyLike> =
  | { type: 'back' }
  | { type: 'reset' }
  | {
      type: 'forward';
      event: Event;
      ctxUpdater?: (state: State) => State;
    };

const useStatefulScreens = <State, StateKey extends KeyLike, Event extends KeyLike>(
  config: HookArgs<State, StateKey, Event>
) => {
  const stateMachine = useMemo(() => stateMachineFactory(config.screens), [config.screens]);

  const [state, dispatch] = useReducer(
    (state: ReducerState<State, StateKey>, action: Action<State, Event>) => {
      switch (action.type) {
        case 'back':
          const [newStack] = stackPop(state.history);
          return {
            ...state,
            history: newStack,
          };

        case 'reset':
          return {
            context: config.initialState,
            history: [config.initialScreen],
          };

        case 'forward':
          const currentStateKey = stackPeak(state.history);
          if (!currentStateKey) return state;

          // TODO: find way of doing this purely ?
          let nextContext = state.context;
          const onTransition = () => {
            if (action.ctxUpdater) {
              nextContext = action.ctxUpdater(cloneDeep(state.context));
            }
          };

          const nextStateKey = stateMachine(currentStateKey, {
            event: action.event,
            onTransition,
            onExit: config.onExit,
          });
          return {
            history: stackPush(state.history, nextStateKey),
            context: nextContext,
          };

        default:
          return state;
      }
    },
    {
      history: [config.initialScreen],
      context: config.initialState,
    }
  );

  const goBack = useMemo(() => {
    return state.history.length > 1 ? () => dispatch({ type: 'back' }) : null;
  }, [state.history]);

  const goForward = useCallback(
    (event: Event, onProgress?: (state: State) => State) => {
      dispatch({ type: 'forward', event, ctxUpdater: onProgress });
    },
    [dispatch]
  );

  const currentScreenKey = stackPeak(state.history);
  const ScreenComponent =
    currentScreenKey && !isTerminalKey(currentScreenKey) && config.screens[currentScreenKey].render;

  return {
    goBack,
    Screen: () =>
      ScreenComponent ? (
        <ScreenComponent state={state.context} goForward={goForward} goBack={goBack} />
      ) : null,
  };
};

export default useStatefulScreens;
