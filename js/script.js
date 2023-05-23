const search = document.querySelector('.search'),
      input = document.querySelector('.search-input'),
      autocompleteList = document.querySelector('.search-list'),
      resultsList = document.querySelector('.list'),
      searchLink = new URL('https://api.github.com/search/repositories');
let currentSearch = {}

function debounce(fn, debounceTime) {
  let timeout;
  return function() {
    const fnCall = () => {fn.apply(this, arguments)}
    clearTimeout(timeout)
    timeout = setTimeout(fnCall, debounceTime)
  }
}

function createAutocompleteList(list) {
  for (let item of list) {
    autocompleteList.insertAdjacentHTML("beforeend", `<li class="search-list__item">${item.name}</li>`)
  }
  search.addEventListener('click', createCard)
}

function clearAutocompleteList(autocompleteList) {
  autocompleteList.innerHTML = ''
  search.removeEventListener('click', createCard)
}

async function gitSearch(e) {
  removeErrorMessage()
  clearAutocompleteList(autocompleteList)
  if(e.target.value.trim() !== '') {
    searchLink.searchParams.set('q', e.target.value)
    searchLink.searchParams.set('per_page', 5)
    return await fetch(searchLink).then(res => {
      if(res.ok){
        res.json().then(res => {
          if (res.items.length == 0) {
            throw new Error('No repositories')
          }
          currentSearch = res.items
          createAutocompleteList(currentSearch)
        }).catch(err => addErrorMessage(err))
      } else {
        throw new Error(`${res.status} ${res.statusText}`)
      }
    }).catch(err => addErrorMessage(err))
  }
}

function createCard(e) {
  if(e.target.classList.contains('search-list__item')) {
    input.value = ''
    clearAutocompleteList(autocompleteList)
    const choseenItem = currentSearch.find(item => item.name === e.target.textContent)
    const {name, owner: {login}, stargazers_count} = choseenItem
    resultsList.insertAdjacentHTML('beforeend', `<li class="list-item">
      <p class="list__content">Name: <span class="list__content--dynamic">${name}</span></p>
      <p class="list__content">Owner: <span class="list__content--dynamic">${login}</span></p>
      <p class="list__content">Stars: <span class="list__content--dynamic">${stargazers_count}</span></p>
      <button class="close-btn">X</button>`)
  }
  if(resultsList.childNodes.length === 1) {
    resultsList.addEventListener('click', removeCard)
  }
}

function removeCard(e) {
  if(e.target.classList.contains('close-btn')) {
    e.target.parentElement.remove()
  }
  if(resultsList.childNodes.length === 0) {
    resultsList.removeEventListener('click', removeCard)
  }
}

function addErrorMessage(err) {
  input.insertAdjacentHTML('afterend', `<p class="search__error-message">${err.message}</p>`)
  input.classList.add('search-input--error')
}

function removeErrorMessage() {
  let message = document.querySelector('.search__error-message')
  if (message) {
    message.remove()
    input.classList.remove('search-input--error')
  }
}


input.addEventListener('submit', e => e.preventDefault())
input.addEventListener('input', debounce(gitSearch, 400))
