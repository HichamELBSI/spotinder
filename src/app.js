import React from 'react';
import PropTypes from 'prop-types';
import {Toast, Text} from 'native-base';
import {View, AsyncStorage} from 'react-native';
import Expo from 'expo';
import {NavigationActions} from 'react-navigation';
import Swiper from 'react-native-deck-swiper';

import SongItem from './songItem';
import Footer from './footer';
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
                text: "Une erreur s'est produit. Veuillez vous reconnecter à Spotify !",
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
                text: "Impossible de lire l'extrait !",
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

    render() {
        const {recommendations} = this.state;
        const {navigation} = this.props;
        return (
            <View
                style={{
                    // flex: 1,
                    alignItems: 'center',
                }}
            >
                {recommendations &&
                    recommendations.tracks && (
                        <Swiper
                            animateOverlayLabelsOpacity
                            animateCardOpacity
                            overlayLabels={{
                                left: {
                                    title: 'Nope',
                                    style: {
                                        label: {
                                            color: '#ff7675',
                                        },
                                        wrapper: {
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        },
                                    },
                                },
                                right: {
                                    title: 'Like',
                                    style: {
                                        label: {
                                            color: '#55efc4',
                                        },
                                        wrapper: {
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        },
                                    },
                                },
                            }}
                            backgroundColor="#2d3436"
                            cards={recommendations.tracks}
                            onSwipedRight={this.onSwipeRight}
                            onSwipedLeft={this.onSwipeLeft}
                            verticalSwipe={false}
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
                <Footer stop={this.stop} navigation={navigation} />
            </View>
        );
    }
}

export default App;
