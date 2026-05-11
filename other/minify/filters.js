const _adapts = {
    '&': ' и ',
    'ё': 'е',
}
const _adaptRegExp = RegExp(`[${Object.keys(_adapts).join('')}]`, 'g')

/**
 * @param {string} txt
 * @returns {string}
 */
function _adapt (txt) {
    return txt
        .toLowerCase()
        .replaceAll(_adaptRegExp, k => _adapts[k])
        .replaceAll(/[^a-zа-я0-9 ]/g, '')
}

/**
 * @param {Array<{ game: Game, adapted: Record<string, string|number>, elem: HTMLDetailsElement }>} list
 * @param {Record<string, *>} filters
 */
function applyFilters (list, filters) {
    let found = 0
    let nameEl

    for (let entry of list) {
        nameEl = entry.elem.querySelector('.game-name')
        let visible = true

        nameEl.innerText = entry.game.name
        if (filters.name.length) {
            nameEl.innerHTML = entry.adapted.name.replaceAll(
                RegExp(filters.name.filter(Boolean).join('|'), 'g'),
                word => `<mark>${word}</mark>`
            )

            for (let word of filters.name) {
                if (!entry.adapted.name.includes(word)) {
                    visible = false
                    break
                }
            }
        }

        if (visible && filters.difficulty.size) {
            if (!filters.difficulty.has(entry.adapted.difficulty)) {
                visible = false
            }
        }

        if (visible && filters.time) {
            if (entry.adapted.time > filters.time) {
                visible = false
            }
        }

        if (visible && filters.players) {
            if (filters.players >= 11) {
                if (entry.game.players.max < 11) {
                    visible = false
                }
            }
            else if (!(entry.game.players.min <= filters.players && filters.players <= entry.game.players.max)) {
                visible = false
            }
        }

        if (visible && filters.age) {
            if (entry.game.age > filters.age) {
                visible = false
            }
        }

        entry.elem.classList.toggle('invisible', !visible)
        entry.elem.firstElementChild.firstElementChild.tabIndex = visible ? 0 : -1
        found += visible ? 1 : 0
    }
    let counter = document.getElementById('search-count')
    let filterButton = document.getElementById('filter-button')
    if (found === list.length) {
        counter.textContent = `Всего ${list.length} игр`
        counter.ariaDescription = (
            `Без фильтров,` +
            counter.ariaDescription.split(',')[1]
        )
        counter.parentElement.classList.remove('filtered')
    }
    else {
        counter.textContent = `Найдено ${found} игр`
        counter.ariaDescription = (
            `Найдено ${found} из ${list.length} игр,` +
            counter.ariaDescription.split(',')[1]
        )
        counter.parentElement.classList.add('filtered')
    }
    filterButton.lastElementChild.textContent = counter.textContent
}

/**
 * @param {Array<{ game: Game, adapted: Record<string, string|number>, elem: HTMLDetailsElement }>} list
 * @param {{ by: 'name' | 'difficulty' | 'time' | 'players', dir: 'asc' | 'desc' }} sort
 */
function applySorting (list, sort) {
    let dir = sort.dir === 'desc' ? -1 : +1
    let order
    let container = document.getElementById('games')
    let counter = document.getElementById('search-count')

    switch (sort.by) {
        case 'name':
            order = list.toSorted((a, b) => {
                return a.adapted.name.localeCompare(b.adapted.name) * dir
            })
            counter.ariaDescription = (
                counter.ariaDescription.split(',')[0] +
                ', сортировка по названию - ' + (dir === 1 ? 'от А до Я' : 'от Я до А')
            )
            break

        case 'difficulty':
            order = list.toSorted((a, b) => {
                if (a.adapted.difficulty !== b.adapted.difficulty) {
                    if (a.adapted.difficulty === -1) { return  1 }
                    if (b.adapted.difficulty === -1) { return -1 }
                }
                return (a.adapted.difficulty - b.adapted.difficulty) * dir
            })
            counter.ariaDescription = (
                counter.ariaDescription.split(',')[0] +
                ', сортировка по сложности - ' + (dir === 1 ? 'сначала простые' : 'сначала сложные')
            )
            break

        case 'time':
            order = list.toSorted((a, b) => {
                if (a.game.time.max !== b.game.time.max) {
                    if (a.game.time.max === -1) { return  1 }
                    if (b.game.time.max === -1) { return -1 }
                }
                return (a.game.time.max - b.game.time.max) * dir
            })
            counter.ariaDescription = (
                counter.ariaDescription.split(',')[0] +
                ', сортировка по времени игры - ' + (dir === 1 ? 'сначала быстрые' : 'сначала долгие')
            )
            break

        case 'players':
            order = list.toSorted((a, b) => {
                if (a.game.players.min !== b.game.players.min) {
                    if (a.game.players.min === -1) { return  1 }
                    if (b.game.players.min === -1) { return -1 }
                }
                return (
                    (a.game.players.min * 1000 + a.game.players.max) -
                    (b.game.players.min * 1000 + b.game.players.max)
                ) * dir
            })
            counter.ariaDescription = (
                counter.ariaDescription.split(',')[0] +
                ', сортировка по количеству игроков - ' + (dir === 1 ? 'по возрастанию' : 'по убыванию')
            )
            break
    }

    order.forEach(item => { container.appendChild(item.elem) })
}

/**
 * @param {Array<{ game: Game, elem: HTMLDetailsElement }>} list
 */
