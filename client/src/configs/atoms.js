import { atom } from 'recoil';
import { jwtDecode } from 'jwt-decode';

export function getUserID() {
    try {
        const jwt_token = sessionStorage.getItem('jwt_token');
        if (!jwt_token) {
            return null;
        }
        const decodedObj = jwtDecode(jwt_token);
        return decodedObj.userID;
    }
    catch (e) {
        return null;
    }
}

function getEmail() {
    try {
        const jwt_token = sessionStorage.getItem('jwt_token');
        if (!jwt_token) {
            return null;
        }
        const decodedObj = jwtDecode(jwt_token);
        return decodedObj.email;
    }
    catch (e) {
        return null;
    }
}

export function getDisplayName() {
    try {
        const jwt_token = sessionStorage.getItem('jwt_token');
        if (!jwt_token) {
            return null;
        }
        const decodedObj = jwtDecode(jwt_token);
        return decodedObj.display_name;
    }
    catch (e) {
        return null;
    }
}

export const socketState = atom({
    key: 'socketState',
    default: null,
    dangerouslyAllowMutability: true,
});


export const userIDState = atom({
    key: 'userIDState',
    default: getUserID(),
});

export const emailState = atom({
    key: 'emailState',
    default: getEmail(),
});

export const displayNameState = atom({
    key: 'displayNameState',
    default: getDisplayName(),
});