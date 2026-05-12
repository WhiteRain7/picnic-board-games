const _adapts={'&':' и ','ё':'е',}
const _adaptRegExp=RegExp(`[${Object.keys(_adapts).join('')}]`,'g')
function _adapt(txt){return txt.toLowerCase().replaceAll(_adaptRegExp,k=>_adapts[k]).replaceAll(/[^a-zа-я0-9 ]/g,'')}
function applyfi(list,fi){let found=0
let e
for(let en of list){e=en.elem.querySelector('.game-name')
let v=!0
e.innerText=en.game.name
if(fi.name.length){e.innerHTML=en.adapted.name.replaceAll(RegExp(fi.name.filter(Boolean).join('|'),'g'),word=>`<mark>${word}</mark>`)
for(let word of fi.name){if(!en.adapted.name.includes(word)){v=!1
break}}}
if(v&&fi.difficulty.size){if(!fi.difficulty.has(en.adapted.difficulty)){v=!1}}
if(v&&fi.time){if(en.adapted.time>fi.time){v=!1}}
if(v&&fi.players){if(fi.players>=11){if(en.game.players.max<11){v=!1}}else if(!(en.game.players.min<=fi.players&&fi.players<=en.game.players.max)){v=!1}}
if(v&&fi.age){if(en.game.age>fi.age){v=!1}}
en.elem.classList.toggle('invisible',!v)
en.elem.firstElementChild.firstElementChild.tabIndex=v?0:-1
found+=v?1:0}
let co=document.getElementById('search-count')
let filterButton=document.getElementById('filter-button')
if(found===list.length){co.textContent=`Всего ${list.length} игр`
co.ariaDescription=(`Без фильтров,`+co.ariaDescription.split(',')[1])
co.parentElement.classList.remove('filtered')}else{co.textContent=`Найдено ${found} игр`
co.ariaDescription=(`Найдено ${found} из ${list.length} игр,`+co.ariaDescription.split(',')[1])
co.parentElement.classList.add('filtered')}
filterButton.lastElementChild.textContent=co.textContent}
function applySorting(list,sort){let dir=sort.dir==='desc'?-1:+1
let order
let container=document.getElementById('games')
let co=document.getElementById('search-count')
switch(sort.by){case 'name':order=list.toSorted((a,b)=>{return a.adapted.name.localeCompare(b.adapted.name)*dir})
co.ariaDescription=(co.ariaDescription.split(',')[0]+', сортировка по названию - '+(dir===1?'от А до Я':'от Я до А'))
break
case 'difficulty':order=list.toSorted((a,b)=>{if(a.adapted.difficulty!==b.adapted.difficulty){if(a.adapted.difficulty===-1){return 1}
if(b.adapted.difficulty===-1){return-1}}
return(a.game.difficulty-b.game.difficulty)*dir})
co.ariaDescription=(co.ariaDescription.split(',')[0]+', сортировка по сложности - '+(dir===1?'сначала простые':'сначала сложные'))
break
case 'time':order=list.toSorted((a,b)=>{if(a.game.time.max!==b.game.time.max){if(a.game.time.max===-1){return 1}
if(b.game.time.max===-1){return-1}}
return(a.game.time.max-b.game.time.max)*dir})
co.ariaDescription=(co.ariaDescription.split(',')[0]+', сортировка по времени игры - '+(dir===1?'сначала быстрые':'сначала долгие'))
break
case 'players':order=list.toSorted((a,b)=>{if(a.game.players.min!==b.game.players.min){if(a.game.players.min===-1){return 1}
if(b.game.players.min===-1){return-1}}
return((a.game.players.min*1000+a.game.players.max)-(b.game.players.min*1000+b.game.players.max))*dir})
co.ariaDescription=(co.ariaDescription.split(',')[0]+', сортировка по количеству игроков - '+(dir===1?'по возрастанию':'по убыванию'))
break}
order.forEach(item=>{container.appendChild(item.elem)})}
function initfi(list){let adapted=list.map(en=>{return{game:en.game,elem:en.elem,adapted:{name:_adapt(en.game.name),difficulty:Math.round(en.game.difficulty),time:en.game.time.max===-1?Infinity:en.game.time.max}}})
let g=x=>document.getElementById(x)
let parent=g('games')
let name=g('filter-name')
let d1=g('filter-difficulty-1')
let d2=g('filter-difficulty-2')
let d3=g('filter-difficulty-3')
let d4=g('filter-difficulty-4')
let d5=g('filter-difficulty-5')
let time=g('filter-time')
let players=g('filter-players')
let playersOut=g('filter-players-out')
let age=g('filter-age')
let hide=g('filter-hide')
let order=g('filter-ordering')
let dir=g('filter-desc')
let fi={name:[],difficulty:new Set,time:0,players:0,age:999}
name.addEventListener('input',event=>{fi.name=_adapt(event.target.value).split(/\s+/g)
if(fi.name.length===1&&fi.name[0]===''){fi.name=[]}
name.classList.toggle('used',!!event.target.value)
applyfi(adapted,fi)})
let i=1
let span
for(let diff of[d1,d2,d3,d4,d5]){diff.dataset.val=i.toString()
diff.addEventListener('change',event=>{let j=parseInt(diff.dataset.val)
if(event.target.checked){fi.difficulty.add(j)}else{fi.difficulty.delete(j)}
diff.classList.toggle('used',event.target.checked)
applyfi(adapted,fi)})
span=document.createElement('span')
span.classList.add('soft')
span.innerText=` (${adapted.reduce((s, e) => s + (e.adapted.difficulty === i), 0)})`
diff.parentElement.appendChild(span)
i ++}
time.addEventListener('input',event=>{fi.time=event.target.value?parseInt(event.target.value):0
time.classList.toggle('used',!!fi.time)
applyfi(adapted,fi)})
players.addEventListener('input',event=>{fi.players=parseInt(event.target.value)
if(fi.players===0){playersOut.innerHTML=`Любое количество`}else if(fi.players>=11){let count=adapted.reduce((s,e)=>{return s+(e.game.players.max>=11)},0)
playersOut.innerHTML=`От 11 и более <span class="soft">(${count} игр)</span>`}else{let count=adapted.reduce((s,e)=>{return s+(e.game.players.min<=fi.players&&fi.players<=e.game.players.max)},0)
playersOut.innerHTML=`На ${fi.players} чел. <span class="soft">(${count} игр)</span>`}
players.classList.toggle('used',fi.players>0)
applyfi(adapted,fi)})
age.addEventListener('change',event=>{fi.age=parseInt(event.target.value)
age.classList.toggle('used',fi.age<999)
applyfi(adapted,fi)})
hide.addEventListener('change',event=>{parent.classList.toggle('hide',event.target.checked)
document.cookie=`hide=${event.target.checked ? 1 : 0};path=/`})
if(document.cookie.includes('hide=1')){hide.checked=!0
parent.classList.toggle('hide',!0)}
let sort={by:'name',dir:'asc'}
order.addEventListener('change',event=>{sort.by=event.target.value
applySorting(adapted,sort)})
dir.addEventListener('change',event=>{sort.dir=event.target.checked?'desc':'asc'
applySorting(adapted,sort)})
let reset=event=>{name.value=''
for(let diff of[d1,d2,d3,d4,d5]){diff.checked=!1
diff.classList.remove('used')}
time.value=''
players.value=0
playersOut.innerHTML='Любое количество'
age.value='999'
name.classList.remove('used')
time.classList.remove('used')
players.classList.remove('used')
age.classList.remove('used')
fi.name=[]
fi.difficulty.clear()
fi.time=0
fi.players=0
fi.age=999
applyfi(adapted,fi)}
document.getElementById('clear-filters')?.addEventListener('click',reset)
document.getElementById('extra-clear-filters')?.addEventListener('click',reset)
let ficn=document.getElementById('filters')
let filterButton=document.getElementById('filter-button')
if(filterButton){waveOn(filterButton)
filterButton.addEventListener('click',e=>{
ficn.ariaExpanded = ficn.ariaExpanded === 'true' ? 'false' : 'true'
if(ficn.ariaExpanded === 'true'){history.pushState({f:true},'')}else{history.back()}})
window.visualViewport.addEventListener('resize',e=>{
filterButton.style.bottom=(window.innerHeight-window.visualViewport.height+10)+'px'
})}
window.addEventListener('popstate',e=>{
if(ficn.ariaExpanded==='true'){e.preventDefault()
ficn.ariaExpanded='false'}})
let co=document.getElementById('search-count')
co.textContent=`Всего ${list.length} игр`
co.ariaDescription='Без фильтров, сортировка по названию - от А до Я'}
window.addEventListener('load',async function(){initfi(await listQueue)
document.getElementById('filters').removeAttribute('inert')})