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

Using `react-stateful-screens` is a straightforward process. Follow these detailed steps to integrate it into your application:

### Step 1: Define Screen Configuration

Create a configuration object for your screens and transitions. Each screen should have a `render` method and can specify transitions to other screens using the `on` property.

### Step 2: Use the `useStatefulScreens` Hook

Incorporate the `useStatefulScreens` hook into your component, passing the screen configuration as a parameter.

### Step 3: Render the Current Screen

Utilize the `Screen` component returned by the hook to render the current screen. You can also use the `goBack` function to navigate to the previous screen when needed.

Here's an example of these steps in code (further examples are provided in the [Examples](#examples) section):

```javascript
// Step 1: Define screen configuration
const config = {
  // ... (refer to the Examples section for detailed configuration)
};

// Step 2 and 3: Use the hook and render the current screen
const MyComponent = () => {
  const { goBack, Screen } = useStatefulScreens(config);
  return <Screen />;
};
```

## API

### `useStatefulScreens(config)`

A React hook to manage stateful screen transitions effectively.

#### Parameters:

- `config`: An object containing the configuration for the screens and transitions.
  - `initialScreen`: The name of the starting screen.
  - `initialState`: The initial shared state or context for the screens.
  - `screens`: An object defining each screen, its rendering method, and allowed transitions.
  - `onExit`: (optional) A callback executed when reaching a terminal state.

#### Returns:

- `goBack`: A function to navigate back to the previous screen, or `null` if there's no previous screen.
- `goForward`: A function to navigate to the next screen based on the defined transitions.
- `reset`: A function to reset the state machine to its initial state and screen.
- `Screen`: A React component representing the current screen based on the state machine's state.

#### Example:

```javascript
const { goBack, goForward, reset, Screen } = useStatefulScreens(config);

// In the component's render method
return <Screen />;
```

- `initialScreen`: Starting screen of the state machine.
- `initialState`: Initial shared state/context for the screens.
- `screens`: Configuration of screens, transitions, and associated render methods.
- `onExit`: Optional callback executed when the state machine reaches a terminal state.

#### Returns:

- `goBack`: Function to navigate back to the previous screen or `null` if there's no previous screen.
- `Screen`: React component representing the current screen based on the state machine's current state.

## Examples

Explore various examples to understand how to utilize `react-stateful-screens` effectively.

### Basic Example

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
  const { goBack, goForward, reset, Screen } = useStatefulScreens(config);

  const handleLoginSuccess = () => {
    goForward('dashboard');
  };

  const handleLogout = () => {
    reset();
  };

  return <Screen onLoginSuccess={handleLoginSuccess} onLogout={handleLogout} />;
};
```

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
```
