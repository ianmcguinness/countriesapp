// Query Selectors
const main = document.querySelector('.main')
const detail = document.querySelector('.detail')
const countriesEl = document.querySelector('.countries')
const options = document.querySelector('.filter-options')
const pageButtons = document.querySelector('.page-buttons')
const countryDetail = document.querySelector('.country-detail')
const cssLink = document.querySelector('link')
const currentMode = document.querySelector('.mode-select p')
const modeIcon = document.querySelector('.mode-icon')
const search = document.querySelector('.search')
const filterTab = document.querySelector('.filter-tab')
const filterOptions = document.querySelector('.filter-options')
const searchIcon = document.querySelector('.search-icon')
const title = document.querySelector('.title')
const backButton = document.querySelector('.back-button')
const modeSelect = document.querySelector('.mode-select')

// Get Data
const makeRequest = async () => {
  return await axios.get('https://restcountries.eu/rest/v2/all')
}

const fetchAllCountries = async () => {
  const res = await makeRequest()
  return res.data
}

const fetchFilteredCountries = async continent => {
  const res = await makeRequest()
  const filteredCountries = res.data.filter(
    country => country.region === continent
  )
  return filteredCountries
}

let page = 1
let filter = {}

const searchCountries = async searchTerm => {
  const res = await makeRequest()
  const filteredCountries = res.data.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  )
  filter = { search: searchTerm }
  return filteredCountries
}

// Functions

const init = async () => {
  main.classList.remove('hidden')
  detail.classList.add('hidden')
  const countries = await fetchAllCountries()
  page = 1
  updateDOM(paginate(countries, page))
}

const updateDOM = countries => {
  countriesEl.innerHTML = ''

  countries.forEach(country => {
    const card = document.createElement('div')
    card.classList.add('country-card')
    card.setAttribute('data-target', country.alpha3Code)
    card.innerHTML = `<div class="country-flag">
                    <img src="${country.flag}" alt="${country.name} flag">
                </div>
                <div class="country-details">
                    <h3>${country.name}</h3>
                    <p><strong>Population: </strong>${country.population.toLocaleString()}</p>
                    ${
                      country.region &&
                      `<p><strong>Region: </strong>${country.region}</p>`
                    }
                    ${
                      country.capital &&
                      `<p><strong>Capital: </strong>${country.capital}</p>`
                    }
                </div>`
    countriesEl.append(card)
  })

  if (!countries.length) {
    const err = document.createElement('div')
    err.innerHTML = `<h3>Sorry, there were no results for your search term</h3>`
    err.classList.add('error-message')
    countriesEl.append(err)
  }
}

init()

const toggleFilterMenu = () => {
  options.classList.toggle('hidden')
}

const filterMenuSelect = async e => {
  const region = e.target.textContent
  const countries = await fetchFilteredCountries(region)
  page = 1
  filter = { continent: region }
  updateDOM(paginate(countries, page))
  toggleFilterMenu()
}

const showPageButtons = (page, countries, resultsPerPage) => {
  const pages = Math.ceil(countries.length / resultsPerPage)
  pageButtons.innerHTML = ''

  if (page !== 1) {
    const back = document.createElement('button')
    back.classList.add('page-back', 'page-btn')
    back.innerHTML = `<i class="fas fa-chevron-left"></i>
            Page ${page - 1}`

    pageButtons.append(back)
  }

  if (page < pages) {
    const forward = document.createElement('button')
    forward.classList.add('page-forward', 'page-btn')
    forward.innerHTML = `
        Page ${page + 1}
        <i class="fas fa-chevron-right"></i>`

    pageButtons.append(forward)
  }
}

const paginate = (countries, page = 1) => {
  const resultsPerPage = 16
  const pageResults = countries.slice(
    resultsPerPage * (page - 1),
    resultsPerPage * page
  )
  showPageButtons(page, countries, resultsPerPage)
  return pageResults
}

const updateDetailPage = async country => {
  countryDetail.innerHTML = ''

  detail.classList.remove('hidden')
  main.classList.add('hidden')

  const flag = document.createElement('div')
  flag.classList.add('detail-flag')
  flag.innerHTML = `<img src="${country.flag}" alt="${country.name} flag">`

  const info = document.createElement('div')
  info.classList.add('detail-info')
  info.innerHTML = `<h2>${country.name}</h2>
            <div class="info-points">
              <p><strong>Native Name: </strong>${country.nativeName}</p>
              <p><strong>Population: </strong>${country.population.toLocaleString()}</p>
              <p><strong>Region: </strong>${country.region}</p>
              <p><strong>Sub-Region: </strong>${country.subregion}</p>
              <p><strong>Capital: </strong>${country.capital}</p>
              <p><strong>Top Level Domain: </strong>${country.topLevelDomain.join(
                ', '
              )}</p>
              <p><strong>Currencies: </strong>${country.currencies
                .map(currency => currency.name)
                .join(', ')}</p>
              <p><strong>Languages: </strong>${country.languages
                .map(lang => lang.name)
                .join(', ')}</p>
            </div>
            ${
              country.borders.length
                ? `<p><div class="border-countries"><strong>Border countries: </strong></div></p>`
                : ''
            }
            `

  countryDetail.append(flag)
  countryDetail.append(info)
  getBorderCountries(country.borders)
}

const getBorderCountries = countries => {
  countries.forEach(async country => {
    const border = await axios.get(
      `https://restcountries.eu/rest/v2/alpha/${country}`
    )
    const div = document.createElement('div')
    div.classList.add('border-country')
    div.textContent = border.data.name
    div.addEventListener('click', () => {
      updateDetailPage(border.data)
    })
    document.querySelector('.border-countries').append(div)
  })
}

let mode = 'Dark'
const switchTheme = () => {
  mode = mode === 'Dark' ? 'Light' : 'Dark'
  const icon = mode === 'Dark' ? 'moon' : 'sun'
  cssLink.href = `./css/${mode.toLowerCase()}.css`
  currentMode.textContent = `${mode} mode`
  modeIcon.classList.remove('fa-sun', 'fa-moon')
  modeIcon.classList.add(`fa-${icon}`)
}

const submitSearch = async function () {
  const searchTerm = search.value
  const countries = await searchCountries(searchTerm)
  page = 1
  updateDOM(paginate(countries, page))
  search.value = ''
}

// Event Listeners

filterTab.addEventListener('click', toggleFilterMenu)

filterOptions.addEventListener('click', filterMenuSelect)

search.addEventListener('keypress', async function (e) {
  if (e.key === 'Enter') {
    submitSearch()
  }
})

searchIcon.addEventListener('click', submitSearch)

pageButtons.addEventListener('click', async e => {
  const target = e.target.closest('.page-btn')
  if (!target) return

  if (target.className.includes('page-back')) page--
  if (target.className.includes('page-forward')) page++

  let countries
  if (filter.search) {
    countries = await searchCountries(filter.search)
  } else if (filter.continent) {
    countries = await fetchFilteredCountries(filter.continent)
  } else {
    countries = await fetchAllCountries()
  }

  updateDOM(paginate(countries, page))
})

title.addEventListener('click', init)

countriesEl.addEventListener('click', async e => {
  const countryCard = e.target.closest('.country-card')
  if (!countryCard) return
  const countries = await fetchAllCountries()
  const country = countries.find(
    country =>
      country.alpha3Code === countryCard.dataset.target
  )
  updateDetailPage(country)
})

backButton.addEventListener('click', init)

modeSelect.addEventListener('click', switchTheme)
