//宣告遊戲的各個狀態
const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}


//置入花色圖片，之後用陣列方法呼叫
const Symbols = [
  'https://image.flaticon.com/icons/svg/105/105223.svg', // 黑桃
  'https://image.flaticon.com/icons/svg/105/105220.svg', // 愛心
  'https://image.flaticon.com/icons/svg/105/105212.svg', // 方塊
  'https://image.flaticon.com/icons/svg/105/105219.svg' // 梅花
]


//視覺相關的函式放這裡
const view = {
  //建立每一張牌(一個div)，並把index放到資料屬性中(之後可以呼叫)，並在class裡面加一個可以識別正反面的"card back"
  getCardElement(index) {
    return `<div data-index="${index}" class="card back"></div>`
  },

  //加上牌正面的數字花色
  getCardContent(index) {
    //transformNumber(number)是確認數字的顯示，共有1-13的數字
    const number = this.transformNumber((index % 13) + 1)
    //四個花色
    const symbol = Symbols[Math.floor(index / 13)]
    //return value，不能換行
    return `
      <p>${number}</p>
      <img src="${symbol}">
      <p>${number}</p>`
  },

  //用switch語法將1,11,12,13轉為A,J,Q,k
  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      //剩下的就回傳數字  
      default:
        return number
    }
    //記得加逗號  
  },

  //把卡片從牌桌上畫出來
  displayCards(indexes) {
    //監聽器放牌桌
    const rootElement = document.querySelector('#cards')
    //用map把隨機排列的52張牌加上div
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join("")
    //join()是用來在各個元素中加上空白
  },

  //翻牌
  //加上其餘參數 (rest parameters)...可以把參數變成陣列，程式就可以處理多個參數
  flipCards(...cards) {
    cards.map(card => {
      //用classList判斷是否有包含back
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      card.classList.add('back')
      card.innerHTML = null
    })
  },

  //完成配對後加上樣式
  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },

  //畫上分數
  renderScore(score) {
    document.querySelector(".score").innerHTML = `Score: ${score}`;
  },

  //畫次數
  renderTriedTimes(times) {
    document.querySelector(".tried").innerHTML = `You've tried: ${times} times`;
  },

  //錯誤的動畫
  appendWrongAnimation(...cards) {
    cards.map(card => {
      //加上css選擇器，讓動畫出現
      card.classList.add('wrong')
      //css動畫出現一次之後，不能重複加上去，所以先消除class name，後面點的時候就可以再出現
      card.addEventListener('animationend', event => event.target.classList.remove('wrong'), { once: true })
      // { once: true } 是要求在事件執行一次之後卸載監聽器，因為同一張卡片可能會被點錯好幾次
    })
  },

  //結束畫面
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>`
    const header = document.querySelector('#header')
    header.before(div)
  },

}


//資料管理
const model = {
  //用來確認兩張翻開的牌配對狀況
  revealedCards: [],

  //檢查配對狀況
  isRevealedCardMatched() {
    //比對 revealedCards 陣列中暫存的兩個值
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },

  //分數紀錄
  score: 0,

  //次數記錄
  triedTimes: 0,
}


//負責依遊戲狀態來分配動作
const controller = {
  //初始狀態
  currentState: GAME_STATE.FirstCardAwaits,

  //隨機產生52張牌卡
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  //依照不同的遊戲狀態，做不同的行為 => 翻牌為判斷依據
  dispatchCardAction(card) {
    //如果是正面，不做改變
    if (!card.classList.contains('back')) {
      return
    }
    switch (this.currentState) {
      //如果是第一張牌，翻牌等下張
      case GAME_STATE.FirstCardAwaits:
        //只要切換至 SecondCardAwaits，嘗試次數就要 +1
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        //把翻開的牌丟到revealed陣列裡面
        model.revealedCards.push(card)
        //狀態改變為等第二張牌
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      case GAME_STATE.SecondCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        //判斷配對是否成功
        if (model.isRevealedCardMatched()) {
          //配對成功
          view.renderScore(model.score += 10) //分數 +10
          this.currentState = GAME_STATE.CardsMatched
          //被呼叫太多次
          // view.pairCard(model.revealedCards[0])
          // view.pairCard(model.revealedCards[1])
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()  // 加在這裡
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
          // model.revealedCards = []
          // this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          //配對失敗
          //設定翻回去的時間
          this.currentState = GAME_STATE.CardsMatchFailed
          //呼叫動畫
          view.appendWrongAnimation(...model.revealedCards)
          //setTimeout要呼叫函式本身，如果加上()是呼叫函式結果，會失敗不能用
          setTimeout(this.resetCards, 1000)
        }
        break
    }
  },

  resetCards() {
    //被呼叫太多次
    // view.flipCard(model.revealedCards[0])
    // view.flipCard(model.revealedCards[1])
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    // 這邊不能用this，因為上面setTimeout呼叫this之後，this就變成setTimeout
    controller.currentState = GAME_STATE.FirstCardAwaits
  },
}


//創建52張牌，已經過洗牌(隨機)
const utility = {
  getRandomNumberArray(count) {
    //Array.from(N)會建立一個連續數字陣列，裡面有空的內容N個
    const number = Array.from(Array(count).keys())
    //傅立葉演算法
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        //解構賦值，一定要加分號
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

controller.generateCards()
//node lis => forEach; array => map()
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
    console.log(model.revealedCards)
  })
})

