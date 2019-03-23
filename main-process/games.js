import { ipcMain } from 'electron'

import { getGameSteamData } from '../lib/games'

async function onLocateGameInstallation(event, game) {
    const installation = await getGameSteamData(game.steamAppId)
    event.sender.send('installation-located', installation)
}

ipcMain.on('locate-installation', onLocateGameInstallation)
