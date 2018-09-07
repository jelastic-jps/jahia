import org.apache.commons.lang3.text.StrSubstitutor;

StrSubstitutor = org.apache.commons.lang3.text.StrSubstitutor;
Transport = com.hivext.api.core.utils.Transport

var config = {};
var storageApplicationId = "";
var storageApplicationIp = '${nodes.storage.first.intIP}';
config.storageEnvName = '${env.envName}';

function replaceText(text, values) {
    return new StrSubstitutor(values, "${", "}").replace(text);
};

function setJahiaSystemProperty(propertyName, propertyValue) {

    var jahiaProperty = db.GetObjectsByCriteria("settings", signature, "Settings", {
        name: propertyName,
        resellerId: 0
    });

    if (jahiaProperty.objects.length === 0) {
        resp = db.CreateObject("settings", signature, "Settings", {
            expert: "EXPERT",
            name: propertyName,
            value: propertyValue
        });
    } else {
        resp = db.SetProperty("settings", signature, "Settings", jahiaProperty.objects[0].id, "value", propertyValue);
    }

    return resp;
}

function createScript(scriptName) {
    var url = "https://raw.githubusercontent.com/SiryjVyiko/jahia/master/scripts/storage/" + scriptName;

    try {
        scriptBody = new Transport().get(url);

        scriptBody = replaceText(scriptBody, config);

        jelastic.dev.scripting.DeleteScript(appid + "/" + storageApplicationId, session, scriptName);

        resp = jelastic.dev.scripting.CreateScript(appid + "/" + storageApplicationId, session, scriptName, "js", scriptBody);

        java.lang.Thread.sleep(1000);

        jelastic.dev.scripting.Build(appid + "/" + storageApplicationId, session, scriptName);
    } catch (ex) {
        resp = {
            error: toJSON(ex)
        };
    }

    return resp;
};

var appsResponse = jelastic.development.applications.GetApps()
if (appsResponse.result != 0) return appsResponse;
var appsList = appsResponse.apps;
var storageApplicationAppId;
for (var i = 0, n = appsList.length; i < n; i++) {
    if (appsList[i].name == "JahiaStorageApp") {

        storageApplicationId = appsList[i].appid;
    }
}

if (storageApplicationId.length === 0) {
    var storageApplication = jelastic.development.applications.GenerateApp("JahiaStorageApp")
    if (storageApplication.result != 0) return storageApplication;
    storageApplicationId = storageApplication.appid;
}

var db = jelastic.data.base;
var tableName = "ftpJahiaUserCredentials";
var typeExists = db.GetType(storageApplicationId, session, tableName);

if (typeExists.result != 0) {
    db.DefineType(storageApplicationId, session, tableName, {
        uid: 'int',
        ftpUser: 'string',
        ftpPassword: 'string'
    }, "uid");
}

var scriptsToInstall = ["GetBackups", "GetEnvs", "GetUserData", "InitFtpCredentials", "lib/JahiaStorage"],
    script;
for (var i = 0, n = scriptsToInstall.length; i < n; i++) {
    createScript(scriptsToInstall[i]);
}

resp = setJahiaSystemProperty("JAHIA_STORAGE_FTP_HOST", storageApplicationIp);
if (resp.result != 0) return resp;
resp = setJahiaSystemProperty("JAHIA_STORAGE_APPID", storageApplicationId);
if (resp.result != 0) return resp;

return {
    result: 0
}
