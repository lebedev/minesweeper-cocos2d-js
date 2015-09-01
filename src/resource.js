var res = {
    // sound effects
    login_page_sound: "res/login_page.wav",
    game_over_sound: "res/game_over.ogg",
    victory_sound: "res/victory.mp3",
    open_many_tiles_sound: "res/open_many_tiles.wav",
    mine_explode_sound: "res/mine_explode.mp3",
    both_buttons_pressed_mode_fail_sound: "res/both_buttons_pressed_mode_fail.mp3",
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
    number_1x_png: "res/1x.png",
    number_2x_png: "res/2x.png",
    number_3x_png: "res/3x.png",
    number_4x_png: "res/4x.png",
    number_5x_png: "res/5x.png",
    number_6x_png: "res/6x.png",
    number_7x_png: "res/7x.png",
    empty_png: "res/empty.png",
    closed_png: "res/closed.png",
    closed_highlighted_png: "res/closed_highlighted.png",
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
    timer_png: "res/timer.png",
    mines_left_png: "res/mines_left.png",
    sound_png: "res/sound.png",
    sound_disabled_png: "res/sound_disabled.png",
    music_png: "res/music.png",
    music_disabled_png: "res/music_disabled.png"
};

var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
}