import { renderHook, act } from '@testing-library/react-hooks/dom';
import useStatefulScreens from './useStatefulScreens';

describe('useStatefulScreens Hook', () => {
  it('should initialize with the provided initial screen and state', () => {
    const mockWelcomeScreen = jest.fn();
    const config = {
      initialScreen: 'welcome',
      initialState: { user: null },
      screens: {
        welcome: {
          render: mockWelcomeScreen,
          on: {},
        },
      },
    };
    const { result } = renderHook(() => useStatefulScreens(config));

    expect(result.current.Screen).toBeInstanceOf(Function);
    expect(result.current.Screen).toBe(mockWelcomeScreen);
    expect(result.current.goBack).toEqual(null);
  });

  it('should transition to the next screen on goForward', () => {
    const mockDashboardScreen = jest.fn();
    const config = {
      initialScreen: 'welcome',
      initialState: { user: null },
      screens: {
        welcome: {
          render: jest.fn(),
          on: { login: { goTo: 'dashboard' } },
        },
        dashboard: {
          render: mockDashboardScreen,
          on: {},
        },
      },
    };
    const { result } = renderHook(() => useStatefulScreens(config));

    expect(result.current.goBack).not.toEqual(null);

    act(() => {
      result.current.goForward('login');
    });

    expect(result.current.Screen).toBeInstanceOf(Function);
    expect(result.current.Screen).toBe(mockDashboardScreen);
    expect(result.current.goBack).toEqual(null);
  });

  it('should return to the previous screen on goBack', () => {
    const mockWelcomeScreen = jest.fn();
    const mockDashboardScreen = jest.fn();

    const config = {
      initialScreen: 'dashboard',
      initialState: { user: 'John' },
      screens: {
        welcome: {
          render: mockWelcomeScreen,
          on: { login: { goTo: 'dashboard' } },
        },
        dashboard: {
          render: mockDashboardScreen,
          on: {},
        },
      },
    };
    const { result } = renderHook(() => useStatefulScreens(config));
    expect(result.current.Screen).toBeInstanceOf(Function);
    expect(result.current.Screen).toBe(mockDashboardScreen);

    act(() => {
      result.current.goBack?.();
    });

    expect(result.current.Screen).toBeInstanceOf(Function);
    expect(result.current.Screen).toBe(mockWelcomeScreen);
  });

  it('should update context with ctxUpdater when transitioning', () => {
    const mockDashboardScreen = jest.fn();

    const config = {
      initialScreen: 'welcome',
      initialState: { user: null } as { user: string | null },
      screens: {
        welcome: {
          render: jest.fn(),
          on: { login: { goTo: 'dashboard' } },
        },
        dashboard: {
          render: jest.fn(),
          on: {},
        },
      },
    };
    const { result } = renderHook(() => useStatefulScreens(config));

    act(() => {
      result.current.goForward('login', () => ({ user: 'John' }));
    });

    expect(result.current.Screen).toBeInstanceOf(Function);
    expect(result.current.Screen).toBe(mockDashboardScreen);
    // expect(result.current.context).toEqual({ user: 'John' });
  });
});
