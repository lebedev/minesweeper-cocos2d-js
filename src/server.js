var server = {
    init: function() {
        if (!localStorage.ServerEmulatorIsSet) {
            localStorage.ServerEmulatorIsSet = true;
            localStorage.Players = JSON.stringify([]);
            localStorage.Updatable = "^(?:sound_enabled|music_enabled|last_rows_value|last_columns_value|last_mines_value)$";
            localStorage.CanBeIncreasedOnly = "^(?:games|wins|mines_defused|total_time_played)$";
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
        cc.log(aParams);
        cc.log(aParams.name);
        if (!aParams || !aParams.action || !aParams.login || !aParams.password) {
            return JSON.stringify({status:"error",error:"Неверные параметры"});
        }
        if (aParams.action === 'login') {
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
        } else if (aParams.name && aParams.value && (
                       aParams.action === 'update_value'   && aParams.name.match(localStorage.Updatable) ||
                       aParams.action === 'increase_value' && aParams.name.match(localStorage.CanBeIncreasedOnly)
                   )) {
            var players = JSON.parse(localStorage.Players);
            for (var i = 0; i < players.length; i++) {
                if (players[i].login === aParams.login) {
                    if (players[i].password === aParams.password) {
                        players[i][aParams.name] = (aParams.action === 'increase_value' ? +players[i][aParams.name] : '' ) + aParams.value;
                        localStorage.Players = JSON.stringify(players);
                        return JSON.stringify({status:"OK", name: aParams.name, value: players[i][aParams.name]});
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
