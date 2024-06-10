import './style.css'
const canvas = document.getElementById("canvas") as HTMLCanvasElement
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
import adjective from './data/adjective'
import nouns from './data/nouns'
import verbs from './data/verbs'
import background from './background.mp3'
import correct from './correct.mp3'
import wrong from './wrong.mp3'
import over from './over.mp3'

const allWords = [...adjective, ...nouns, ...verbs]

// utility functions to get random words
const randomIndex = (length: number) => Math.floor(Math.random() * length)
const randomWord = () => allWords[randomIndex(allWords.length)]

// Set the canvas size
const SCALE = 4
let WIDTH = canvas.width = SCALE * window.innerWidth
let HEIGHT = canvas.height = SCALE * window.innerHeight

// Utility function to scale a number
const scaled = (n: number) => n * SCALE

// Context settings
ctx.font = `${scaled(30)}px Poppins`
ctx.textBaseline = "middle"
ctx.textAlign = "center"
ctx.lineCap = "round"
ctx.lineJoin = "round"
ctx.lineWidth = scaled(3)
ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
ctx.shadowBlur = scaled(10)
ctx.shadowOffsetX = scaled(5)
ctx.shadowOffsetY = scaled(5)

let bgSound = new Audio(background)
bgSound.loop = true
bgSound.play()

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

let wordsLeft = 5;


class Word {
  x: number
  y: number
  text: string
  speed: number;
  color: string;
  constructor(text: string) {
    this.x = WIDTH / 2 + randomBetween(-WIDTH / 4, WIDTH / 4)
    this.y = 0
    this.text = text
    this.speed = scaled(2);
    this.color = `hsl(${randomIndex(360)}, 50%, 30%)`
  }

  draw = () => {
    if (this.text.length === 0) return
    const textWidth = ctx.measureText(this.text).width + scaled(40)
    const textHeight = parseInt(ctx.font) + scaled(25)
    const rectX = this.x - textWidth / 2
    const rectY = this.y - textHeight / 2
    const rectWidth = textWidth
    const rectHeight = textHeight

    // Draw the rectangle
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.roundRect(rectX, rectY, rectWidth, rectHeight, scaled(10))
    ctx.fill()
    ctx.stroke()
    // Draw the text
    ctx.fillStyle = "white"
    ctx.fillText(this.text, this.x, this.y + textHeight / 30)
  }

  update = () => {
    this.y += this.speed
  }
}

const words: Word[] = []
let lastTime = 0
let id: number;

let score = 0


function loop(time = 0) {
  const delta = time - lastTime
  if (delta > 2000) {
    lastTime = time
    const word = new Word(randomWord())
    words.push(word)
  }
  // Clear the canvas
  ctx.clearRect(0, 0, WIDTH, HEIGHT)

  // Draw and update the words
  words.forEach(word => {
    word.draw()
    word.update()
  })

  // Check if the word has reached the bottom
  if (words.length > 0 && words[0].y > HEIGHT) {
    words.shift()
    wordsLeft -= 1
    if (wordsLeft === 0) {
      cancelAnimationFrame(id)
      showScore()
      return  // Stop the loop
    }
  }
  showCards()
  id = requestAnimationFrame(loop)
}

loop();


function showCards() {
  // Show socrecard and words left on the screen at top left corner
  const scoreCard = new Word(`Score: ${score}`)
  scoreCard.x = scaled(70)
  scoreCard.y = scaled(40)
  scoreCard.color = "black"
  scoreCard.draw()

  const wordsLeftCard = new Word(`Words left: ${wordsLeft}`)
  wordsLeftCard.x = scaled(100)
  wordsLeftCard.y = scaled(80)
  wordsLeftCard.color = "black"
  wordsLeftCard.draw()
}


// Show scorecard at the end of the game
function showScore() {
  // Play background sound
  bgSound.pause()

  // Play the game over sound
  const overSound = new Audio(over)
  overSound.play()
  ctx.clearRect(0, 0, WIDTH, HEIGHT)
  const text = `Game Over! Your score is ${score}`
  const scoreWord = new Word(text)
  scoreWord.x = WIDTH / 2
  scoreWord.y = HEIGHT / 2
  ctx.font = `${scaled(40)}px Poppins`
  scoreWord.draw()

  // After 5 seconds, reload the page
  setTimeout(() => {
    window.location.reload()
  }, 5000)
}


window.addEventListener("keydown", (e) => {
  // User should be able to type the word to remove it
  const key = e.key
  if (words.length === 0) return
  if (words[0].text[0] === key) {
    // Play the correct sound
    const correctSound = new Audio(correct)
    correctSound.play()
    words[0].text = words[0].text.slice(1)
  } else {
    // Play the wrong sound
    const wrongSound = new Audio(wrong)
    wrongSound.play()
  }
  if (words[0].text.length === 0) {
    words.shift()
    score += 1
  }
})

window.addEventListener("resize", () => {
  window.location.reload()
})