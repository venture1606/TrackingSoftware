import { jwtDecode } from "jwt-decode";

export const isTokenValid = (token) => {
    if (!token) return false;

    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        return decoded.exp > currentTime; // true if token not expired
    } catch (error) {
        return false; // invalid token
    }
};
