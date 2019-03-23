import { ipcMain } from 'electron'

import { getCiv5LanguageSources, parseCiv5LanguageSources } from '../lib/sources'
import { getGameSteamData, steamLanguageToCiv5 } from '../lib/steam'
import { parseCiv5Language } from '../lib/civ5/parse'

ipcMain.on('locate-installation', async function onLocateGameInstallation(event, game) {
    const installation = await getGameSteamData(game.steamAppId)
    event.sender.send('installation-located', installation)
})

ipcMain.on('index-civ5', async function onIndexCiv5(event, game) {
    const lang = steamLanguageToCiv5(game.manifest)
    const sources = getCiv5LanguageSources(game.pathname, lang)
    event.sender.send('civ5-sources', sources)
    const result = await parseCiv5LanguageSources(sources, lang)
    event.sender.send('civ5-indexed', result)
})
