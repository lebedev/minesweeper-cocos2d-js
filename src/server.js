var server = {
	init: function() {
		if (!localStorage.ServerEmulatorIsSet) {
			localStorage.ServerEmulatorIsSet = true;
			localStorage.Players = JSON.stringify([]);
		}
	},
	_createNewPlayer: function(aLogin, aPassword) {
		var player = {
			login: aLogin,
			password: aPassword,
			games: 0,
			wins: 0,
			mines_defused: 0,
			total_time_played: 0,
			sound_enabled: true,
			music_enabled: true,
			last_rows_value: 16,
			last_columns_value: 16,
			last_mines_value: 40
		};
		var Players = JSON.parse(localStorage.Players);
		Players.push(player);
		localStorage.Players = JSON.stringify(Players);
		return JSON.stringify({status: "OK", player: player});
	},
	sendAction: function(aParams) {
		if (!aParams || !aParams.action) {
			return JSON.stringify({status:"error",error:"Неверные параметры"});
		}
		if (aParams.action === 'login') {
			if (!aParams.login || !aParams.password) {
				return JSON.stringify({status:"error",error:"Неверные параметры"});
			}
			var players = JSON.parse(localStorage.Players);
			for (var i = 0; i < players.length; i++) {
				if (players[i].login === aParams.login) {
					if (players[i].password === aParams.password) {
						return JSON.stringify({status:"OK", player: players[i]});
					} else {
						return JSON.stringify({status:"error",error:"Неверный пароль"});
					}
				}
			}
			return server._createNewPlayer(aParams.login, aParams.password);
		} else if (aParams.action === 'update_value') {
			if (!aParams.login || !aParams.password || !aParams.name || !aParams.value) {
				return JSON.stringify({status:"error",error:"Неверные параметры"});
			}
			var players = JSON.parse(localStorage.Players);
			for (var i = 0; i < players.length; i++) {
				if (players[i].login === aParams.login) {
					if (players[i].password === aParams.password) {
						if (players[i][aParams.name]) {
							players[i][aParams.name] = aParams.value;
							localStorage.Players = JSON.stringify(players);
							return JSON.stringify({status:"OK", name: aParams.name, value: aParams.value});
						} else {
							return JSON.stringify({status:"error",error:"Неверные параметры"});
						}
					} else {
						return JSON.stringify({status:"error",error:"Неверный пароль"});
					}
				}
			}
		}
		return JSON.stringify({status:"error",error:"Неверные параметры"});
	}
};

helper.ProcessTryCatcher(server);

server.init();
