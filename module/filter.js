export let filterResults = {gender: {save: false, select: []}, region: {save: false, select: []}, age: {save: false, select: []}}
export function filterEvent () {
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
        if (event.target.matches('.clear-filter')) {
            filterResults.age.save = false
            filterResults.age.select = []
            let rangeSlider = document.querySelector(".range-slider").querySelectorAll('input')
            document.querySelectorAll(".slider-value")[0].textContent = `${rangeSlider[0].min} 歲`
            document.querySelectorAll(".slider-value")[1].textContent = `${rangeSlider[0].max} 歲`
            rangeSlider[0].value = rangeSlider[0].min
            rangeSlider[1].value = rangeSlider[0].max
        }
    })
    return filterResults
}
//決定filter按鈕顏色
export  function filterButton () {
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
//3步驟篩選
export function filterProcess (alldata) {
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
    return results
  }