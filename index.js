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
    const collapseGender = document.querySelector('#collapseGender')
    const collapseRegion = document.querySelector('#collapseRegion')
    const collapseAge = document.querySelector('#collapseAge')
    let filterResults = {gender: {save: false, select: []}, region: {save: false, select: []}, age: {save: false, select: []}}
    let totalPages
    let paginationData = []
    let modeStatus = 'card-mode'

    if (alldata.length === 0) {
      axios.get(INDEX_URL)
      .then(function (response){
        alldata.push(...response.data.results)
        addFlag()
        totalPages = Math.ceil(alldata.length / ITEM_PER_PAGE) || 1
        getAllPagination(totalPages) //顯示所有分頁
        getPageData(1, alldata) //獲取第一頁的資料
      })
      .catch(error => {
        console.log(error)
      })
    } else {
      totalPages = Math.ceil(alldata.length / ITEM_PER_PAGE) || 1
      getAllPagination(totalPages)
      getPageData(1, alldata)
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
        getPageData(activePage, alldata) //兩秒後載入有國旗的頁面
      },2000)
    }

    dataPanel.addEventListener('click', event => {
        if (event.target.matches('.fa-heart')) {
            let id = Number(event.target.parentElement.querySelector('.card-id').textContent)
            changeFavoriteItem(id, 'remove')
        } else if (event.target.matches('.btn-show-user')) {
            showUser(event.target.dataset.id)
        } 
    })
    
    //建立用戶資訊卡
    function createUserCard (data, parent) {
        let userCard = document.createElement('div')
        userCard.classList.add('user-card', 'card', 'p-2', 'my-5')
        userCard.innerHTML = `
              <i class="mr-3 mt-3 fas fa-heart d-none text-right"></i>
              <div class="p-4 user-img">
                <img src="${data.avatar}" data-toggle="modal" data-target="#show-user-modal" data-id="${data.id}" class="btn-show-user rounded-circle card-img-top mx-auto img-fluid ${data.gender}">
              </div>
              <div class="card-body d-flex flex-column align-items-center">
                <span class="card-id d-none">${data.id}</span>
                <h5 class="card-title">${data.name} ${data.surname}</h5>
                <p class="card-text"><img class='mr-2 mb-1 flag' src="${data.flag}">${data.region}</p>
                <span class="age"><i class="fas fa-${data.gender} mr-2"></i>${data.age}歲</span>
              </div>`
        parent.appendChild(userCard)
    }
    //建立用戶資訊列
    function createUserList (data, parent) {
      let userList = document.createElement('div')
      userList.classList.add('user-list', 'list-group-item')
      userList.innerHTML = `
            <div class="row d-flex">
              <i class="my-auto fas fa-heart d-none text-left"></i>
              <div class="user-img col-2 text-center">
                <img src="${data.avatar}" data-toggle="modal" data-target="#show-user-modal" data-id="${data.id}" class="list-img btn-show-user rounded-circle mx-auto img-fluid ${data.gender}">
              </div>
              <span class="card-id d-none">${data.id}</span>
              <h5 class="card-title my-auto col-3 text-center">${data.name} ${data.surname}</h5>
              
              <p class="my-auto card-text col-3 text-center"><img class='mb-1 flag mr-3' src="${data.flag}">${data.region}</p>
              <div class="my-auto text-center col-1">  
                <i class="my-auto fas fa-${data.gender}"></i>
              </div>
              <span class="text-center my-auto age col-2">${data.age}歲</span>
            </div>`
      parent.appendChild(userList)
  }
    
    //顯示整頁的社群用戶
    function displayDataList(datalist) {
      if (modeStatus === 'card-mode') {
        let cardDeck = document.createElement('div')
        cardDeck.classList.add('card-deck', 'mx-auto')
        //用大量d-none的div製作響應式的card-deck
        for(let i=0; i < datalist.length; i++) {
            
            if (i%2 === 0) {
                let div = document.createElement('div')
                div.innerHTML = `<div class="w-100 d-none d-sm-block d-md-none"></div>`
                cardDeck.appendChild(div.children[0])
            } 
            if (i%3 === 0){
                let div = document.createElement('div')
                div.innerHTML = `<div class="w-100 d-none d-md-block d-lg-none"></div>`
                cardDeck.appendChild(div.children[0])
            }
            if (i%4 === 0){
                let div = document.createElement('div')
                div.innerHTML = `<div class="w-100 d-none d-lg-block"></div>`
                cardDeck.appendChild(div.children[0])
            }   
            createUserCard(datalist[i], cardDeck)
        }
        dataPanel.innerHTML = cardDeck.outerHTML
      }
      else if (modeStatus === 'list-mode') {
        let listgroup = document.createElement('ul')
        listgroup.classList.add('list-group', 'list-group-flush', 'w-100', 'my-5', 'p-2')
        datalist.forEach(item => {createUserList(item, listgroup)})
        dataPanel.innerHTML = listgroup.outerHTML
      } 
    }

    //點擊用戶圖片時，觸發用戶modal
    function showUser (id) {

        const modalTitle = document.getElementById('show-user-name')
        const modalImage = document.getElementById('show-user-image')
        const modalDate = document.getElementById('show-user-date')
        const modalAge = document.getElementById('show-user-age')
        const modalRegion = document.getElementById('show-user-region')
        const modalEmail = document.getElementById('show-user-email')
        const modalFooter = document.getElementById('show-user-modal-footer')
    
        alldata.forEach(data=> {
          if (data.id === Number(id)){
            modalTitle.innerHTML = `<i class="fas fa-address-card mr-2"></i>${data.name} ${data.surname}`
            modalImage.innerHTML = `<img src="${data.avatar}" data-id=${data.id} class="img-fluid rounded-circle" alt="Responsive image">`
            modalDate.innerHTML = `<i class="fas fa-baby mr-2"></i>${data.birthday}`
            modalRegion.innerHTML = `<img src="${data.flag}" class='mr-2 mb-1 flag'>${data.region}`
            modalAge.innerHTML = `<i class="fas fa-user mr-2"></i>${data.age} years old`
            modalEmail.innerHTML = `<i class="fas fa-envelope mr-2"></i>${data.email}`
          }
        })
        //在最愛名單中的人沒有加入最愛按鈕
        if (favoritelist.map(i => i.id).includes(Number(id))){
          modalFooter.querySelector('.add-to-favorite').classList.add('d-none')
        } else {
          modalFooter.querySelector('.add-to-favorite').classList.remove('d-none')
        }

      }
    
    //點擊分頁時的事件
    pagination.addEventListener('click', event => {
        
        if (event.target.tagName === 'A') {
            const selectPage = Number(event.target.dataset.page)
            getPageData(selectPage)
        }
        
    })

    //分頁資訊
    function paginationUpdate (selectPage, data) {
        const paginationList = pagination.querySelectorAll('.page-item')
        let totalPages = Math.ceil(data.length / ITEM_PER_PAGE)
        //在使用者的分頁有active效果
        paginationList.forEach(page => {page.classList.remove('active')})
        pagination.querySelectorAll(`[data-page='${selectPage}']`).forEach( item => {item.parentElement.classList.add('active')})
        pagination.querySelector('#last-page').parentElement.classList.remove('active')
        pagination.querySelector('#next-page').parentElement.classList.remove('active')
        //更新上一頁與下一頁地址
        pagination.querySelector('#last-page').dataset.page = selectPage - 1
        pagination.querySelector('#next-page').dataset.page = selectPage + 1
        for (let page=1 ; page<=totalPages ; page++) {
          pagination.querySelectorAll(`[data-page='${page}']`).forEach( item => {item.parentElement.classList.add('d-none')})
        }
        //在分頁區塊只顯示10個分頁
        const numPaginationShow = 10
  
        if (selectPage < Math.ceil(numPaginationShow/2) + 1) {
          for (let page=1 ; page<=numPaginationShow ; page++) {
            pagination.querySelectorAll(`[data-page='${page}']`).forEach( item => {item.parentElement.classList.remove('d-none')})
          }
        } else if (selectPage <= totalPages - Math.ceil(numPaginationShow/2)) {
          for (let page=selectPage-Math.floor(numPaginationShow/2); page<selectPage+Math.ceil(numPaginationShow/2) ; page++) {
            pagination.querySelectorAll(`[data-page='${page}']`).forEach( item => {item.parentElement.classList.remove('d-none')})
          }
        } else {
          for (let page=totalPages - numPaginationShow + 1 ; page<=totalPages ; page++) {
            pagination.querySelectorAll(`[data-page='${page}']`).forEach( item => {item.parentElement.classList.remove('d-none')})
          }
        }
        //在最後一頁時不顯示下一頁，在第一頁時不顯示上一頁
        if (selectPage === totalPages){
          pagination.querySelector('#next-page').parentElement.classList.add('d-none')
        } else {
          pagination.querySelector('#next-page').parentElement.classList.remove('d-none')
        }
        if (selectPage === 1){
          pagination.querySelector('#last-page').parentElement.classList.add('d-none')
        } else {
          pagination.querySelector('#last-page').parentElement.classList.remove('d-none')
        }
        //沒有資料時不顯示上一頁與下一頁
        if (data.length === 0){
          paginationList.forEach(page => {page.classList.add('d-none')})
        }
    }

    //載入所有分頁
    function getAllPagination (totalPages) {

        let pageItemContent = `
        <li class="page-item">
          <a id="last-page" class="page-link" href="#data-panel" data-page="1">上一頁</a>
        </li>
        <li class="page-item active">
          <a class="page-link" href="#data-panel" data-page="1">1</a>
        </li>
        `
        for (let i = 1; i < totalPages; i++) {
        pageItemContent += `
        <li class="page-item">
          <a class="page-link" href="#data-panel" data-page="${i + 1}">${i + 1}</a>
        </li>
        `
        }
        pageItemContent += `
        <li class="page-item">
          <a id="next-page" class="page-link" href="#data-panel" data-page="2">下一頁</a>
        </li>
        `
        pagination.innerHTML = pageItemContent
    }

    function getPageData (pageNum, data) {
        paginationData = data || paginationData
        let offset = (pageNum - 1) * ITEM_PER_PAGE
        let pageData = paginationData.slice(offset, offset + ITEM_PER_PAGE)
        displayDataList(pageData)
        paginationUpdate(pageNum, paginationData)
        favoriteCheck ()
    }

    userModal.addEventListener('click', event => {
        if (event.target.matches('.add-to-favorite')) {
            let id = Number(event.target.parentElement.parentElement.querySelector('img').dataset.id)
            changeFavoriteItem(id, 'add')
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
    resultPages = Math.ceil(results.length / ITEM_PER_PAGE) || 1
    getAllPagination(resultPages)
    getPageData(1, results)
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
        getPageData(activePage)
      } 
    }
  })
  //關閉或使用filter
  function filterStatus(action) {
    switch (action){
      case 'close':
          filter.querySelectorAll('.filter-btn').forEach(item => {
            $(`${item.dataset.target}`).collapse('hide')
          })
          displayMode.querySelector('#filter-mode').classList.remove('active')
          displayMode.querySelector('#filter-mode').style.color='#B8B8B9'
          filterResults = {gender: {save: false, select: []}, region: {save: false, select: []}, age: {save: false, select: []}}
          filterAll()
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
          filterAll()
        break
    }
  }

  filter.addEventListener('click', event => {
    if (event.target.matches('.filter-btn')) {
      event.target.style.background="#747474"
      event.target.style.color="white"
      filter.querySelectorAll('.filter-btn').forEach(item => {
        if (item.id !== event.target.id){ 
          item.removeAttribute("style")
          $(`${item.dataset.target}`).collapse('hide') //一次只出現一種filter
        }
      })
     filterButton ()
    }
  })
  //gender filter
  collapseGender.addEventListener('click', event => {
    if (event.target.matches('.filter-btn')){
      filterResults.gender.save = false
      collapseGender.querySelectorAll('.filter-btn').forEach(item => {
        item.removeAttribute("style")
      })
      if (filterResults.gender.select[0] === event.target.id){
        event.target.removeAttribute("style")
        filterResults.gender.select = []
      } else {
        event.target.style.background="#747474"
        event.target.style.color="white"
        filterResults.gender.select = []
        filterResults.gender.select.push(event.target.id)
      }
    } 
    else if (event.target.matches('.save-filter')) {
      if (filterResults.gender.select.length > 0) {
        filterResults.gender.save = true
      }
      filterAll ()
    } 
    else if (event.target.matches('.clear-filter')) {
      filterResults.gender.save = false
      filterResults.gender.select = []
      collapseGender.querySelectorAll('.filter-btn').forEach(item => {
        item.removeAttribute("style")
      })
    }
  })
  //region filter
  collapseRegion.addEventListener('click', event => {
    if (event.target.matches('.filter-btn')){
      filterResults.region.save = false
      if (filterResults.region.select.includes(event.target.id)){
        event.target.removeAttribute("style")
        let index = filterResults.region.select.indexOf(event.target.id)
        filterResults.region.select.splice(index, 1)
      } else {
        event.target.style.background="#747474"
        event.target.style.color="white"
        filterResults.region.select.push(event.target.id)
      }
    } 
    else if (event.target.matches('.save-filter')) {
      if (filterResults.region.select.length > 0) {
        filterResults.region.save = true
      }
      filterResults.region.save = true
      filterAll ()
    }
    else if (event.target.matches('.clear-filter')) {
      filterResults.region.save = false
      filterResults.region.select = []
      collapseRegion.querySelectorAll('.filter-btn').forEach(item => {
        item.removeAttribute("style")
      })
    }
  })
