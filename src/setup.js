import React from 'react';
import PropTypes from 'prop-types';
import {CheckBox, Text} from 'native-base';
import {AsyncStorage, View} from 'react-native';
import {NavigationActions} from 'react-navigation';
import SelectMultiple from 'react-native-select-multiple';
import {Constants} from 'expo';

import Footer from './footer';
import Header from './header';
import fetchData from '../fetchData';

const redirectToLogin = NavigationActions.reset({
    index: 0,
    key: null,
    actions: [NavigationActions.navigate({routeName: 'Login'})],
});

class Setup extends React.Component<{}> {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
    };
    state = {
        genres: [],
        selectedGenres: [],
    };

    getGenres = () => {
        fetchData('https://api.spotify.com/v1/recommendations/available-genre-seeds', 'GET').then(
            data => {
                if (data.error && data.error.status === 401)
                    AsyncStorage.removeItem('access_token').then(() =>
                        this.props.navigation.dispatch(redirectToLogin)
                    );
                this.setState(() => ({genres: data.genres}));
            }
        );
    };

    async componentWillMount() {
        const selectedGenres = await AsyncStorage.getItem('config');
        if (selectedGenres && selectedGenres.length > 0)
            this.setState(() => ({selectedGenres: JSON.parse(selectedGenres)}));
        this.getGenres();
    }

    onSelectionsChange = selectedGenres => {
        this.setState({selectedGenres});
    };

    saveConfig = async () => {
        // await AsyncStorage.removeItem('config');
        const {selectedGenres} = this.state;
        const selectedGenresConfig = await AsyncStorage.getItem('config');
        if (selectedGenres !== selectedGenresConfig)
            await AsyncStorage.setItem('config', JSON.stringify(selectedGenres)).then(() =>
                this.props.navigation.navigate('App')
            );
    };

    renderCustomCheckBox = selected => (
        <View style={{paddingRight: 20}}>
            <CheckBox disabled={this.state.selectedGenres.length < 5} checked={selected} />
        </View>
    );

    render() {
        const {genres} = this.state;
        const {navigation} = this.props;
        const listViewProps = {
            enableEmptySections: true,
        };
        const isNotValid =
            this.state.selectedGenres.length < 1 || this.state.selectedGenres.length > 5;
        return (
            <View
                style={{
                    backgroundColor: '#2d3436',
                    flex: 1,
                    marginTop: Constants.Platform !== 'ios' ? Constants.statusBarHeight : null,
                }}
            >
                <Header
                    style={{
                        height: 50,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                    title="Select your genres"
                />
                <Text
                    style={{
                        textAlign: 'center',
                        fontSize: 11,
                        color: isNotValid ? '#ff7675' : 'white',
                    }}
                >
                    {isNotValid
                        ? 'Please select between 1 and 5 genres !'
                        : `${this.state.selectedGenres.length} genres selected.`}
                </Text>
                <SelectMultiple
                    style={{marginTop: 20, marginBottom: 10}}
                    rowStyle={{backgroundColor: '#2d3436', borderBottomColor: '#34495e'}}
                    renderCheckbox={selected => this.renderCustomCheckBox(selected)}
                    renderLabel={genre => <Text style={{color: 'white'}}>{genre}</Text>}
                    listViewProps={listViewProps}
                    keyExtractor={item => item.label}
                    items={genres}
                    selectedItems={this.state.selectedGenres}
                    onSelectionsChange={this.onSelectionsChange}
                />
                <Footer
                    style={{
                        width: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingBottom: 20,
                    }}
                    leftButtonLabel="Save"
                    disableButtonAction={isNotValid}
                    leftButtonAction={this.saveConfig}
                    navigation={navigation}
                />
            </View>
        );
    }
}

export default Setup;
