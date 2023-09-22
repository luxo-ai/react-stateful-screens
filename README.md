# React Stateful Screens 💫

A custom React hook for managing stateful screen transitions in applications. It abstracts a state machine to handle various screens, transitions, and shared states, making it easier to manage complex navigation logic.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## Installation

```bash
# If using npm
npm install react-stateful-screens

# If using yarn
yarn add react-stateful-screens
```

## Usage

1. Define the configuration for your screens and transitions.
2. Use the `useStatefulScreens` hook in your component.
3. Render the current screen using the `Screen` component returned by the hook.

## API

### `useStatefulScreens(config)`

#### Parameters:

- `config`: Configuration object for the state machine.
  - `initialScreen`: Starting screen of the state machine.
  - `initialState`: Initial shared state/context for the screens.
  - `screens`: Configuration of screens, transitions, and associated render methods.
  - `onExit`: Optional callback executed when the state machine reaches a terminal state.

#### Returns:

- `goBack`: Function to navigate back to the previous screen or `null` if there's no previous screen.
- `Screen`: React component representing the current screen based on the state machine's current state.

## Examples

```javascript
const config = {
  initialScreen: 'welcome',
  initialState: { user: null },
  screens: {
    welcome: {
      render: props => <WelcomeScreen {...props} />,
      on: { login: 'dashboard' },
    },
    dashboard: {
      render: props => <DashboardScreen {...props} />,
      on: {},
    },
  },
};

const MyComponent = () => {
  const { goBack, Screen } = useStatefulScreens(config);
  return <Screen />;
};
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
