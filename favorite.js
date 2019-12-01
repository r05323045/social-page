import {getAllPagination, showUser, paginationUpdate, displayDataList} from '/module/pageDisplay.js'

(function () {

    const data = JSON.parse(localStorage.getItem('favoriteUsers')) || []
    const dataPanel = document.getElementById('data-panel')
    const pagination = document.getElementById('pagination')
    const displayMode = document.getElementById('display-mode')
    const ITEM_PER_PAGE = 12
    let modeStatus = 'card-mode'
    let totalPages = Math.ceil(data.length / ITEM_PER_PAGE)
    let paginationData = []
    
    getAllPagination(totalPages)
    getPageData(1, data)
    checkIfEmpty()
    
   
    dataPanel.addEventListener('click', event => {
        if (event.target.matches('.fa-heart')) {
            let id = Number(event.target.parentElement.parentElement.querySelector('.card-id').textContent)
            removeFavoriteItem(id)
        } else if (event.target.matches('.btn-show-user')) {
            showUser(event.target.dataset.id, data)
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
    
    //點擊分頁時的事件
    pagination.addEventListener('click', event => {
        
        if (event.target.tagName === 'A') {
            const activePage = Number(pagination.querySelector('.active').querySelector('.page-link').dataset.page)
            const selectPage = Number(event.target.dataset.page)
            getPageData(selectPage, data)
        }
    })

    function getPageData (pageNum, data) {
      paginationData = data || paginationData
      let offset = (pageNum - 1) * ITEM_PER_PAGE
      let pageData = paginationData.slice(offset, offset + ITEM_PER_PAGE)
      displayDataList(pageData, modeStatus)
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