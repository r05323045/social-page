(function () {

    const data = JSON.parse(localStorage.getItem('favoriteUsers')) || []
    const dataPanel = document.getElementById('data-panel')
    const pagination = document.getElementById('pagination')
    const displayMode = document.getElementById('display-mode')
    const ITEM_PER_PAGE = 12
    let modeStatus = 'card-mode'
    let totalPages = Math.ceil(data.length / ITEM_PER_PAGE)
    
    getAllPagination(totalPages)
    getPageData(1, data)
    checkIfEmpty()
    
   
    dataPanel.addEventListener('click', event => {
        if (event.target.matches('.fa-heart')) {
            let id = Number(event.target.parentElement.querySelector('.card-id').textContent)
            removeFavoriteItem(id)
        } else if (event.target.matches('.btn-show-user')) {
            showUser(event.target.dataset.id)
        } 
    })
    //頁面是否為空
    function checkIfEmpty() {
        document.querySelectorAll('.num-of-favorite').forEach(item => {item.textContent = data.length})
        if (data.length === 0) {
            let htmlContent =  `<div class="my-5 mx-auto">
                                    <h3>Your favorites list is empty, please go back to <a style="color: black" href="index.html">homepage</a></h3>
                                </div>
                                `
            dataPanel.innerHTML = htmlContent
            pagination.querySelector('#next-page').parentElement.classList.add('d-none')
        } else {
          totalPages = Math.ceil(data.length / ITEM_PER_PAGE)
          if (modeStatus === 'card-mode') {
            let UserCard = dataPanel.querySelector('.card-deck').querySelectorAll('.user-card')
            let NumNone = [...UserCard].filter(item => item.classList.contains('d-none')).length
            //該頁面的人都被移除的話，自動跳轉到第一頁
            if (UserCard.length === NumNone) {
              getAllPagination(totalPages)
              getPageData(1, data)
            }
          }
          else if (modeStatus === 'list-mode') {
            let UserList = dataPanel.querySelector('.list-group').querySelectorAll('.user-list')
            let NumNone = [...UserList].filter(item => item.classList.contains('d-none')).length
            //該頁面的人都被移除的話，自動跳轉到第一頁
            if (UserList.length === NumNone) {
              getAllPagination(totalPages)
              getPageData(1, data)
            }
          }
        }
      }

    //切換顯示方式
    displayMode.addEventListener('click', event => {
      if (event.target.matches('.mode-icon')) {
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

    //建立用戶資訊卡
    function createUserCard (data, parent) {
        let userCard = document.createElement('div')
        userCard.classList.add('user-card', 'card', 'p-2', 'my-5')
        userCard.innerHTML = `
              <i class="mr-3 mt-3 fas fa-heart text-right"></i>
              <div class="p-4 user-img">
                <img src="${data.avatar}" data-toggle="modal" data-target="#show-user-modal" data-id="${data.id}" class="btn-show-user rounded-circle card-img-top mx-auto img-fluid ${data.gender}">
              </div>
              <div class="card-body d-flex flex-column align-items-center">
                <span class="card-id d-none">${data.id}</span>
                <h5 class="card-title">${data.name} ${data.surname}</h5>
                <p class="card-text"><img class='mr-2 mb-1 flag' src="">${data.region}</p>
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
              <i class="my-auto fas fa-heart text-left"></i>
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
  
      data.forEach(data=> {
        if (data.id === Number(id)){
          modalTitle.innerHTML = `<i class="fas fa-address-card mr-2"></i>${data.name} ${data.surname}`
          modalImage.innerHTML = `<img src="${data.avatar}" data-id=${data.id} class="img-fluid rounded-circle" alt="Responsive image">`
          modalDate.innerHTML = `<i class="fas fa-baby mr-2"></i>${data.birthday}`
          modalRegion.innerHTML = `<img src="${data.flag}" class='mr-2 mb-1 flag'>${data.region}`
          modalAge.innerHTML = `<i class="fas fa-user mr-2"></i>${data.age} years old`
          modalEmail.innerHTML = `<i class="fas fa-envelope mr-2"></i>${data.email}`
        }
      })
    }
    
    //點擊分頁時的事件
    pagination.addEventListener('click', event => {
        
        if (event.target.tagName === 'A') {
            const activePage = Number(pagination.querySelector('.active').querySelector('.page-link').dataset.page)
            const selectPage = Number(event.target.dataset.page)
            getPageData(selectPage, data)
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
      checkIfEmpty(pageNum, pageData)
    }
    
    function removeFavoriteItem (id) {
        const user = data.find(item => item.id === Number(id))
        data.splice(data.indexOf(user), 1)
        const parent = dataPanel.querySelector(`[data-id="${id}"]`).parentElement.parentElement
        if (parent.classList.contains('row')) {
          parent.parentElement.classList.add('d-none')
        } else {
          parent.classList.add('d-none')
        }
        localStorage.setItem('favoriteUsers', JSON.stringify(data))
        checkIfEmpty()
      }

})()