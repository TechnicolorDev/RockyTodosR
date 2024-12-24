const csrfStore = new Map();

const saveToken = (key, token, expirationTimeInSeconds) => {
    const expirationTime = Date.now() + expirationTimeInSeconds * 1000;
    csrfStore.set(key, { token, expirationTime });
};

const getStoredToken = (key) => {
    const tokenData = csrfStore.get(key);
    if (tokenData && tokenData.expirationTime > Date.now()) {
        return tokenData.token;
    }
    return null;
};

module.exports = { saveToken, getStoredToken };
