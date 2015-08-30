var mines = {
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

        var i, j, x, y, mineField = [];
        for (i = 0; i < aRows; i++) {
            var row = [];
            for (var j = 0; j < aColumns; j++) {
                row.push(0);
            }
            mineField.push(row);
        }
        for (var minesCount = 0; minesCount < aMaxMines;) {
            x = Math.floor(Math.random()*aColumns);
            y = Math.floor(Math.random()*aRows);
            if ((Math.abs(x - aX) > 1 || Math.abs(y - aY) > 1) && mineField[y][x] !== '*') {
                mineField[y][x] = '*';
                mines.increaseSurroundingNumbers(mineField, x, y);
                minesCount++;
            }
        }
        return mineField;
    },

    increaseSurroundingNumbers: function(aMineField, aX, aY) {
        // 8 surrounding tiles
        var x, y, deltas = [
            [-1, -1],  [0, -1], [+1, -1],
            [-1,  0],/*[aX,aY]*/[+1,  0],
            [-1, +1],  [0, +1], [+1, +1],
        ];
        for (var i = 0; i < 8; i++) {
            x = aX + deltas[i][0];
            y = aY + deltas[i][1];
            if (aMineField[y] !== undefined && aMineField[y][x] !== undefined && aMineField[y][x] !== '*') {
                aMineField[y][x]++;
            }
        }
        return aMineField;
    },

    showMineField: function(aMineField) {
        log = "MineField:";
        for (var i = 0; i < aMineField.length; i++) {
            log += '\n[' + aMineField[i].join('] [') + ']';
        }
        cc.log(log);
    },
};

helper.ProcessTryCatcher(mines);
