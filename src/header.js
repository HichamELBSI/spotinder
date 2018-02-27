import React from 'react';
import PropTypes from 'prop-types';
import {View, Text} from 'react-native';

const Header = ({title, style}) => (
    <View style={style}>
        <Text style={{fontSize: 18, color: 'white'}}>{title}</Text>
    </View>
);

Header.propTypes = {
    title: PropTypes.string.isRequired,
    style: PropTypes.object,
};

export default Header;
