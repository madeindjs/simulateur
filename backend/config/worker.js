const config = require("./index");
const Agenda = require('agenda')

const agenda = new Agenda({ db: { address: config.mongo.uri } });

const TEST_TASK = "test";

agenda.define(TEST_TASK, async job => {
    console.log("*** TEST_TASK ***");
});

agenda.on('ready', function () {
    agenda.start();
});


module.exports = {
    agenda,
    TEST_TASK
}