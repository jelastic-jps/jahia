//@auth

var storage = new StorageApi(session);

var userData = storage.getUserData();
var ftpUser = userData.credentials.ftpUser;
var ftpPassword = userData.credentials.ftpPassword;

var envs = prepareEnvs(userData.envs);
var backups = prepareBackups(userData.backups);

jelastic.local.returnResult({
    result: 0,
    settings: {
        fields: [{
            "caption": "Restore from",
            "type": "list",
            "name": "envName",
            "required": true,
            "default": (envs[0] || {}).value || "",
            "values": envs
        }, {
            "type": "string",
            "inputType": "hidden",
            "name": "ftpUser",
            "default": ftpUser
        }, {
            "type": "string",
            "inputType": "hidden",
            "name": "ftpHost",
            "default": storage.getFtpHost()
        }, {
            "type": "string",
            "inputType": "hidden",
            "name": "ftpPassword",
            "default": ftpPassword
        }, {
            "caption": "Backup",
            "type": "list",
            "name": "backupDir",
            "required": true,
            "dependsOn": {
                "envName" : backups
            }
        }, {
            "type" : "spacer"
        }, {
            "caption": "Restore to",
            "type": "envname",
            "name": "newEnvName",
            "required" : true,
            "dependsOn": "targetRegion"
        }, {
            "caption": "Target region",
            "type": "regionlist",
            "name": "targetRegion",
            "selectFirstAvailable": true
        }]
    }
});

function prepareEnvs(values) {
    var aResultValues = [];

    values = values || [];

    for (var i = 0, n = values.length; i < n; i++) {
        aResultValues.push({ caption: values[i], value: values[i] });
    }

    return aResultValues;
}

function prepareBackups(backups) {
    var oResultBackups = {};
    var aValues;

    for (var envName in backups) {
        if (Object.prototype.hasOwnProperty.call(backups, envName)) {
            aValues = [];

            for (var i = 0, n = backups[envName].length; i < n; i++) {
                aValues.push({ caption: backups[envName][i], value: backups[envName][i] });
            }

            oResultBackups[envName] = aValues;
        }
    }

    return oResultBackups;
}

function StorageApi(session, storageAppid, ftpHost) {
    var SOURCE = "remote-storage";

    this.getUserData = function getUserData() {
        return this.eval("GetUserData");
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
