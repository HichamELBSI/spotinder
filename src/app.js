import React from 'react';
import {
    Body,
    Title,
    Right,
    Header,
    Container,
    Button,
    DeckSwiper,
    View,
    Icon,
    Toast,
    Left,
    ActionSheet,
    Text,
} from 'native-base';
import {ImageBackground, AsyncStorage, TouchableOpacity, Linking} from 'react-native';
import Expo, {Constants} from 'expo';
import {NavigationActions} from 'react-navigation';

import fetchData from '../fetchData';

const BUTTONS = ['Ouvrir', 'Annuler'];
const DESTRUCTIVE_INDEX = 3;
const CANCEL_INDEX = 4;
const soundObject = new Expo.Audio.Sound();

const redirectToLogin = NavigationActions.reset({
    index: 0,
    key: null,
    actions: [NavigationActions.navigate({routeName: 'Login'})],
});
const redirectToSetup = NavigationActions.reset({
    index: 0,
    key: null,
    actions: [NavigationActions.navigate({routeName: 'Setup'})],
});

class App extends React.Component<{}> {
    state = {
        recommendations: null,
        playPreview: false,
    };

    logout = async () => {
        const {navigation} = this.props;
        AsyncStorage.removeItem('access_token').then(() => navigation.dispatch(redirectToLogin));
    };

    getRecommendations = async () => {
        const config = await AsyncStorage.getItem('config');
        const flatArray = JSON.parse(config).map(genre => genre.value);
        const forParams = flatArray
            .join()
            .split(',')
            .join('%2C');
        fetchData(
            `https://api.spotify.com/v1/recommendations?market=FR&seed_genres=${forParams}`,
            'GET'
        ).then(data => {
            if (data.error && data.error.status === 401)
                AsyncStorage.removeItem('access_token').then(() =>
                    this.props.navigation.dispatch(redirectToLogin)
                );
            this.setState(() => ({recommendations: data}));
        });
    };

    async componentWillMount() {
        const {navigation} = this.props;
        const accessToken = await AsyncStorage.getItem('access_token');
        const config = await AsyncStorage.getItem('config');
        if (accessToken) {
            if (!config) navigation.dispatch(redirectToSetup);
            else this.getRecommendations();
        } else navigation.dispatch(redirectToLogin);
    }

    play = async uri => {
        try {
            await soundObject.unloadAsync();
            await soundObject.loadAsync({uri});
            await soundObject.playAsync();
            this.setState(() => ({playPreview: true}));
            // Your sound is playing!
        } catch (error) {
            Toast.show({
                text: "Impossible de lire l'extrait !",
                position: 'bottom',
                buttonText: 'Okay',
            });
        }
    };

    stop = async () => {
        try {
            await soundObject.unloadAsync();
            if (this.state.playPreview)
                this.setState(() => ({playPreview: false}));
        } catch (error) {
            Toast.show({
                text: "Une erreur s'est produit. Veuillez vous reconnecter à Spotify !",
                position: 'bottom',
                buttonText: 'Okay',
            });
        }
    };

    previewSong = item => {
        if (item.preview_url) {
            if (!this.state.playPreview)
                return (
                    <TouchableOpacity onPress={() => this.play(item.preview_url)}>
                        <Icon name="ios-play" style={{fontSize: 72, color: '#2ecc71'}} />
                    </TouchableOpacity>
                );
            return (
                <TouchableOpacity onPress={() => this.stop()}>
                    <Icon name="ios-square" style={{fontSize: 72, color: '#34495e'}} />
                </TouchableOpacity>
            );
        }
        return null;
    };
    openWithSpotify = uri => {
        ActionSheet.show(
            {
                options: BUTTONS,
                cancelButtonIndex: CANCEL_INDEX,
                destructiveButtonIndex: DESTRUCTIVE_INDEX,
                title: 'Ouvrir sur spotify ?',
            },
            buttonIndex => {
                if (buttonIndex === 0)
                    Linking.openURL(uri)
                        .then(() => {
                            this.stop();
                        })
                        .catch(() =>
                            Toast.show({
                                text:
                                    "Impossible d'ouvrir sur Spotify, assurez vous de l'avoir installé",
                                position: 'bottom',
                                buttonText: 'OK',
                                duration: 3000,
                                type: 'warning',
                            })
                        );
            }
        );
    };

    onSwipeLeft = () => {
        this.stop();
    };
    onSwipeRight = item => {
        fetchData(`https://api.spotify.com/v1/me/tracks?ids=${item.id}`, 'PUT').then(() =>
            this.stop()
        );
    };

    setup = () => {
        const {navigation} = this.props;
        this.stop();
        navigation.dispatch(redirectToSetup);
    };

    render() {
        const {recommendations} = this.state;
        return (
            <Container
                style={{marginTop: Constants.Platform !== 'ios' ? Constants.statusBarHeight : null}}
            >
                <Header>
                    <Left />
                    <Body>
                        <Title>Spotinder</Title>
                    </Body>
                    <Right>
                        <Button transparent onPress={this.setup}>
                            <Icon name="ios-settings" />
                        </Button>
                    </Right>
                </Header>
                <View style={{padding: 10}}>
                    {recommendations &&
                        recommendations.tracks && (
                            <DeckSwiper
                                style={{height: 300}}
                                dataSource={recommendations.tracks}
                                looping={false}
                                onSwipeRight={this.onSwipeRight}
                                onSwipeLeft={this.onSwipeLeft}
                                renderItem={item => (
                                    <ImageBackground
                                        style={{
                                            width: 300,
                                            height: 300,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                        source={{uri: item.album.images[0].url}}
                                    >
                                        {this.previewSong(item)}
                                        <TouchableOpacity
                                            onPress={() => this.openWithSpotify(item.uri)}
                                        >
                                            <Icon
                                                name="ios-share-alt"
                                                style={{fontSize: 72, color: '#2ecc71'}}
                                            />
                                        </TouchableOpacity>
                                    </ImageBackground>
                                )}
                            />
                        )}
                </View>
                <View
                    style={{
                        flex: 1,
                        position: 'absolute',
                        bottom: 10,
                        left: 10,
                        right: 10,
                    }}
                >
                    <View style={{paddingTop: 10}}>
                        <Button full dark onPress={this.logout}>
                            <Text>Se Déconnecter</Text>
                        </Button>
                    </View>
                </View>
            </Container>
        );
    }
}

export default App;
