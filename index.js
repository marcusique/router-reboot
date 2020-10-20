const Nightmare = require('nightmare'),
    nightmare = Nightmare({ show: true }),
    Xvfb = require('xvfb'),
    xvfb = new Xvfb(),
    winston = require('winston'),
    now = new Date();

try {
    xvfb.startSync();
}
catch (e) {
    console.log(e);
}

const logger = winston.createLogger({
    format: winston.format.simple(),
    transports: [
        new winston.transports.File({ filename: 'router-reboot.log' }),
        //new winston.transports.File({ filename: 'var/log/router-reboot.log' })
    ],
});

nightmare
    .goto('http://192.168.0.1/')
    .wait('input[name=username]')
    .insert('input[name=username]', 'admin')
    .insert('input[name=password]', 'passwordhere!')
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
    .end()
    .then(() => {
        logger.info(`[${now}] Router restarted successfully.`)
        console.log('Router restarted successfully at ' + now)
    })
    .catch(err => {
        console.error(`[${now}] An unknown error occured. ${err}`)
    })