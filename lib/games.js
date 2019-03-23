import { findSteamAppById, findSteamAppManifest } from 'find-steam-app'

export async function getGameSteamData(steamAppId) {
    const output = { steamAppId }
    try {
        output.pathname = await findSteamAppById(steamAppId)
        output.manifest = await findSteamAppManifest(steamAppId)
    } catch(error) {
        console.error(error)
    }
    return output
}
