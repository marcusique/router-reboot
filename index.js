const initNightmare = require('nightmare'),
  Xvfb = require('xvfb'),
  keys = require('./config/keys'),
  cron = require('node-cron'),
  xvfb = new Xvfb(['-screen', '0', '1280x1024x24']),
  winston = require('winston'),
  nightmareOptions = {
    gotoTimeout: 10000,
    loadTimeout: 15000,
    show: false,
  };

const logger = winston.createLogger({
  format: winston.format.simple(),
  transports: [
    //new winston.transports.File({ filename: 'router-reboot.log' }),
    new winston.transports.File({ filename: '/var/log/router-reboot.log' }),
  ],
});

/* GET NEW NIGHTMARE INSTANCE ON EVERY RUN */
function getNewNightmare() {
  return initNightmare(nightmareOptions);
}

/* RUN EVERY N HOURS */
cron.schedule('* * * * *', () => {
  let newNightmare = getNewNightmare();

  try {
    xvfb.startSync();
  } catch (e) {
    console.log('Error with XVFB: ' + e);
  }

  logger.info(`[${new Date()}] Router reboot initiated...`);
  console.log(`[${new Date()}] Router reboot initiated...`);

  newNightmare
    .goto(keys.routerURL)
    .wait('input[name=username]')
    .insert('input[name=username]', keys.routerUsername)
    .insert('input[name=password]', keys.routerPwd)
    .click('input[value="Log in"]')
    .wait(2000)
    .evaluate(() => {
      var allButtons = document.getElementsByTagName('a');
      for (var i = 0; i < allButtons.length; i++) {
        if (allButtons[i].innerText == 'Reset') {
          allButtons[i].id = 'resetbutton';
        }
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
      logger.info(`[${new Date()}] Router rebooted successfully.`);
      console.log(`[${new Date()}] Router rebooted successfully.`);
      newNightmare = null;
    })
    .catch((err) => {
      logger.info(`[${new Date()}] An error occured. ${err}`);
      console.log(`[${new Date()}] An error occured. ${err}`);
      newNightmare = null;
    });
});