//age filter
function rangeSlider() {

    const rangeSlider = document.querySelector(".range-slider")
    const rangeOfAge = rangeSlider.querySelectorAll("input[type=range]")
    const numOfRange = rangeSlider.querySelectorAll(".slider-value")

    rangeOfAge.forEach(function(element) {
      element.oninput = function() {
        let slide1 = Number(rangeOfAge[0].value)
        let slide2 = Number(rangeOfAge[1].value)
  
        if (slide1 > slide2) {
            [slide1, slide2] = [slide2, slide1]
        }
  
        numOfRange[0].textContent = `${slide1} 歲`;
        numOfRange[1].textContent = `${slide2} 歲`;
        filterResults.age.select = [slide1, slide2]
      }
    })
}

rangeSlider()

collapseAge.addEventListener('click', event => {
  if (event.target.matches('.save-filter')) {
    filterResults.age.save = true
    filterAll ()
  } else if (event.target.matches('.clear-filter')) {
    filterResults.age.save = false
    filterResults.age.select = []
    let rangeSlider = document.querySelector(".range-slider").querySelectorAll('input')
    document.querySelectorAll(".slider-value")[0].textContent = `${rangeSlider[0].min} 歲`
    document.querySelectorAll(".slider-value")[1].textContent = `${rangeSlider[0].max} 歲`
    rangeSlider[0].value = rangeSlider[0].min
    rangeSlider[1].value = rangeSlider[0].max
  }
})
//決定filter按鈕顏色
  function filterButton () {
    filter.querySelectorAll('.filter-btn').forEach(item => {
      if (filterResults[item.id.split('-')[1]]['select'].length === 0 || filterResults[item.id.split('-')[1]]['save'] === false){ //沒按儲存不算
        document.querySelector(item.dataset.target).querySelectorAll('.filter-btn').forEach(button => {button.removeAttribute("style")})
        filterResults[item.id.split('-')[1]]['select'] = []
        item.removeAttribute("style")
        item.textContent = item.id.split('-')[1]
      } else {
        item.style.background="#747474"
        item.style.color="white"
      }
    })
  }
  