function initFilters (list) {
    let adapted = list.map(entry => {
        return {
            game: entry.game,
            elem: entry.elem,
            adapted: {
                name: _adapt(entry.game.name),
                difficulty: Math.round(entry.game.difficulty),
                time: entry.game.time.max === -1 ? Infinity : entry.game.time.max
            }
        }
    })

    ////////////////

    let parent = document.getElementById('games')

    let name = document.getElementById('filter-name')

    let diff1 = document.getElementById('filter-difficulty-1')
    let diff2 = document.getElementById('filter-difficulty-2')
    let diff3 = document.getElementById('filter-difficulty-3')
    let diff4 = document.getElementById('filter-difficulty-4')
    let diff5 = document.getElementById('filter-difficulty-5')

    let time = document.getElementById('filter-time')

    let players = document.getElementById('filter-players')
    let playersOut = document.getElementById('filter-players-out')

    let age = document.getElementById('filter-age')

    let hide = document.getElementById('filter-hide')

    let order = document.getElementById('filter-ordering')
    let dir = document.getElementById('filter-desc')

    ////////////////

    let filters = {
        name: [],
        difficulty: new Set,
        time: 0,
        players: 0,
        age: 999
    }

    name.addEventListener('input', event => {
        filters.name = _adapt(event.target.value).split(/\s+/g)
        if (filters.name.length === 1 && filters.name[0] === '') {
            filters.name = []
        }
        name.classList.toggle('used', !!event.target.value)
        applyFilters(adapted, filters)
    })

    let i = 1
    let span
    for (let diff of [ diff1, diff2, diff3, diff4, diff5 ]) {
        diff.dataset.val = i.toString()
        diff.addEventListener('change', event => {
            let j = parseInt(diff.dataset.val)
            if (event.target.checked) { filters.difficulty.add(j) }
            else { filters.difficulty.delete(j) }
            diff.classList.toggle('used', event.target.checked)
            applyFilters(adapted, filters)
        })
        span = document.createElement('span')
        span.classList.add('soft')
        span.innerText = `(${adapted.reduce((s, e) => s + (e.adapted.difficulty === i), 0)})`
        diff.parentElement.appendChild(span)
        i ++
    }

    time.addEventListener('input', event => {
        filters.time = event.target.value ? parseInt(event.target.value) : 0
        time.classList.toggle('used', !!filters.time)
        applyFilters(adapted, filters)
    })

    players.addEventListener('input', event => {
        filters.players = parseInt(event.target.value)
        if (filters.players === 0) {
            playersOut.innerHTML = `Любое количество`
        }
        else if (filters.players >= 11) {
            let count = adapted.reduce((s, e) => {
                return s + (e.game.players.max >= 11)
            }, 0)
            playersOut.innerHTML = `От 11 и более <span class="soft">(${count} игр)</span>`
        }
        else {
            let count = adapted.reduce((s, e) => {
                return s + (e.game.players.min <= filters.players && filters.players <= e.game.players.max)
            }, 0)
            playersOut.innerHTML = `На ${filters.players} чел. <span class="soft">(${count} игр)</span>`
        }
        players.classList.toggle('used', filters.players > 0)
        applyFilters(adapted, filters)
    })

    age.addEventListener('change', event => {
        filters.age = parseInt(event.target.value)
        age.classList.toggle('used', filters.age < 999)
        applyFilters(adapted, filters)
    })

    hide.addEventListener('change', event => {
        parent.classList.toggle('hide', event.target.checked)
        document.cookie = `hide=${event.target.checked ? 1 : 0};path=/`
    })
    if (document.cookie.includes('hide=1')) {
        hide.checked = true
        parent.classList.toggle('hide', true)
    }

    ////////////////

    let sort = {
        by: 'name',
        dir: 'asc'
    }

    order.addEventListener('change', event => {
        sort.by = event.target.value
        applySorting(adapted, sort)
    })
    dir.addEventListener('change', event => {
        sort.dir = event.target.checked ? 'desc' : 'asc'
        applySorting(adapted, sort)
    })

    ////////////////

    let reset = event => {
        name.value = ''
        for (let diff of [ diff1, diff2, diff3, diff4, diff5 ]) {
            diff.checked = false
            diff.classList.remove('used')
        }
        time.value = ''
        players.value = 0
        playersOut.innerHTML = 'Любое количество'
        age.value = '999'

        name.classList.remove('used')
        time.classList.remove('used')
        players.classList.remove('used')
        age.classList.remove('used')

        filters.name = []
        filters.difficulty.clear()
        filters.time = 0
        filters.players = 0
        filters.age = 999

        applyFilters(adapted, filters)
    }

    document.getElementById('clear-filters')?.addEventListener('click', reset)
    document.getElementById('extra-clear-filters')?.addEventListener('click', reset)

    let filtersContainer = document.getElementById('filters')
    let filterButton = document.getElementById('filter-button')
    if (filterButton) {
        waveOn(filterButton)
        filterButton.addEventListener('click', event => {
            filtersContainer.ariaExpanded = filtersContainer.ariaExpanded === 'true' ? 'false' : 'true'
        })
        window.visualViewport.addEventListener('resize', event => {
            filterButton.style.bottom = (window.innerHeight - window.visualViewport.height + 10) + 'px'
        })
    }

    let counter = document.getElementById('search-count')
    counter.textContent = `Всего ${list.length} игр`
    counter.ariaDescription = 'Без фильтров, сортировка по названию - от А до Я'
}

window.addEventListener('load', async function () {
    initFilters(await listQueue)
    document.getElementById('filters').removeAttribute('inert')
})