var res = {
    // sound effects
    login_page_sound: "res/login_page.mp3",
    // music tracks
    menu_music: "res/menu_music.ogg",
    game_music: "res/game_music.mp3",
    // sprites
    background_menu_mine_png: "res/background_menu_mine.png",
    one: "res/1.png",
    onex: "res/1x.png",
    two: "res/2.png",
    twox: "res/2x.png",
    down_png: "res/down.png",
    down_l_png: "res/down_l.png",
    up_png: "res/up.png",
    up_l_png: "res/up_l.png",
};

var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
}