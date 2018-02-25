// @flow
import Expo from 'expo';
import React from 'react';
import {Root} from 'native-base';

import RootApp from './src/root';

class App extends React.Component<{}> {
    state = {
        fontLoaded: false,
    };
    async componentWillMount() {
        Expo.ScreenOrientation.allow(Expo.ScreenOrientation.Orientation.PORTRAIT_UP);
        await Expo.Font.loadAsync({
            Roboto: require('native-base/Fonts/Roboto.ttf'),
            Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'),
        });
        this.setState({fontLoaded: true});
    }

    render() {
        return (
            this.state.fontLoaded && (
                <Root>
                    <RootApp />
                </Root>
            )
        );
    }
}

export default App;
