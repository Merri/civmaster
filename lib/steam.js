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

export function steamLanguageToCiv5(manifest) {
    const language = (manifest && manifest.UserConfig && manifest.UserConfig.language) || 'english'

    switch (language) {
        case 'german':
            return 'DE_DE'
        case 'spanish':
            return 'ES_ES'
        case 'french':
            return 'FR_FR'
        case 'italian':
            return 'IT_IT'
        case 'japanese':
            return 'JA_JP'
        case 'korean':
            return 'KO_KR'
        case 'polish':
            return 'PL_PL'
        case 'russian':
            return 'RU_RU'
        case 'tchinese':
            return 'ZH_Hant_HK'
        default:
            return 'en_US'
    }
}
