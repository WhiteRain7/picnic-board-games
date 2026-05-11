/**
 * @param {number} value
 * @param {number} min
 * @param {number} avg
 * @param {number} max
 * @returns {string}
 * @private
 */
function _getColour (value, min = 1, max = 5) {
    if (typeof value !== 'number' || value === -1) {
        return '#808080'
    }

    let avg = (min + max) / 2

    if (value < min) { return '#00BB00' }
    if (value > max) { return '#BB0000' }

    let r, g

    if (value <= avg) {
        const ratio = (value - min) / (avg - min)
        r = Math.floor(187 * ratio)
        g = 187
    } else {
        const ratio = (value - avg) / (max - avg)
        r = 187
        g = Math.floor(187 * (1 - ratio))
    }

    const toHex = (num) => num.toString(16).padStart(2, '0')
    return `#${toHex(r)}${toHex(g)}00`
}

const difficulties = {
    [-1]: 'Сложность не указана',
    1: 'Очень простая',
    2: 'Простая',
    3: 'Средняя',
    4: 'Сложная',
    5: 'Особо сложная',
}

/**
 *
 * @param {HTMLTemplateElement} template
 * @param {Game} data
 * @returns {HTMLDetailsElement}
 * @private
 */
function _gameFrom (template, data) {
    const diffClr = _getColour(data.difficulty, 1, 5)
    const timeClr = _getColour(data.time.max, 0, 300)
    // plrsClr
    const ageaClr = data.age >= 18 ? '#BB0000' : data.age >= 16 ? 'currentcolor' : '#CCC'

    const estDiff = difficulties[Math.round(data.difficulty)]
    const estTime = (
        data.time.max === -1 ? '-' :
        data.time.max <=  60 ? '<1 ч' :
        data.time.max <= 120 ? '1-2 ч' :
        data.time.max <= 180 ? '2-3 ч' :
        data.time.max <= 300 ? '3-5 ч' :
            '5+ ч'
    )
    const estPlrs =
        data.players.max === -1 ? '-' :
        data.players.min === data.players.max ? data.players.max.toString() :
            `${data.players.min}-${data.players.max}`
    const estAgea = data.age === -1 ? '-' : `${data.age}+`

    /** @type {HTMLDetailsElement} */
    let node = template.content.cloneNode(true)

    node.querySelector('.game-name').textContent = data.name

    let stats = node.querySelector('.game-stats')
    const diff = stats.querySelector('.difficulty')
    const time = stats.querySelector('.time')
    const plrs = stats.querySelector('.players')
    const agea = stats.querySelector('.age')

    diff.setAttribute('style', `--clr: ${diffClr}`)
    time.setAttribute('style', `--clr: ${timeClr}`)
    // plrs
    agea.setAttribute('style', `--clr: ${ageaClr}`)

    diff.setAttribute('title', estDiff)

    diff.innerText = data.difficulty === -1 ? '-' : Math.round(data.difficulty)
    time.innerText = estTime
    plrs.innerText = estPlrs
    agea.innerText = estAgea

    let desc = node.querySelector('.game-description')
    desc.querySelector('.difficulty').innerText = (
        data.difficulty === -1 ? '-' :
            `${estDiff} (${data.difficulty} по рейтингу BGG)`
    )
    desc.querySelector('.time').innerText = (
        data.time.min === -1 ? '-' :
        data.time.min === data.time.max ?
            `около ${data.time.max} минут` :
            `от ${data.time.min} до ${data.time.max} минут`
    )
    desc.querySelector('.players').innerText = (
        data.players.min === -1 ? '-' :
        data.players.max === 999 ? `от ${data.players.min}` :
        data.players.min === data.players.max ?
            `${data.players.max}` :
            `от ${data.players.min} до ${data.players.max}`
    )
    desc.querySelector('.age').innerText = estAgea
    desc.querySelector('.category').innerText = data.category ?? '<категории пока не указаны>'
    desc.querySelector('.desc').innerText = data.description ?? '<описание пока не заполнено>'

    let owner = desc.querySelector('.owner')
    if (!data.owner || data.owner.toLowerCase() === 'пикник' || data.owner.toLowerCase() === 'неизвестно') {
        owner.remove()
    }
    else {
        owner.innerText = `${data.owner} оставил(а) эту игру нам на время, спасибо!`
    }

    return node
}

/**
 * @param {HTMLElement} el
 * @param {string} eventName
 */
function waveOn (el, eventName = 'pointerdown') {
    el.setAttribute('data-wave-on', '')

    el.addEventListener(eventName, event => {
        if (
            el.hasAttribute('disabled') ||
            el.getAttribute('aria-disabled') === 'true'
        ) return

        const div = document.createElement('div')
        div.classList.add('wave-div')

        let x = event.offsetX
        let y = event.offsetY

        let curRect = el.getBoundingClientRect()
        let iniRect = event.target.getBoundingClientRect()

        x += iniRect.left - curRect.left
        y += iniRect.top - curRect.top

        div.style.left = x + 'px'
        div.style.top = y + 'px'

        el.append(div)

        setTimeout(() => div.remove(), 800)
    })
}

let listResolve = () => {}
let listQueue = new Promise(r => { listResolve = r })

window.addEventListener('load', async function () {
    document.getElementById('req').remove()

    let games = await getData()
    let template = document.getElementById('game-template')
    let parent = document.getElementById('games')

    let list = []
    let elem
    for (let game of games) {
        elem = document.createElement('li')
        elem.className = 'game-li'
        elem.appendChild(_gameFrom(template, game))
        parent.appendChild(elem)
        list.push({ game, elem })
    }
    listResolve(list)

    template.remove()

    setTimeout(() => document.querySelectorAll('.game-summary').forEach(el => waveOn(el)))

    let skip = document.getElementById('skip-to-content')
    skip?.addEventListener('click', event => {
        document.getElementById('games')?.querySelector('summary')?.focus()
    })

    let year = document.getElementById('year')
    if (year) {
        year.innerText += ` - ${(new Date).getFullYear()}`
    }
})