var Syslog = require('modern-syslog'),
    colors = require('colors');

Syslog.init("node-bom2buy", Syslog.LOG_PID | Syslog.LOG_ODELAY, Syslog.LOG_LOCAL0);

var consoleEnabled = true;

var processArgs = function (args) {
    function mapIter(val) {
        if (val !== null) {
            var result = (Array.isArray(val)) ? val.map(mapIter) : JSON.stringify(val);
            if (typeof(val) == 'object' && val.stack) { //show error stack
                result += '\n' + val.stack;
            }
            return result;
        }
    }

    var res = Array.prototype.map.call(args, mapIter);
    return (res.length === 1) ? res.join(' ') : res.join('');
};

module.exports = {
    logger: {
        info: function () {

            var msg = processArgs(arguments);

            if (consoleEnabled) {
                console.log(new Date().toTimeString() + ' -', 'info'.green, msg);
            }

            Syslog.log(Syslog.LOG_INFO, msg);
        },
        error: function () {

            var msg = processArgs(arguments);
            if (msg && typeof(msg) === 'string') {
                msg = msg.replace(/\\\\n/gi, '\n');
            }

            if (consoleEnabled) {
                console.log(new Date().toTimeString() + ' -', 'error'.red, msg);
            }

            Syslog.log(Syslog.LOG_ERR, msg);
        },
        warning: function () {

            var msg = processArgs(arguments);
            if (msg && typeof(msg) === 'string') {
                msg = msg.replace(/\\\\n/gi, '\n');
            }

            if (consoleEnabled) {
                console.log(new Date().toTimeString() + ' -', 'warning'.blue, msg);
            }

            Syslog.log(Syslog.LOG_WARNING, msg);
        },
        stats: function (msg) {

        },
        disableConsole: function () {

            consoleEnabled = false;
        }
    }
};