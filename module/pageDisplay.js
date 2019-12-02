let paginationData = []
const ITEM_PER_PAGE = 12
//建立用戶資訊卡
function createUserCard (data, parent) {
    let userCard = document.createElement('div')
    userCard.classList.add('user-card', 'card', 'p-2', 'my-5')
    userCard.innerHTML = `
          <div>
            <i class="mr-3 mt-3 fas fa-heart heart-of-card d-none text-right"></i>
          </div>
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
        <div class="row d-flex flex-nowrap">
          <div class="col-1">
            <i class="my-auto fas fa-heart heart-of-list d-none"></i>
          </div>
          <div class="user-img col-4 col-sm-2 text-center">
            <img src="${data.avatar}" data-toggle="modal" data-target="#show-user-modal" data-id="${data.id}" class="list-img btn-show-user rounded-circle mx-auto img-fluid ${data.gender}">
          </div>
          <span class="card-id d-none">${data.id}</span>
          <h5 class="card-title my-auto col-3 text-center">${data.name} ${data.surname}</h5>
          
          <div class="my-auto card-text col-1 col-sm-2 col-md-3 d-flex align-items-center text-center"><img class='mb-1 flag mx-auto mx-md-3' src="${data.flag}"><span class="d-none d-md-block">${data.region}</span></div>
          <div class="my-auto text-center d-none d-sm-block col-sm-2 col-md-1">  
            <i class="my-auto fas fa-${data.gender}"></i>
          </div>
          <span class="text-center my-auto age col-3 col-sm-2">${data.age}歲</span>
        </div>`
  parent.appendChild(userList)
}

function favoriteCheck (modeStatus) {
  const dataPanel = document.getElementById('data-panel')
  const favoritelist = JSON.parse(localStorage.getItem('favoriteUsers')) || []
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
//顯示整頁的社群用戶
export function displayDataList(datalist, modeStatus) {
    const dataPanel = document.getElementById('data-panel')
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
    favoriteCheck (modeStatus)
}

//分頁資訊
export function paginationUpdate (selectPage, data) {
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
  let numPaginationShow = 10  //在分頁區塊只顯示10個分頁
  if (window.matchMedia( "(min-width: 576px)" ).matches) {
  } else {
    numPaginationShow = 5
  }
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
export function getAllPagination (totalPages) {

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

export function getPageData (pageNum, modeStatus, data) {
  paginationData = data || paginationData
  let offset = (pageNum - 1) * ITEM_PER_PAGE
  let pageData = paginationData.slice(offset, offset + ITEM_PER_PAGE)
  displayDataList(pageData, modeStatus)
  paginationUpdate(pageNum, paginationData)
}

//點擊用戶圖片時，觸發用戶modal
export function showUser (id, alldata) {
    const favoritelist = JSON.parse(localStorage.getItem('favoriteUsers')) || []
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