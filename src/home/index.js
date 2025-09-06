console.log("home index.js");


class CountdownCircle {
  /**
   * @param {string} containerSelector - selector của div chứa timer
   * @param {number} totalTime - tổng thời gian đếm ngược (giây)
   * @param {function} onComplete - callback khi hết thời gian
   */
  constructor(containerSelector, totalTime = 60, onComplete = () => {}) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) throw new Error("Container not found");

    this.totalTime = totalTime;
    this.timeLeft = totalTime;
    this.onComplete = onComplete;

    this._createSVG();
    this._updateText();
  }

  _createSVG() {
    const size = 100;
    const radius = 45;
    this.circumference = 2 * Math.PI * radius;

    // tạo HTML
    this.container.innerHTML = `
      <svg width="${size}" height="${size}">
        <circle cx="${size/2}" cy="${size/2}" r="${radius}" stroke="#ccc" stroke-width="10" fill="none"/>
        <circle cx="${size/2}" cy="${size/2}" r="${radius}" stroke="green" stroke-width="10" fill="none"
                stroke-dasharray="${this.circumference}" stroke-dashoffset="0" transform="rotate(-90 ${size/2} ${size/2})"/>
      </svg>
      <div class="time-text" style="
        position:absolute;
        top:50%;
        left:50%;
        transform:translate(-50%, -50%);
        font-size:24px;
        font-weight:bold;
      ">${this.timeLeft}</div>
    `;

    this.progressCircle = this.container.querySelector("circle:nth-child(2)");
    this.timeText = this.container.querySelector(".time-text");
    this.container.style.position = "relative";
  }

  _updateText() {
    this.timeText.textContent = this.timeLeft;
    const offset = this.circumference * (1 - this.timeLeft / this.totalTime);
    this.progressCircle.style.strokeDashoffset = offset;
  }

  start() {
    this.stop(); // dừng nếu đang chạy
    this.timeLeft = this.totalTime;
    this._updateText();

    this.interval = setInterval(() => {
      this.timeLeft--;
      this._updateText();

      if (this.timeLeft <= 0) {
        this.stop();
        this.onComplete();
      }
    }, 1000);
  }

  stop() {
    if (this.interval) clearInterval(this.interval);
  }

  reset() {
    this.stop();
    this.timeLeft = this.totalTime;
    this._updateText();
  }
}

const timer = new CountdownCircle("#timer", 10, () => {
    alert("Time's up!");
  });
  timer.start();