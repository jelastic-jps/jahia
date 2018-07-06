//@auth
import com.hivext.api.core.utils.Transport;
import com.hivext.api.development.response.ScriptEvalResponse;

var envList = {},
    backupList = {},
    responseJSON = {},
    envDefaultValue, backupDefaultValue;

var storage = new StorageApi(session);

var userData = storage.getUserData();

return userData;

var ftpUser = userData.credentials.ftpUser;
var ftpPassword = userData.credentials.ftpPassword;

envList = prepareOutputDirectoryMap(userData.envDirs, ftpUser);

var backupDirs = storage.getBackups(envList.defaultValue);
if (backupDirs.result !== 0) {
    return backupDirs;
}

backupList = prepareOutputDirectoryMap(backupDirs, envList.defaultValue);

function prepareOutputDirectoryMap(directories, parentDirectory) {
    var DefaultValue = "",
        Keywords = directories.keywords[0],
        File, Name, List = {},
        i, n;

    DefaultValue = Keywords.files[0].name;
    for (i = 0, n = Keywords.files.length; i < n; i += 1) {
        Name = Keywords.files[i].name;
        if (Name != parentDirectory) {
            List[Name] = Name;
        }
    }
    var result = {
        defaultValue: DefaultValue,
        valuesList: List
    }
    return result;
}

var responseJSON = {
    result: 0,
    settings: {
        fields: [{
            "caption": "Restore from",
            "type": "list",
            "name": "envName",
            "default": envList.defaultValue,
            "values": envList.valuesList
        }, {
            "type": "string",
            "inputType": "hidden",
            "name": "ftpUser",
            "default": ftpUser
        }, {
            "type": "string",
            "inputType": "hidden",
            "name": "ftpHost",
            "default": userData.ftpHost
        }, {
            "type": "string",
            "inputType": "hidden",
            "name": "ftpPassword",
            "default": ftpPassword
        }, {
            "caption": "Backup",
            "type": "list",
            "name": "backupDir",
            "default": backupList.defaultValue,
            "values": backupList.valuesList
        }, {
            "caption": "Restore to",
            "type": "string",
            "name": "newEnvName"
        }, {
            "caption": "Target region",
            "type": "regionlist",
            "name": "targetRegion",
            "editable": true,
            "disableInactive": true,
            "selectFirstAvailable": true,
            "message": "unavailable region"
        }]
    }
}

return responseJSON;

function StorageApi(session, storageAppid, ftpHost) {
    var SOURCE = "remote-storage";

    this.getUserData = function getUserData() {
        var userData = this.eval("GetUserData");
        if (userData.result !== 0) return userData;
        userData.ftpHost = this.getFtpHost();
        return userData;
    };

    this.getEnvs = function getEnvs() {
        return this.eval("GetEnvs");
    };

    this.getBackups = function getBackups(envName) {
        return this.eval("GetBackups", {
            envName: envName
        });
    };

    this.initFtpCredentials = function initFtpCredentials() {
        return this.eval("InitFtpCredentials");
    };

    this.getStorageAppid = function () {
        return storageAppid;
    };

    this.getFtpHost = function getFtpHost() {
        return ftpHost;
    };

    this.eval = function (method, params) {
        var resp = jelastic.development.scripting.Eval(appid + "/" + storageAppid, session, method, params || {});
        resp = resp.response || resp;

        if (resp.result !== 0) {
            resp.method = method;
            resp.source = SOURCE;
        }

        return resp;
    };

    this.initSettings = function () {
        var resp = jelastic.development.scripting.Eval(appid + "/settings", session, "GetSettings", {
            settings: "JAHIA_STORAGE_APPID,JAHIA_STORAGE_FTP_HOST"
        });

        resp = resp.response || resp;

        if (resp.result !== 0) {
            throw new Error("Cannot get settings [JAHIA_STORAGE_APPID, JAHIA_STORAGE_FTP_HOST]: " + toJSON(resp));
        }

        if (!storageAppid) {
            storageAppid = resp.settings.JAHIA_STORAGE_APPID;

            if (!storageAppid) {
                throw new Error("JAHIA_STORAGE_APPID setting not found");
            }
        }

        if (!ftpHost) {
            ftpHost = resp.settings.JAHIA_STORAGE_FTP_HOST;

            if (!ftpHost) {
                throw new Error("JAHIA_STORAGE_FTP_HOST setting not found");
            }
        }
    };

    this.initSettings();
}
