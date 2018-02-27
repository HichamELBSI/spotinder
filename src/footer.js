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

class Footer extends React.Component<{}> {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        leftButtonLabel: PropTypes.string.isRequired,
        leftButtonAction: PropTypes.func.isRequired,
        style: PropTypes.object,
        disableButtonAction: PropTypes.bool,
    };

    logout = async () => {
        const {navigation} = this.props;
        AsyncStorage.removeItem('access_token').then(() => navigation.dispatch(redirectToLogin));
    };

    render() {
        const {leftButtonAction, leftButtonLabel, style, disableButtonAction} = this.props;
        return (
            <View style={{flexDirection: 'row', ...style}}>
                <Button disabled={disableButtonAction} transparent light onPress={leftButtonAction}>
                    <Text
                        style={{color: disableButtonAction ? 'rgba(255,255,255,0.3)' : '#F4F4F4'}}
                    >
                        {leftButtonLabel}
                    </Text>
                </Button>
                <Button transparent light onPress={this.logout}>
                    <Text>Logout</Text>
                </Button>
            </View>
        );
    }
}

export default Footer;
