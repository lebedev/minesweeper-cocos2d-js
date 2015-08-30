var res = {
    // sound effects
    login_page_sound: "res/login_page.mp3",
    // music tracks
    menu_music: "res/menu_music.ogg",
    game_music: "res/game_music.mp3",
    // sprites
    background_menu_mine_png: "res/background_menu_mine.png",
    number_1_png: "res/1.png",
    number_2_png: "res/2.png",
    number_3_png: "res/3.png",
    number_4_png: "res/4.png",
    number_5_png: "res/5.png",
    number_6_png: "res/6.png",
    number_7_png: "res/7.png",
    number_8_png: "res/8.png",
    empty_png: "res/empty.png",
    empty_highlighted_png: "res/empty_highlighted.png",
    closed_png: "res/closed.png",
    closed_highlighted_png: "res/closed_highlighted.png",
    closed_flag_png: "res/closed_flag.png",
};

var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
}