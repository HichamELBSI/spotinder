import React from 'react';
import PropTypes from 'prop-types';
import {Icon, Toast, ActionSheet} from 'native-base';
import {ImageBackground, TouchableOpacity, Linking} from 'react-native';

const BUTTONS = ['Ouvrir', 'Annuler'];
const DESTRUCTIVE_INDEX = 3;
const CANCEL_INDEX = 4;

class SongItem extends React.Component<> {
    static propTypes = {
        song: PropTypes.object.isRequired,
        stop: PropTypes.func.isRequired,
        play: PropTypes.func.isRequired,
        isPlay: PropTypes.bool,
    };

    previewSong = song => {
        const {isPlay, play, stop} = this.props;
        if (song.preview_url) {
            if (!isPlay)
                return (
                    <TouchableOpacity onPress={() => play(song.preview_url)}>
                        <Icon name="ios-play" style={{fontSize: 72, color: '#2ecc71'}} />
                    </TouchableOpacity>
                );
            return (
                <TouchableOpacity onPress={() => stop()}>
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
                            this.props.stop();
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

    render() {
        const {song} = this.props;
        return (
            <ImageBackground
                style={{
                    height: 300,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
                source={{uri: song.album.images[0].url}}
            >
                {this.previewSong(song)}
                <TouchableOpacity onPress={() => this.openWithSpotify(song.uri)}>
                    <Icon name="ios-share-alt" style={{fontSize: 72, color: '#2ecc71'}} />
                </TouchableOpacity>
            </ImageBackground>
        );
    }
}

export default SongItem;
