module.exports = function({ __GLOBAL, api, Users, Threads, Currencies }) {
	const logger = require("../../utils/log.js");
	return async function({ event }) {
		try {
			if (__GLOBAL.settings.autoCreateDB == false) return;
			const { senderID, threadID } = event;
			var settings = {};

			if (!(await Threads.getData(threadID))) {
				const name = (await api.getThreadInfo(threadID)).name;
				await Threads.createData(threadID, { name, settings });
				logger(`New Thread: ${threadID}`, "[ DATABASE ]")
			}
			if (!(await Users.getData(senderID)) ) {
				const name = (await api.getUserInfo(senderID))[senderID].name;
				await Users.createData(senderID, { name });
				logger(`New User: ${senderID}`, "[ DATABASE ]")
				await Currencies.createData(senderID);
				logger(`New Currency: ${senderID}`, "[ DATABASE ]")
			}
		}
		catch(e) {
			console.log(e);
		}
	}
}