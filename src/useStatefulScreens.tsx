import cloneDeep from 'lodash.clonedeep';
import React, { useCallback, useMemo, useReducer } from 'react';
import type { Stack } from './helpers';
import { stackPeak, stackPop, stackPush } from './helpers';
import type { KeyLike } from './helpers/types';
import type { StateMachineConfig, TerminalKey } from './stateMachine';
import stateMachineFactory, { isTerminalKey } from './stateMachine';

export type HookArgs<State, StateKey extends KeyLike, Event extends KeyLike> = {
  initialScreen: StateKey | StateKey[];
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
  reset: () => void;
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

/**
 * `useStatefulScreens` is a custom hook that abstracts a state machine for handling screen transitions in a React application.
 * Given an initial screen, state, and a configuration of screens, it manages screen transitions and provides utility functions to navigate between screens.
 *
 * @template State - The type that represents the shared state/context across screens.
 * @template StateKey - A union of keys representing individual screens/states in the state machine.
 * @template Event - A union of event keys that can trigger transitions between screens.
 *
 * @param {HookArgs<State, StateKey, Event>} config - The configuration object for the state machine.
 * @param {StateKey} config.initialScreen - The starting screen of the state machine.
 * @param {State} config.initialState - The initial shared state/context for the screens.
 * @param {StateMachineConfig<{ render: (props: ScreenProps<Event, State>) => JSX.Element | null }, StateKey, Event>} config.screens - The configuration of screens, transitions, and their associated render methods.
 * @param {(state: State) => void} [config.onExit] - Optional callback executed when the state machine reaches a terminal state.
 *
 * @returns {{
 *   goBack: (() => void) | null,
 *   Screen: () => JSX.Element | null
 * }} An object containing:
 * - `goBack`: A function to navigate back to the previous screen, or `null` if there's no previous screen.
 * - `Screen`: A React component representing the current screen based on the state machine's current state.
 *
 * @example
 * const config = {
 *   initialScreen: 'welcome',
 *   initialState: { user: null },
 *   screens: {
 *     welcome: {
 *       render: (props) => <WelcomeScreen {...props} />,
 *       on: { login: 'dashboard' }
 *     },
 *     dashboard: {
 *       render: (props) => <DashboardScreen {...props} />,
 *       on: {}
 *     }
 *   }
 * };
 *
 * const MyComponent = () => {
 *   const { goBack, Screen } = useStatefulScreens(config);
 *   return <Screen />;
 * };
 */
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
            history: Array.isArray(config.initialScreen)
              ? config.initialScreen
              : [config.initialScreen],
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

          const nextHistory =
            currentStateKey !== nextStateKey
              ? stackPush(state.history, nextStateKey)
              : state.history;

          return {
            history: nextHistory,
            context: nextContext,
          };

        default:
          return state;
      }
    },
    {
      history: Array.isArray(config.initialScreen) ? config.initialScreen : [config.initialScreen],
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

  const reset = useCallback(() => {
    dispatch({ type: 'reset' });
  }, [dispatch]);

  const currentScreenKey = stackPeak(state.history);
  const ScreenComponent =
    currentScreenKey && !isTerminalKey(currentScreenKey) && config.screens[currentScreenKey].render;

  return {
    goForward,
    goBack,
    reset: reset,
    screenKey: currentScreenKey,
    Screen: () =>
      ScreenComponent ? (
        <ScreenComponent
          state={state.context}
          goForward={goForward}
          goBack={goBack}
          reset={reset}
        />
      ) : null,
  };
};

export default useStatefulScreens;
