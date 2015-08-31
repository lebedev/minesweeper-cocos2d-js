var sprite_size = "big";

var res = {
    // sound effects
    login_page_sound: "res/login_page.mp3",
    game_over_sound: "res/game_over.ogg",
    victory_sound: "res/victory.mp3",
    open_many_tiles_sound: "res/open_many_tiles.mp3",
    // music tracks
    menu_music: "res/menu_music.ogg",
    ingame_music: "res/ingame_music.mp3",
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
    closed_png: "res/closed_" + sprite_size + ".png",
    closed_highlighted_png: "res/closed_highlighted_" + sprite_size + ".png",
    closed_flag_png: "res/closed_flag.png",
    closed_flag_highlighted_png: "res/closed_flag_highlighted.png",
    mine_exploded_png: "res/mine_exploded.png",
    mine_png: "res/mine.png",
    mine_defused_png: "res/mine_defused.png",
    closed_flag_wrong_png: "res/closed_flag_wrong.png",
    button_normal_png: "res/button_normal.png",
    button_highlighted_png: "res/button_highlighted.png",
    button_disabled_png: "res/button_disabled.png",
    editbox_png: "res/editbox.png",
};

var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
}