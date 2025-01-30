import { atom, selector } from 'recoil';
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

export function getAvatarURL() {
    try {
        const jwt_token = sessionStorage.getItem('jwt_token');
        if (!jwt_token) {
            return null;
        }
        const decodedObj = jwtDecode(jwt_token);
        return decodedObj.avatarURL;
    }
    catch (e) {
        return null;
    }
}

export const userIDState = atom({
    key: 'userIDState',
    default: getUserID(),
});

export const displayNameState = atom({
    key: 'displayNameState',
    default: getDisplayName(),
});

export const avatarURLState = atom({
    key: 'avatarURLState',
    default: getAvatarURL(),
})