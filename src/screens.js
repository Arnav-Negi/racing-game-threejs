function startScreen() {
    const element = document.getElementById("start-menu");
    element.style.height = '100vh';
    element.style.width = '100vw';
    element.style.backgroundColor = 'black';

    element.innerHTML = "START GAME ...<br><br>" +
        "W to accelerate<br>" +
        "S to deccelerate<br>" +
        "A/D to turn left/right<br>" +
        "T to toggle view" +
        "Press space bar to start"
}

function removeStartScreen() {
    const element = document.getElementById("start-menu");
    element.style.height = '0';
    element.style.width = '0';
    element.innerHTML = "";
}

function displayStats(player, time, toNextFuel) {
    const element = document.getElementById("hud");

    const health = Math.floor(player.health);
    const fuel = Math.floor(player.fuel);
    const fuelDist = Math.floor(toNextFuel);
    const timeStr = String(Math.floor(time / 60)) + ":" + String(time - Math.floor(time / 60));
    const mileage = Math.floor(player.fuelUsed <= 5 ? "-" : player.distanceYet / player.fuelUsed);
    const score = Math.floor(player.distanceYet);

    element.innerHTML = `Health: ${health}      Fuel: ${fuel}      Next Fuel: ${fuelDist}<br>Time: ${timeStr}      Lap: ${player.lap}      Score: ${score}      Mileage: ${mileage} `
}

function removeHUD() {
    const element = document.getElementById("hud");
    element.innerHTML = "";
}

function endScreen(result, rank) {
    const element = document.getElementById("start-menu");
    element.style.height = '100vh';
    element.style.width = '100vw';
    element.style.backgroundColor = 'black';

    if (result === 0)
        element.innerHTML = `GAME OVER...<br> Your rank is ${rank} / 4`
    else if (result === 1)
        element.innerHTML = "GAME OVER...<br> You ran out of health."
    else
        element.innerHTML = "GAME OVER...<br> You ran out of fuel."
}

export {startScreen, removeStartScreen, endScreen, displayStats, removeHUD};