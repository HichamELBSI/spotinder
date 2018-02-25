import {AsyncStorage} from 'react-native';

const fetchData = (endpoint, method) =>
    AsyncStorage.getItem('access_token').then(access_token =>
        fetch(endpoint, {
            method,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${access_token}`,
            },
        }).then(response => {
            if (method === 'GET') {
                const data = response.json();
                return data;
            }
        })
    );

export default fetchData;
