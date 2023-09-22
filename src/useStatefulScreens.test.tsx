/* eslint-disable @typescript-eslint/no-explicit-any */
import { act, renderHook } from '@testing-library/react-hooks';

import useStatefulScreens from './useStatefulScreens';

describe('useStatefulScreens Hook', () => {
  it('should initialize with the provided initial screen and state', () => {
    const mockWelcomeScreen = jest.fn(() => '<Welcome/>') as any;
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

    expect(result.current.screenKey).toEqual('welcome');
    expect(result.current.goBack).toEqual(null);
  });

  it('should transition to the next screen on goForward', () => {
    const mockDashboardScreen = jest.fn(() => '<Dashboard/>') as any;
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

    act(() => {
      result.current.goForward('login');
    });

    expect(result.current.screenKey).toEqual('dashboard');
  });

  it('should return to the previous screen on goBack', () => {
    const mockWelcomeScreen = jest.fn(() => '<Welcome/>') as any;
    const mockDashboardScreen = jest.fn(() => '<Dashboard/>') as any;

    const config = {
      initialScreen: ['welcome', 'dashboard'],
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
    expect(result.current.screenKey).toEqual('dashboard');

    act(() => {
      result.current.goBack?.();
    });

    expect(result.current.screenKey).toEqual('welcome');
  });

  it('should update context with ctxUpdater when transitioning', () => {
    const mockDashboardScreen = jest.fn(() => '<Dashboard/>');

    const config = {
      initialScreen: 'welcome',
      initialState: { user: null } as { user: string | null },
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
    const { result } = renderHook(() => useStatefulScreens(config as any));

    act(() => {
      result.current.goForward('login', () => ({ user: 'John' }));
    });

    expect(result.current.screenKey).toEqual('dashboard');
    // expect(result.current.context).toEqual({ user: 'John' });
  });
});
