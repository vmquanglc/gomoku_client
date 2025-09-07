class PopupShowInformation {
  constructor(context = {}, option = {}) {
    this.message = context.message ?? "";
    this.timeout = option.timeout;
  }

  show() {
    this.popupElement ??= document.createElement("div");
    this.popupElement.innerHTML = `
      <div style="
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex; align-items: center; justify-content: center;
        z-index: 9999;
      ">
        <div style="
          background: white;
          padding: 20px;
          border-radius: 8px;
          min-width: 200px;
          text-align: center;
        ">
          <p>${this.message}</p>
        </div>
      </div>
    `;
    document.body.appendChild(this.popupElement);

    if (this.timeout > 0) {
      setTimeout(() => {
        this.close();
      }, this.timeout);
    }
  }

  close() {
    if (!this.popupElement) {
      return;
    }
    document.body.removeChild(this.popupElement);
    this.popupElement = null;
  }
}
