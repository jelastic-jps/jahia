//@auth
//@req(baseUrl, cronTime, ftpHost)

var scriptName        = getParam("scriptName", "${env.envName}-jahia-backup"),
    envName           = getParam("envName", "${env.envName}"),
    envAppid          = getParam("envAppid", "${env.appid}"),
    ftpUser           = getParam("ftpUser", ""),
    ftpPassword       = getParam("ftpPassword", ""),
    userId            = getparam("userId", ""),
    maintenanceHost   = getParam("maintenanceHost", "${nodes.proc.master.address}"),
    elasticSearchHost = getParam("elasticSearchHost", "${nodes.es.master.address}"),
    backupCount       = getParam("backupCount", "5");

function run() {
    var BackupManager = use("scripts/backup-manager.js", {
        session           : session,
        baseUrl           : baseUrl,
        uid               : userId,
        cronTime          : cronTime,
        scriptName        : scriptName,
        envName           : envName,
        envAppid          : envAppid,
        maintenanceHost   : maintenanceHost,
        elasticSearchHost : elasticSearchHost,
        ftpHost           : ftpHost,
        ftpUser           : ftpUser,
        ftpPassword       : ftpPassword,
        backupCount       : backupCount
    });

    jelastic.local.ReturnResult(
        BackupManager.install()
    );
}

function use(script, config) {
    var Transport = com.hivext.api.core.utils.Transport,
        url = baseUrl + "/" + script + "?_r=" + Math.random(),   
        body = new Transport().get(url);
    return new (new Function("return " + body)())(config);
}

try {
    run();
} catch (ex) {
    var resp = {
        result : com.hivext.api.Response.ERROR_UNKNOWN,
        error: "Error: " + toJSON(ex)
    };

    jelastic.marketplace.console.WriteLog("ERROR: " + resp);
    jelastic.local.ReturnResult(resp);
}
