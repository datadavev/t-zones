/* eslint-disable camelcase */
import { html, css, LitElement } from 'lit';

export class SimpleModal extends LitElement {
  static get styles() {
    return css`
      .modal {
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        opacity: 0;
        visibility: hidden;
        transform: scale(1.1);
        transition: visibility 0s linear 0.25s, opacity 0.25s 0s,
          transform 0.25s;
      }

      .modal-content {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: white;
        padding: 1rem 1.5rem;
        width: 24rem;
        border-radius: 0.5rem;
      }

      .close-button {
        float: right;
        width: 1.5rem;
        line-height: 1.5rem;
        text-align: center;
        cursor: pointer;
        border-radius: 0.25rem;
        background-color: lightgray;
      }

      .close-button:hover {
        background-color: darkgray;
      }

      .show-modal {
        opacity: 1;
        visibility: visible;
        transform: scale(1);
        transition: visibility 0s linear 0s, opacity 0.25s 0s, transform 0.25s;
      }
    `;
  }

  static get properties() {
    return {
      state: { type: Boolean },
      body: { type: String },
    };
  }

  constructor() {
    super();
    this.state = false;
    this.body = 'Hello!';
  }

  toggleModal() {
    this.state = !this.state;
    const ele = this.renderRoot.getElementById('modal_id');
    ele.classList.toggle('show-modal');
  }

  static handleKey(e, _this) {
    console.log(e.keyCode);
    if (e.keyCode === 27) {
      _this.toggleModal();
    }
  }

  /*
    connectedCallback() {
        super.connectedCallback();
        document.addEventListener('keydown', (e) => {
            this.handleKey(e, this);
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        document.removeEventListener('keydown', (e) => {
            this.handleKey(e, this);
        });
    }
    */

  // eslint-disable no-unused-vars
  render() {
    return html`
      <div id="modal_id" class="modal">
        <div class="modal-content">
          <span
            class="close-button"
            @click="${this.toggleModal}"
            @keypress="${this.handleKey}"
            >X</span
          >
          <div>${this.body}</div>
        </div>
      </div>
    `;
  }
  // eslint-enable no-unused-vars
}

customElements.define('simple-modal', SimpleModal);
