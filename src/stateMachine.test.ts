/* eslint-disable @typescript-eslint/no-explicit-any */
import stateMachineFactory, { isTerminalKey, TERMINAL_KEY } from './stateMachine';

describe('stateMachineFactory', () => {
  const testConfig = {
    start: {
      on: {
        goMid: { goTo: 'middle' },
        goEnd: { goTo: 'end' },
        goTerminal: { goTo: TERMINAL_KEY },
      },
    },
    middle: {
      on: {
        goEnd: { goTo: 'end' },
        goTerminal: { goTo: TERMINAL_KEY },
      },
    },
    end: {
      on: {
        goTerminal: { goTo: TERMINAL_KEY },
      },
    },
  };

  it('should transition to the specified state', () => {
    const machine = stateMachineFactory(testConfig);
    expect(machine('start', { event: 'goMid' })).toBe('middle');
  });

  it('should not transition if event does not exist', () => {
    const machine = stateMachineFactory(testConfig);
    expect(machine('start', { event: 'nonExistent' as any })).toBe('start');
  });

  it('should transition to the terminal key', () => {
    const machine = stateMachineFactory(testConfig);
    expect(machine('middle', { event: 'goTerminal' })).toBe(TERMINAL_KEY);
  });

  it('should stay in the terminal state if already there', () => {
    const machine = stateMachineFactory(testConfig);
    expect(machine(TERMINAL_KEY, { event: 'goMid' })).toBe(TERMINAL_KEY);
  });

  it('should invoke onTransition if provided', () => {
    const onTransition = jest.fn();
    const machine = stateMachineFactory(testConfig);
    machine('start', { event: 'goMid', onTransition });
    expect(onTransition).toHaveBeenCalled();
  });

  it('should invoke onExit if transitioning to terminal state', () => {
    const onExit = jest.fn();
    const machine = stateMachineFactory(testConfig);
    machine('start', { event: 'goTerminal', onExit });
    expect(onExit).toHaveBeenCalled();
  });

  it('should not invoke onExit if not transitioning to terminal state', () => {
    const onExit = jest.fn();
    const machine = stateMachineFactory(testConfig);
    machine('start', { event: 'goMid', onExit });
    expect(onExit).not.toHaveBeenCalled();
  });
});

describe('isTerminalKey', () => {
  it('should identify terminal key', () => {
    expect(isTerminalKey(TERMINAL_KEY)).toBe(true);
  });

  it('should identify non-terminal key', () => {
    expect(isTerminalKey('start')).toBe(false);
  });
});
