var images_folder= "images"
var pruebas = {
    game_name: "Pruebas",
    breadcrumb_name: "Pruebas",
    breadcrumb_level1: breadcrumb_level1,
    game_player_url: "player.html?SCREEN_FULLSCREEN_MODE=1",
    description: "Carga básica del sistemas operativo MSX para pruebas.",
    tricks: "Puedas cargar tus cassetes, disk o rom con los controles desde tu propio ordenador.",
    game_mobile: "La misa funcionalidad desde el movil",
    mobile_pad: "grey_pad.JPG",
}

    //read input parameters
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    let game = urlParams.get('game') 
    if (!game){
        game = ""
    }
    //load game variable