//篩選資料
  function filterAll () {
    let results = alldata
    //step1 gender
    if (filterResults.gender.select.length === 0) {
      filter.querySelector('#collapse-gender').removeAttribute("style")
      filter.querySelector('#collapse-gender').textContent = 'gender'
    } else {
      results = results.filter(user => user.gender === filterResults.gender.select[0])
      filter.querySelector('#collapse-gender').textContent = filterResults.gender.select[0]
    }
    //step2 region
    if (filterResults.region.select.length === 0) {
      filter.querySelector('#collapse-region').removeAttribute("style")
      filter.querySelector('#collapse-region').textContent = 'region'
    } else if (filterResults.region.select.length === 1) {
      results = results.filter(user => filterResults.region.select.includes(user.continent))
      filter.querySelector('#collapse-region').textContent = filterResults.region.select[0]
    } else if (filterResults.region.select.length === 4) {
      filter.querySelector('#collapse-region').removeAttribute("style")
      filter.querySelector('#collapse-region').textContent = 'region'
      collapseRegion.querySelectorAll('.filter-btn').forEach(element => {element.removeAttribute('style')})
      filterResults.region.select = []
    } else {
      results = results.filter(user => filterResults.region.select.includes(user.continent))
      filter.querySelector('#collapse-region').textContent = `${filterResults.region.select.length} 個地區`
    }
    //step3 age
    if (filterResults.age.select.length === 0) {
      filter.querySelector('#collapse-age').removeAttribute("style")
      filter.querySelector('#collapse-age').textContent = `age`
    } else {
      results = results.filter(user => (Number(user.age) >= filterResults.age.select[0] && Number(user.age) <= filterResults.age.select[1]))
      filter.querySelector('#collapse-age').textContent = `${filterResults.age.select[0]} 歲 - ${filterResults.age.select[1]} 歲`
    }
    //show the results
    resultPages = Math.ceil(results.length / ITEM_PER_PAGE) || 1
    getAllPagination(resultPages)
    getPageData(1, results)
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

  function favoriteCheck () {
    //更新所有紀錄我的最愛名單人數的元素
    document.querySelectorAll('.num-of-favorite').forEach(item => {item.textContent = favoritelist.length})
    //讓在我的最愛名單的用戶顯示愛心圖案
    if (modeStatus === 'card-mode'){
      dataPanel.querySelectorAll(`.user-card`).forEach(item => {
        if (favoritelist.map(i => i.id).includes(Number(item.querySelector('.card-id').textContent))) {
          item.querySelector('.fa-heart').classList.remove('d-none')
        } 
        else {
            item.querySelector('.fa-heart').classList.add('d-none')
        }
      })
    } 
    else if (modeStatus === 'list-mode') {
      dataPanel.querySelectorAll(`.user-list`).forEach(item => {
        if (favoritelist.map(i => i.id).includes(Number(item.querySelector('.card-id').textContent))) {
          item.querySelector('.fa-heart').classList.remove('d-none')
        } 
        else {
          item.querySelector('.fa-heart').classList.add('d-none')
        }
      })
    }  
  }

})()