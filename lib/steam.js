import { findSteamAppById, findSteamAppManifest } from 'find-steam-app'
import get from 'lodash/get'

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

// these values are as they are in Civ5 pathnames and <Language_XX_XX> tags; en_US is the one that varies in paths
const TO_CIV5 = {
    english: 'en_US',
    german: 'DE_DE',
    spanish: 'ES_ES',
    french: 'FR_FR',
    italian: 'IT_IT',
    korean: 'KO_KR',
    polish: 'PL_PL',
    russian: 'RU_RU',
    tchinese: 'ZH_Hant_HK'
}

export function steamLanguageToCiv5(manifest) {
    const steamLanguage = get(manifest, 'UserConfig.language', 'english')
    return get(TO_CIV5, steamLanguage, TO_CIV5.english)
}
