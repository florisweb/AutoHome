import * as crypto from "crypto";
import { FileManager } from './DBManager.js';
let ConfigFileManager = new FileManager("../config.json");
const Config = await ConfigFileManager.getContent(true);

const TokenFileManager = new FileManager('UserManager_tokens.json')

const encryptionMethod = 'AES-256-CBC';
const keyIvSplitter = "&iv=";

const UserManager = new class {
    async getUser(_token) {
        let tokens = await this.#getTokens();
        let info = tokens[_token];
        if (!info) return false;
        let permissions = Config.users[info.userId].permissions;
        return new User(info, Config.users[info.userId].isOwner, permissions);
    }

    async #getTokens() {
        let content = await TokenFileManager.getContent() || {};
        let invalidKeys = Object.keys(content).filter((key) => content[key].validUntil < new Date().getTime());

        for (let key of invalidKeys) 
        {
            delete content[key];
        }
        if (invalidKeys.length) await TokenFileManager.writeContent(content);
        return content;
    }

    async authenticate(_key) {
        if (typeof _key !== 'string') return false;
        // token
        let isKey = _key.split(keyIvSplitter).length === 2;
        if (isKey)
        {
            // Create new token
            let userData = this.#decryptFloriswebKey(_key);
            if (!userData) return false;
            if (!Object.keys(Config.users).find(uId => uId === userData.userId)) return false;

            return await this.#generateUserToken(userData);
        } 
        return await this.#authenticateToken(_key)
    }

    async #authenticateToken(_token) {
        let tokens = await this.#getTokens();
        let hit = tokens[_token]
        if (!hit) return false;
        return hit.validUntil > new Date().getTime();
    }

    async #generateUserToken(_userData) {
        let tokenObject = {
            userName: _userData.userName,
            userId: _userData.userId,
            validUntil: new Date().getTime() + Config.auth.userTokenValidityDuration,
        }

        let tokens = await this.#getTokens();;
        let newToken = this.#generateToken();
        while (tokens[newToken])
        {
            tokens = this.#generateToken();   
        }

        tokens[newToken] = tokenObject;
        await TokenFileManager.writeContent(tokens);
        return newToken;
    }


    #decryptFloriswebKey(_key) {
        try {
            // Decrypt string
            let encryptedString = _key.split(keyIvSplitter)[0];
            let iv              = _key.split(keyIvSplitter)[1];
            let decryptedString = decrypt(encryptedString, encryptionMethod, Config.auth.signInWithFloriswebKey, iv);

            if (!decryptedString) return false;
            return JSON.parse(decryptedString);
        } catch (e) {console.log('error', e); return false;}
    }
    #generateToken() {
        return crypto.randomBytes(32).toString('hex');
    }
}

export default UserManager;


class User {
    name;
    id;
    permissions;
    isOwner = false;

    constructor(_info, _isOwner = false, _permissions) {
        this.name = _info.userName;
        this.id = _info.userId;
        this.isOwner = _isOwner;
        this.permissions = _permissions;
    }
}





var encrypt = function (plain_text, encryptionMethod, secret, iv) {
    var encryptor = crypto.createCipheriv(encryptionMethod, secret, iv);
    return encryptor.update(plain_text, 'utf8', 'base64') + encryptor.final('base64');
};

var decrypt = function (encryptedMessage, encryptionMethod, secret, iv) {
    var decryptor = crypto.createDecipheriv(encryptionMethod, secret, iv);
    return decryptor.update(encryptedMessage, 'base64', 'utf8') + decryptor.final('utf8');
};