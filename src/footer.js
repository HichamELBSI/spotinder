import React from 'react';
import PropTypes from 'prop-types';
import {Button, Text} from 'native-base';
import {View, AsyncStorage} from 'react-native';
import {NavigationActions} from 'react-navigation';

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

class Footer extends React.Component<{}> {
    static propTypes = {
        stop: PropTypes.func.isRequired,
        navigation: PropTypes.object.isRequired,
    };

    logout = async () => {
        const {navigation} = this.props;
        AsyncStorage.removeItem('access_token').then(() => navigation.dispatch(redirectToLogin));
    };

    setup = () => {
        const {navigation} = this.props;
        this.props.stop();
        navigation.dispatch(redirectToSetup);
    };

    render() {
        return (
            <View style={{flexDirection: 'row', position: 'absolute', bottom: 10}}>
                <Button transparent light onPress={this.setup}>
                    <Text>Paramètre</Text>
                </Button>
                <Button transparent light onPress={this.logout}>
                    <Text>Se déconnecter</Text>
                </Button>
            </View>
        );
    }
}

export default Footer;
