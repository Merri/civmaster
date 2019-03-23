import path from 'path'

import { parseCiv5Language } from './civ5/parse'

export function getCiv5LanguageSources(pathname, lang = 'en_US') {
    const sources = [
        {
            id: 'Vanilla',
            dependencies: [],
            path: path.join(pathname, 'Assets/Gameplay/XML/NewText/EN_US'),
            name: 'Civilization V'
        },
        {
            id: 'DLC_Mongolia',
            dependencies: [],
            mergeTo: ['Vanilla'],
            path: path.join(pathname, 'Assets/DLC/DLC_01/Gameplay/XML/Text/en_US'),
            name: 'Civilization V: Mongolia DLC'
        },
        {
            id: 'DLC_SpainInca',
            dependencies: [],
            mergeTo: ['Vanilla'],
            path: path.join(pathname, 'Assets/DLC/DLC_02/Gameplay/XML/Text/en_US'),
            name: 'Civilization V: Spain and Inca DLC'
        },
        {
            id: 'DLC_Polynesia',
            dependencies: [],
            mergeTo: ['Vanilla'],
            path: path.join(pathname, 'Assets/DLC/DLC_03/Gameplay/XML/Text/en_US'),
            name: 'Civilization V: Polynesia DLC'
        },
        {
            id: 'DLC_Denmark',
            dependencies: [],
            mergeTo: ['Vanilla'],
            path: path.join(pathname, 'Assets/DLC/DLC_04/Gameplay/XML/Text/en_US'),
            name: 'Civilization V: Denmark DLC'
        },
        {
            id: 'DLC_Korea',
            dependencies: [],
            mergeTo: ['Vanilla'],
            path: path.join(pathname, 'Assets/DLC/DLC_05/Gameplay/XML/Text/en_US'),
            name: 'Civilization V: Korea DLC'
        },
        {
            id: 'DLC_AncientWonders',
            dependencies: [],
            mergeTo: ['Vanilla'],
            path: path.join(pathname, 'Assets/DLC/DLC_06/Gameplay/XML/Text/EN_US'),
            name: 'Civilization V: Ancient Wonders DLC'
        },
        {
            id: 'DLC_Babylon',
            dependencies: [],
            mergeTo: ['Vanilla'],
            path: path.join(pathname, 'Assets/DLC/DLC_Deluxe/Gameplay/XML/Text/en_US'),
            name: 'Civilization V: Babylon DLC'
        },
        {
            id: 'DLC_Upgrade',
            dependencies: [],
            mergeTo: ['Vanilla'],
            path: path.join(pathname, 'Assets/DLC/Shared/Gameplay/XML/Text/EN_US'),
            name: 'Civilization V Upgrade Data 1'
        },
        {
            id: 'Expansion1',
            dependencies: ['Vanilla'],
            path: path.join(pathname, 'Assets/DLC/Expansion/Gameplay/XML/Text/en_US'),
            name: 'Civilization V: Gods & Kings'
        },
        {
            id: 'Expansion1_DLC_Mongolia',
            dependencies: [],
            mergeTo: ['Expansion1'],
            path: path.join(pathname, 'Assets/DLC/Expansion/DLC/DLC_01/Gameplay/XML/Text/en_US'),
            name: 'Civilization V: Mongolia DLC for Gods & Kings'
        },
        {
            id: 'Expansion1_DLC_SpainInca',
            dependencies: [],
            mergeTo: ['Expansion1'],
            path: path.join(pathname, 'Assets/DLC/Expansion/DLC/DLC_02/Gameplay/XML/Text/en_US'),
            name: 'Civilization V: Spain and Inca DLC for Gods & Kings'
        },
        {
            id: 'Expansion1_DLC_Polynesia',
            dependencies: [],
            mergeTo: ['Expansion1'],
            path: path.join(pathname, 'Assets/DLC/Expansion/DLC/DLC_03/Gameplay/XML/Text/en_US'),
            name: 'Civilization V: Polynesia DLC for Gods & Kings'
        },
        {
            id: 'Expansion1_DLC_Denmark',
            dependencies: [],
            mergeTo: ['Expansion1'],
            path: path.join(pathname, 'Assets/DLC/Expansion/DLC/DLC_04/Gameplay/XML/Text/en_US'),
            name: 'Civilization V: Denmark DLC for Gods & Kings'
        },
        {
            id: 'Expansion1_DLC_Korea',
            dependencies: [],
            mergeTo: ['Expansion1'],
            path: path.join(pathname, 'Assets/DLC/Expansion/DLC/DLC_05/Gameplay/XML/Text/en_US'),
            name: 'Civilization V: Korea DLC for Gods & Kings'
        },
        {
            id: 'Expansion1_DLC_Babylon',
            dependencies: [],
            mergeTo: ['Expansion1'],
            path: path.join(pathname, 'Assets/DLC/Expansion/DLC/DLC_Deluxe/Gameplay/XML/Text/en_US'),
            name: 'Civilization V: Babylon DLC for Gods & Kings'
        },
        {
            id: 'Expansion2',
            dependencies: ['Vanilla', 'Expansion1'],
            path: path.join(pathname, 'Assets/DLC/Expansion/Gameplay/XML/Text/en_US'),
            name: 'Civilization V: Brave New World'
        },
        {
            id: 'Expansion2_Complete',
            dependencies: [],
            mergeTo: ['Expansion2'],
            path: path.join(pathname, 'Assets/DLC/DLC_07/Gameplay/XML/Text/EN_US'),
            name: 'Civilization V Complete'
        }
    ]

    sources.forEach(item => {
        // all other languages begin upper case, English varies
        if (lang !== 'en_US') {
            item.path = item.path.slice(0, -5) + lang
        }
    })

    return sources
}

export function parseCiv5LanguageSources(sources, lang) {
    return Promise.all(
        sources.map(item => parseCiv5Language(item.path, lang))
    ).then(items =>
        sources.reduce(function(output, item, index) {
            output[item.id] = items[index]
            return output
        }, {})
    ).catch(error => {
        return {}
    })
}
