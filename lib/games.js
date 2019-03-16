'use strict'

const findSteamApp = require('find-steam-app')

const games = {
    civ4: {
        isLoading: false,
        manifest: null,
        name: 'Sid Meier\'s Civilization IV',
        pathname: '',
        steamAppId: 3900
    },
    civ4war: {
        isLoading: false,
        manifest: null,
        name: 'Sid Meier\'s Civilization IV: Warlords',
        pathname: '',
        steamAppId: 3900
    },
    civ4bts: {
        isLoading: false,
        manifest: null,
        name: 'Sid Meier\'s Civilization IV: Beyond the Sword',
        pathname: '',
        steamAppId: 8800
    },
    civ5: {
        isLoading: false,
        manifest: null,
        name: 'Sid Meier\'s Civilization V',
        pathname: '',
        steamAppId: 8930
    },
    civ6: {
        isLoading: false,
        manifest: null,
        name: 'Sid Meier\'s Civilization VI',
        pathname: '',
        steamAppId: 289070
    },
    civbe: {
        isLoading: false,
        manifest: null,
        name: 'Sid Meier\'s Civilization: Beyond Earth',
        pathname: '',
        steamAppId: 65980
    }
}

async function locateGames() {
    games.civ4.isLoading = true
    try {
        games.civ4.pathname = await findSteamApp.findSteamAppById(games.civ4.steamAppId)
        games.civ4.manifest = await findSteamApp.findSteamAppManifest(games.civ4.steamAppId)
        games.civ4.isLoading = false
    } catch(civ4Err) {
        console.error(civ4Err)
        games.civ4.isLoading = false
    }
    games.civ4war.isLoading = true
    try {
        games.civ4war.pathname = await findSteamApp.findSteamAppById(games.civ4war.steamAppId)
        games.civ4war.manifest = await findSteamApp.findSteamAppManifest(games.civ4war.steamAppId)
        games.civ4war.isLoading = false
    } catch(civ4warErr) {
        games.civ4war.isLoading = false
    }
    games.civ4bts.isLoading = true
    try {
        games.civ4bts.pathname = await findSteamApp.findSteamAppById(games.civ4bts.steamAppId)
        games.civ4bts.manifest = await findSteamApp.findSteamAppManifest(games.civ4bts.steamAppId)
        games.civ4bts.isLoading = false
    } catch(civ4btsErr) {
        games.civ4bts.isLoading = false
    }
    games.civ5.isLoading = true
    try {
        games.civ5.pathname = await findSteamApp.findSteamAppById(games.civ5.steamAppId)
        games.civ5.manifest = await findSteamApp.findSteamAppManifest(games.civ5.steamAppId)
        games.civ5.isLoading = false
    } catch(civ5Err) {
        games.civ5.isLoading = false
    }
    games.civ6.isLoading = true
    try {
        games.civ6.pathname = await findSteamApp.findSteamAppById(games.civ6.steamAppId)
        games.civ6.manifest = await findSteamApp.findSteamAppManifest(games.civ6.steamAppId)
        games.civ6.isLoading = false
    } catch(civ6Err) {
        games.civ6.isLoading = false
    }
    games.civbe.isLoading = true
    try {
        games.civbe.pathname = await findSteamApp.findSteamAppById(games.civbe.steamAppId)
        games.civbe.manifest = await findSteamApp.findSteamAppManifest(games.civbe.steamAppId)
        games.civbe.isLoading = false
    } catch(civbeErr) {
        games.civbe.isLoading = false
    }
}

module.exports = {
    games,
    getGameManifest: key => games[key].manifest,
    getGameName: key => games[key].name,
    getGamePath: key => games[key].pathname,
    isGameLoading: key => games[key].isLoading,
    locateGames
}
