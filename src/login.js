import * as React from 'react';
import {Text, AsyncStorage, Linking, View, Image, TouchableOpacity} from 'react-native';
import {AuthSession} from 'expo';
import {NavigationActions} from 'react-navigation';

const opts = {
    authorization_endpoint: 'https://accounts.spotify.com/authorize',
    response_type: 'token',
    client_id: '87db35a334e846dd9e45c6419f34d79b',
    scopes: 'user-library-modify user-read-private user-read-email user-library-read',
};

const redirectLogin = NavigationActions.reset({
    index: 0,
    key: null,
    actions: [NavigationActions.navigate({routeName: 'App'})],
});

class Login extends React.Component {
    componentDidMount() {
        Linking.addEventListener('url', this.handleOpenURL);
    }
    componentWillUnmount() {
        Linking.removeEventListener('url', this.handleOpenURL);
    }
    handleOpenURL = async ({url}) => {
        const token = url.split('expo-auth-session#access_token=')[1];
        const accessToken = token.substr(0, token.indexOf('&'));
        await AsyncStorage.setItem('access_token', accessToken);
        this.props.navigation.dispatch(redirectLogin);
    };
    login = async () => {
        const redirectUrl = AuthSession.getRedirectUrl();
        const url = `${opts.authorization_endpoint}?response_type=${encodeURIComponent(
            opts.response_type
        )}&client_id=${encodeURIComponent(opts.client_id)}&scope=${encodeURIComponent(
            opts.scopes
        )}&redirect_uri=${encodeURIComponent(redirectUrl)}`;

        AuthSession.startAsync({authUrl: url}).then(async ({params, type}) => {
            if (type !== 'cancel') {
                await AsyncStorage.setItem('access_token', params.access_token);
                if (type === 'success') this.props.navigation.dispatch(redirectLogin);
            }
        });
    };

    render() {
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <TouchableOpacity
                    style={{
                        flexDirection: 'row',
                        backgroundColor: '#262728',
                        padding: 10,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 50,
                    }}
                    onPress={() => this.login()}
                >
                    <Image
                        style={{width: 50, height: 50, marginRight: 10}}
                        source={require('../assets/spotify.png')}
                    />
                    <Text style={{color: 'white', fontWeight: 'bold'}}>Connect with Spotify</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

export default Login;
