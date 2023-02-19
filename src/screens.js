function startScreen()
{
    const element = document.getElementById("start-menu");
    element.style.height = '100vh';
    element.style.width = '100vw';
    element.style.backgroundColor = 'black';

    element.innerHTML = "START GAME ...<br><br>" +
        "W to accelerate<br>" +
        "S to deccelerate<br>" +
        "A/D to turn left/right<br>"
}

function removeStartScreen()
{
    const element = document.getElementById("start-menu");
    element.style.height = '0';
    element.style.width = '0';
    element.innerHTML = "";
}

function displayStats(player, time, toNextFuel)
{
    const element = document.getElementById("hud");

    const health = Math.floor(player.health);
    const fuel = Math.floor(player.fuel);
    const fuelDist = Math.floor(toNextFuel);
    const timeStr = String(Math.floor(time/60)) + ":" + String(time - Math.floor(time/60));

    element.innerHTML = `Health: ${health} \t Fuel: ${fuel} \t Next Fuel: ${fuelDist}<br>Time: ${timeStr} \t Lap: ${player.lap}`
}

function removeHUD() {
    const element = document.getElementById("hud");
    element.innerHTML = "";
}

function endScreen(result) {
    const element = document.getElementById("start-menu");
    element.style.height = '100vh';
    element.style.width = '100vw';
    element.style.backgroundColor = 'black';

    element.innerHTML = "GAME OVER...<br><br>" + result

}

export {startScreen, removeStartScreen, endScreen, displayStats, removeHUD};