import React from 'react';
import PropTypes from 'prop-types';
import {Toast} from 'native-base';
import {View, AsyncStorage, Text} from 'react-native';
import Expo, {Constants} from 'expo';
import {NavigationActions} from 'react-navigation';
import Swiper from 'react-native-deck-swiper';

import SongItem from './songItem';
import Footer from './footer';
import Header from './header';
import fetchData from '../fetchData';

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
    static propTypes = {
        navigation: PropTypes.object.isRequired,
    };
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
            if (data.error && data.error.status === 401) this.logout();
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

    stop = async () => {
        try {
            await soundObject.unloadAsync();
            if (this.state.playPreview) this.setState(() => ({playPreview: false}));
        } catch (error) {
            Toast.show({
                text: 'Error. Please reconnect to Spotify and retry !',
                position: 'bottom',
                buttonText: 'Okay',
            });
        }
    };

    play = async uri => {
        try {
            await soundObject.unloadAsync();
            await soundObject.loadAsync({uri});
            await soundObject.playAsync();
            this.setState(() => ({playPreview: true}));
            // Your sound is playing!
        } catch (error) {
            Toast.show({
                text: 'Impossible to play the preview !',
                position: 'bottom',
                buttonText: 'Okay',
            });
        }
    };

    onSwipeLeft = () => {
        this.stop();
    };
    onSwipeRight = item => {
        const itemId = this.state.recommendations.tracks[item].id;
        fetchData(`https://api.spotify.com/v1/me/tracks?ids=${itemId}`, 'PUT').then(() =>
            this.stop()
        );
    };

    config = () => {
        const {navigation} = this.props;
        this.stop();
        navigation.dispatch(redirectToSetup);
    };

    render() {
        const {recommendations} = this.state;
        const {navigation} = this.props;
        return (
            <View
                style={{
                    backgroundColor: '#2d3436',
                    flex: 1,
                    alignItems: 'center',
                    marginTop: Constants.Platform !== 'ios' ? Constants.statusBarHeight : null,
                }}
            >
                <Header
                    style={{
                        height: 50,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                    title="Spotinder"
                />
                <Text
                    style={{
                        textAlign: 'center',
                        fontSize: 11,
                        color: 'white',
                    }}
                >
                    Swipe right to add the track to your Spotify library or swipe left to continue
                    to the next track
                </Text>
                {recommendations &&
                    recommendations.tracks && (
                        <Swiper
                            backgroundColor="transparent"
                            cards={recommendations.tracks}
                            onSwipedRight={this.onSwipeRight}
                            onSwipedLeft={this.onSwipeLeft}
                            showSecondCard={recommendations.tracks.length > 1}
                            verticalSwipe={false}
                            cardStyle={{
                                top: 100,
                                left: 30,
                                right: 30,
                                width: 'auto',
                                height: 300,
                            }}
                            onSwipedAll={() => {
                                this.getRecommendations();
                            }}
                            renderCard={item => (
                                <SongItem
                                    stop={this.stop}
                                    play={this.play}
                                    isPlay={this.state.playPreview}
                                    song={item}
                                />
                            )}
                            cardIndex={0}
                        />
                    )}
                <Footer
                    style={{position: 'absolute', bottom: 20}}
                    stop={this.stop}
                    leftButtonLabel="Genres"
                    leftButtonAction={this.config}
                    navigation={navigation}
                />
            </View>
        );
    }
}

export default App;
