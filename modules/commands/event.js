module.exports.config = {
	name: "event",
	version: "1.0.0",
	credits: "CatalizCS",
	hasPermssion: 2,
	description: "Quản lý module event",
	commandCategory: "system",
	usages: "event [exec] args",
	cooldowns: 5,
	info: [
		{
			key: 'exec',
			prompt: 'Lựa chọn lệnh cần thực thi',
			type: 'Văn Bản',
			example: 'all'
		}
	]
};

//Reload module
async function loadModule({ nameOfModule, event, api, client, __GLOBAL }) {
	const logger = require("../../utils/log.js")
	const { join, resolve } = require("path");
	const { execSync } = require('child_process');
	try{ client.events.delete(nameOfModule) } catch(e) { return api.sendMessage(`Không thể reload module của bạn, lỗi: ${e}`, event.threadID) };
	delete require.cache[require.resolve(`../events/${nameOfModule}.js`)];
	const command = require(join(__dirname, `../events/${nameOfModule}`));
	try {
		if (client.events.has(command)) throw new Error('Bị trùng!');
		if (!command.config || !command.run) throw new Error(`Sai format!`);
		if (command.config.dependencies) {
			try {
				for (let i of command.config.dependencies) require.resolve(i);
			}
			catch (e) {
				api.sendMessage(`Không tìm thấy gói phụ trợ cho module ${command.config.name}, tiến hành cài đặt: ${command.config.dependencies.join(", ")}!`, event.threadID);
				if (process.env.API_SERVER_EXTERNAL == 'https://api.glitch.com') execSync('pnpm i ' + command.config.dependencies.join(" "));
				else execSync('npm install -s ' + command.config.dependencies.join(" "));
				api.sendMessage(`Đã cài đặt thành công toàn bộ gói phụ trợ cho module ${command.config.name}`, event.threadID);
			}
		}
		client.events.set(command.config.name, command);
		return api.sendMessage(`Loaded evenr ${command.config.name}!`, event.threadID);
	}
	catch (error) {
		return api.sendMessage(`Không thể load module command ${nameOfModule} với lỗi: ${error.message}`, event.threadID);
	}
}

function unloadModule({ nameOfModule, event, api, client, args }) {
	try{
		client.events.delete(nameOfModule);
		return api.sendMessage(`Unloaded command ${nameOfModule}!`, event.threadID);
	}
	catch(e) {
		return api.sendMessage(`Cant unload module command ${nameOfModule} with error: ${error}`, event.threadID);
	}
}

module.exports.run = function({ api, event, args, client, __GLOBAL }) {
	if (args[0] == "all") {
		let commands = client.events.values();
		let infoCommand = "";
		for (const cmd of commands) {
			if (cmd.config.name && cmd.config.version && cmd.config.credits) {
				infoCommand += `\n - ${cmd.config.name} version ${cmd.config.version} by ${cmd.config.credits}`;
			};
		}
		return api.sendMessage("Hiện tại đang có " + client.events.size + " module có thể sử dụng!" + infoCommand, event.threadID, event.messageID);
	}
	else if (args[0] == "load") loadModule({nameOfModule: args[1], event, api, client});
	else if (args[0] == "unload") unloadModule({nameOfModule: args[1], event, api, client, args});
	else return utils.throwError("event", event.threadID, event.messageID);
}