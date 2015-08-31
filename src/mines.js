var mines = {
    _mineField: null,

    _deltas: [
        [-1, -1],  [0, -1], [+1, -1],
        [-1,  0],/*[x,  y]*/[+1,  0],
        [-1, +1],  [0, +1], [+1, +1],
    ],

    _incrementNumberSurroundingsOf: function(aX, aY) {
        var x, y;
        for (var i = 0; i < 8; i++) {
            x = aX + mines._deltas[i][0];
            y = aY + mines._deltas[i][1];
            if (mines._mineField[y] !== undefined && mines._mineField[y][x] !== undefined && mines._mineField[y][x] !== '*') {
                mines._mineField[y][x]++;
            }
        }
    },

    askValueOf: function(aX, aY) {
        return mines._mineField[aY][aX];
    },

    clearMineField: function() {
        mines._mineField = null;
    },

    createMineField: function(aColumns, aRows, aMaxMines, aX, aY) {
        if (aColumns === undefined || aColumns < 9 || aColumns > 50) {
            aColumns = 9;
        }
        if (aRows === undefined || aRows < 9 || aRows > 50) {
            aRows = 9;
        }
        if (aMaxMines === undefined || aMaxMines < 1 || aMaxMines > aColumns*aRows - 9) {
            aMaxMines = Math.floor(aColumns*aRows/8);
        }
        if (aX === undefined || aX < 0 || aX > aColumns) {
            aX = Math.floor(aColumns/2);
        }
        if (aY === undefined || aY < 0 || aY > aRows) {
            aY = Math.floor(aRows/2);
        }

        var i, j, x, y;
        mines._mineField = [];
        for (i = 0; i < aRows; i++) {
            var row = [];
            for (var j = 0; j < aColumns; j++) {
                row.push(0);
            }
            mines._mineField.push(row);
        }
        for (var minesCount = 0; minesCount < aMaxMines;) {
            x = Math.floor(Math.random()*aColumns);
            y = Math.floor(Math.random()*aRows);
            if ((Math.abs(x - aX) > 1 || Math.abs(y - aY) > 1) && mines._mineField[y][x] !== '*') {
                mines._mineField[y][x] = '*';
                mines._incrementNumberSurroundingsOf(x, y);
                minesCount++;
            }
        }
    },

    showMineField: function() {
        log = "MineField:";
        for (var i = 0; i < mines._mineField.length; i++) {
            log += '\n[' + mines._mineField[i].join('] [') + ']';
        }
        cc.log(log);
    },
};

helper.ProcessTryCatcher(mines);
