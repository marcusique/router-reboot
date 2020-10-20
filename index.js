const initNightmare = require('nightmare'),
    Xvfb = require('xvfb'),
    cron = require('node-cron'),
    xvfb = new Xvfb(),
    winston = require('winston'),
    nightmareOptions = {
        gotoTimeout: 10000,
        loadTimeout: 15000,
        show: false
    };

const logger = winston.createLogger({
    format: winston.format.simple(),
    transports: [
        new winston.transports.File({ filename: 'router-reboot.log' }),
        //new winston.transports.File({ filename: 'var/log/router-reboot.log' })
    ],
});

/* GET NEW NIGHTMARE INSTANCE ON EVERY RUN */
function getNewNightmare() {
    return initNightmare(nightmareOptions)
}

/* RUN EVERY N HOURS */
cron.schedule('* * * * *', () => {
    let newNightmare = getNewNightmare();

    // try {
    //     xvfb.startSync();
    // }
    // catch (e) {
    //     console.log(e);
    // }

    logger.info(`[${new Date}] Router reboot initiated...`)
    //console.log('Rebooting...');

    newNightmare
        .goto('http://192.168.0.1/')
        .wait('input[name=username]')
        .insert('input[name=username]', 'admin')
        .insert('input[name=password]', 'password')
        .click('input[value="Log in"]')
        .wait(2000)
        .evaluate(() => {
            var allButtons = document.getElementsByTagName('a');
            for (var i = 0; i < allButtons.length; i++) {
                if (allButtons[i].innerText == 'Reset') allButtons[i].id = 'resetbutton';
            }
        })
        .click('a[id=resetbutton]')
        .wait('input[value=Reboot]')
        .click('input[value=Reboot]')
        .wait('input[value=Ok]')
        //.click('input[value=Ok]')
        .cookies.clearAll()
        .end()
        .then(() => {
            logger.info(`[${new Date}] Router rebooted successfully.`)
            //console.log('Router rebooted successfully at ' + new Date)
            newNightmare = null;
        })
        .catch(err => {
            logger.info(`[${new Date}] An unknown error occured. ${err}`)
            newNightmare = null;
        })


});

