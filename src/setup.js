import React from 'react';
import {
    Container,
    Header,
    CheckBox,
    Button,
    Icon,
    Title,
    Body,
    Right,
    Text,
    Left,
} from 'native-base';
import {AsyncStorage, View} from 'react-native';
import {NavigationActions} from 'react-navigation';
import SelectMultiple from 'react-native-select-multiple';
import {Constants} from 'expo';

import fetchData from '../fetchData';

const redirectToLogin = NavigationActions.reset({
    index: 0,
    key: null,
    actions: [NavigationActions.navigate({routeName: 'Login'})],
});

class Setup extends React.Component<{}> {
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
            <CheckBox checked={selected} />
        </View>
    );

    render() {
        const {genres} = this.state;
        const listViewProps = {
            enableEmptySections: true,
        };
        return (
            <Container
                style={{marginTop: Constants.Platform !== 'ios' ? Constants.statusBarHeight : null}}
            >
                <Header>
                    <Left />
                    <Body>
                        <Title>Genres</Title>
                    </Body>
                    <Right>
                        <Button transparent onPress={this.saveConfig}>
                            <Icon name="arrow-forward" />
                        </Button>
                    </Right>
                </Header>
                <SelectMultiple
                    customCheckboxSource={selected => this.renderCustomCheckBox(selected)}
                    renderLabel={genre => <Text>{genre}</Text>}
                    listViewProps={listViewProps}
                    keyExtractor={(item) => item.label}
                    items={genres}
                    selectedItems={this.state.selectedGenres}
                    onSelectionsChange={this.onSelectionsChange}
                />
            </Container>
        );
    }
}

export default Setup;
