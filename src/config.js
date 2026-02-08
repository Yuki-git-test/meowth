const config = {
    clientId: '1333515335999164518',
    token: process.env.DISCORD_TOKEN,
    broadcast: {
        enabled: true,
        channel: '1351928008935473193'
    },
    ping: {
        lastCall: '1352573240047833108'
    },
    tradeChannels: {
        first: '1342073980688928829',
        last: '1342074030894743602'
    },
    auction: {
        auctioneerRoleId: '1331915551802654750',
        rollbackLimit: 6,
        lastCallDurationExtend: {
            minimumDurationLeft: 5,
            extendDuration: 2,
        },
        bidIncrement: {
            'legendary': 10000,
            'mega': 10000,
            'shiny mega': 20000,
            'shiny': 20000,
            'golden': 100000,
            'form': 100000,
            'shiny form': 100000,
            'gmax': 100000,
            'shiny gmax': 100000,
            'bulk': 20000,
            'exclusive': 100000
        },
        rarityEmbedColor: {
            'legendary': '#800080',
            'mega': '#008000',
            'shiny mega': '#FFC0CB',
            'shiny': '#FFC0CB',
            'golden': '#FFD700',
            'form': '#008000',
            'shiny form': '#FFC0CB',
            'gmax': '#008000',
            'shiny gmax': '#FFC0CB',
            'bulk': '#0000FF'
        },
        rarityEmoji: {
            'legendary': '<:legendary:1330794025917218868>',
            'mega': '<:mega:1330794030761771050>',
            'shiny mega': '<:shinymega:1330794033496326154>',
            'shiny': '<:shiny:1330794028308107359>',
            'golden': '<:golden:1330794043319517285>',
            'form': '<:form:1353606329385619456>',
            'shiny form': '<:form:1353606329385619456>',
            'common': '<:common:1330794017562169458>',
            'uncommon': '<:uncommon:1330794019516710932>',
            'rare': '<:rare:1330794021580181586>',
            'superrare': '<:superrare:1330794023966736454>',
            'gmax': '<:gigantamax:1330794036197457983>',
            'shiny gmax': '<:shinygigantamax:1330794039183937587>',
            'bulk': '<:prb:1343861424350298122>'
        }
    }
};

export { config };
