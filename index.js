import { getPageData, getAllPagination, showUser} from '/module/pageDisplay.js'
import { filterResults, filterButton, filterEvent, filterProcess} from '/module/filter.js'

(function () {
    const BASE_URL = 'https://lighthouse-user-api.herokuapp.com/'
    const INDEX_URL = BASE_URL + 'api/v1/users/'
    const REGION_URL = 'https://restcountries.eu/rest/v2/name/'
    const alldata = JSON.parse(localStorage.getItem('alldata')) || []
    const dataPanel = document.getElementById('data-panel')
    const pagination = document.getElementById('pagination')
    const userModal = document.querySelector('#show-user-modal')
    const searchInput = document.getElementById('search-input')
    const searchForm = document.getElementById('search')
    const displayMode = document.getElementById('display-mode')
    const filter = document.getElementById('filter')
    const ITEM_PER_PAGE = 12
    const favoritelist = JSON.parse(localStorage.getItem('favoriteUsers')) || []
    let totalPages
    let modeStatus = 'card-mode'
    
    
    if (alldata.length === 0) {
      axios.get(INDEX_URL)
      .then(function (response){
        alldata.push(...response.data.results)
        addFlag()
        totalPages = Math.ceil(alldata.length / ITEM_PER_PAGE) || 1
        getAllPagination(totalPages) //顯示所有分頁
        getPageData(1, modeStatus, alldata) //獲取第一頁的資料
      })
      .catch(error => {
        console.log(error)
      })
    } else {
      totalPages = Math.ceil(alldata.length / ITEM_PER_PAGE) || 1
      getAllPagination(totalPages)
      getPageData(1, modeStatus, alldata)
    }
    //加入國旗
    function addFlag() {
      let noFlag = alldata.filter(i => typeof(i.flag) === 'undefined')
      if (noFlag.length === 0) {
        return
      }
      noFlag.forEach(user =>{
        let url
          if (user.region === 'England') {
            url = REGION_URL + 'United Kingdom of Great Britain and Northern Ireland'
          } else {
            url = REGION_URL + user.region
          }
          axios.get(url)
          .then(function (response){
            alldata[alldata.indexOf(user)].flag = response.data[0].flag
            alldata[alldata.indexOf(user)].continent = response.data[0].region
            alldata[alldata.indexOf(user)].subregion = response.data[0].subregion
          })
          .catch(error => {
            console.log(error)
          })
      })
      setTimeout(function(){
        localStorage.setItem('alldata', JSON.stringify(alldata)) //下次造訪網站就不用重新載入
        const activePage = Number(pagination.querySelector('.active').querySelector('.page-link').dataset.page)
        getPageData(activePage, modeStatus, alldata) //兩秒後載入有國旗的頁面
      },2000)
    }

    dataPanel.addEventListener('click', event => {
        if (event.target.matches('.fa-heart')) {
            let id = Number(event.target.parentElement.parentElement.querySelector('.card-id').textContent)
            changeFavoriteItem(id, 'remove')
        } else if (event.target.matches('.btn-show-user')) {
            showUser(event.target.dataset.id, alldata)
        } 
    })
    
    userModal.addEventListener('click', event => {
      if (event.target.matches('.add-to-favorite')) {
          let id = Number(event.target.parentElement.parentElement.querySelector('img').dataset.id)
          changeFavoriteItem(id, 'add')
      }
    })
    
    //點擊分頁時的事件
    pagination.addEventListener('click', event => {
        
        if (event.target.tagName === 'A') {
            const selectPage = Number(event.target.dataset.page)
            getPageData(selectPage, modeStatus)
        }
        
    })
  //移除或加入最愛
  function changeFavoriteItem (id, action) {
      const user = alldata.find(item => item.id === Number(id))
      switch(action){
          case 'add':
              if (favoritelist.some(item => item.id === Number(id))) {
                  //pass
              } else {
                  favoritelist.push(user)
                  dataPanel.querySelector(`[data-id="${id}"]`).parentElement.parentElement.querySelector('.fa-heart').classList.remove('d-none')
              }
              break
          case 'remove':
              favoritelist.splice(favoritelist.indexOf(user), 1)
              dataPanel.querySelector(`[data-id="${id}"]`).parentElement.parentElement.querySelector('.fa-heart').classList.add('d-none')
              break
      }
      localStorage.setItem('favoriteUsers', JSON.stringify(favoritelist)) //更新localstorage的資料
      document.querySelectorAll('.num-of-favorite').forEach(item => {item.textContent = favoritelist.length})
  }
  //依國家或人名搜尋
  searchForm.addEventListener('click', event => {
    if (event.target.matches('#search-type1')){
      const type1 = searchForm.querySelector('#search-type1').textContent
      searchForm.querySelector('#search-type').innerText = type1
    } else if (event.target.matches('#search-type2')){
      const type2 = searchForm.querySelector('#search-type2').textContent
      searchForm.querySelector('#search-type').innerText = type2
    }
  })
  //搜尋功能
  searchForm.addEventListener('submit', event => {
    event.preventDefault()
    if (searchInput.value.trim() === '') {
      return //未輸入資料無法搜尋
    }
    const searchTitle = document.querySelector('#search-title')
    searchTitle.classList.remove('d-none')
    filterStatus('close') //在搜尋時無法使用filter
    let results = []
    const regex = new RegExp(searchInput.value, 'i')
    let type = searchForm.querySelector('#search-type').textContent
    results = alldata.filter(user => user[`${type}`].match(regex))
    let resultPages = Math.ceil(results.length / ITEM_PER_PAGE) || 1
    getAllPagination(resultPages)
    getPageData(1, modeStatus, results)
    window.location = "#display-mode"
    if (results.length === 0){
      searchTitle.innerHTML = ''
      let htmlContent =  `<div class="my-5 mx-auto">
                              <h3>Sorry, we couldn't find any content for '${searchInput.value}' by ${type}</h3>
                          </div>
                          `
      dataPanel.innerHTML = htmlContent
    } else {
      searchTitle.innerHTML = `<div class="offset-2">
                                 <h3 class="ml-3">We founded ${results.length} results for '${searchInput.value}' by ${type}</h3>
                               </div>`
    }
  })
  //顯示模式
  displayMode.addEventListener('click', event => {
    if (event.target.matches('#filter-mode')) {
      if (event.target.classList.contains('active')){
        filterStatus('close')
      } else {
        filterStatus('open')
      }
    } else if (event.target.matches('.mode-icon')) {
      if (event.target.id === modeStatus) {
        event.target.style.color='black'
      } else {
        displayMode.querySelector(`#${modeStatus}`).style.color = '#B8B8B9'
        event.target.style.color='black'
        const activePage = Number(pagination.querySelector('.active').querySelector('.page-link').dataset.page)
        modeStatus = event.target.id
        getPageData(activePage, modeStatus, alldata)
      } 
    }
  })

  filterEvent()

  //關閉或使用filter
  function filterStatus(action) {
    switch (action){
      case 'close':
          filter.querySelectorAll('.filter-btn').forEach(item => {
            $(`${item.dataset.target}`).collapse('hide')
          })
          displayMode.querySelector('#filter-mode').classList.remove('active')
          displayMode.querySelector('#filter-mode').style.color='#B8B8B9'
          Object.values(filterResults).forEach(i => {
            i.save = false
            i.select = []})
          filterButton()
          getAllPagination(totalPages)
          getPageData(1, modeStatus, alldata)
          document.querySelector('#filter').classList.add('d-none')
        break
      case 'open':
          let agelist = []
          let rangeSlider = document.querySelector(".range-slider").querySelectorAll('input')
          alldata.forEach(user => {agelist.push(Number(user.age))})
          for (let i=0; i<2; i++){
            rangeSlider[i].max = Math.max(...agelist)
            rangeSlider[i].min = Math.min(...agelist)
            rangeSlider[i].value = (Number(rangeSlider[i].max) - Number(rangeSlider[i].min))*(i+1)/3 + Number(rangeSlider[i].min)
            document.querySelectorAll(".slider-value")[i].textContent = ` 歲`
          }
          displayMode.querySelector('#filter-mode').classList.add('active')
          displayMode.querySelector('#filter-mode').style.color='black'
          document.querySelector('#filter').classList.remove('d-none')
          document.querySelector('#search-title').classList.add('d-none')
          window.location = "#display-mode"
          getAllPagination(totalPages)
          getPageData(1, modeStatus, alldata)
        break
    }
  }
  
  document.querySelectorAll('.save-filter').forEach(button => {
    button.addEventListener('click', event => {
      if (event.target.dataset.target === '#collapseGender') {
        if (filterResults.gender.select.length > 0) {
          filterResults.gender.save = true
        }
        filterAll ()
      } else if (event.target.dataset.target === '#collapseRegion') {
        if (filterResults.region.select.length > 0) {
          filterResults.region.save = true
        }
        filterResults.region.save = true
        filterAll ()
      } else if (event.target.dataset.target === '#collapseAge') {
        filterResults.age.save = true
        filterAll ()
      }
    })
  })

//篩選資料
  function filterAll () {
    let results = filterProcess (alldata)
    //show the results
    let resultPages = Math.ceil(results.length / ITEM_PER_PAGE) || 1
    getAllPagination(resultPages)
    getPageData(1, modeStatus, results)
    filterButton ()
    //if there is no results
    if (results.length === 0){
      let htmlContent =  `<div class="my-5 mx-auto">
                              <h3>There is no results in your filter, please reset the filter.</h3>
                          </div>
                          `
      dataPanel.innerHTML = htmlContent
    }
    //在console上檢查是否UI一致
    console.table([Object.keys(filterResults),
                   Object.values(filterResults).map(i => i.save),
                   Object.values(filterResults).map(i => i.select.join(', '))])
  }

})()