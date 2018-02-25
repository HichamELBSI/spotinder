// @flow
import {StackNavigator} from 'react-navigation';

import App from './app';
import Login from './login';
import Setup from './setup';

const Root = StackNavigator(
    {
        App: {screen: App},
        Login: {screen: Login},
        Setup: {screen: Setup},
    },
    {
        initialRouteName: 'App',
        headerMode: 'none',
    }
);

export default Root;
