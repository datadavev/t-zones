/**
 * This is a draft implementation for a simple modal dialog.
 *
 * Event flow between host and UI needs to be cleaned up - the roles
 * are not clear right now, but it works ok for this use case.
 */

/* eslint-disable camelcase */
import { html, css, LitElement } from 'lit';

async function copyNode(node) {
  if ('clipboard' in navigator) {
    return navigator.clipboard.writeText(node.textContent || '');
  }
  const selection = getSelection();
  if (selection == null) {
    return Promise.reject(new Error());
  }
  selection.removeAllRanges();
  const range = document.createRange();
  range.selectNodeContents(node);
  selection.addRange(range);
  document.execCommand('copy');
  selection.removeAllRanges();
  return Promise.resolve();
}

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

      .copy_button {
        padding: 0.4rem;
        border-radius: 4px;
        border: 1px solid black;
        display: inline-block;
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

  async handleCopy() {
    const _copy_node = this.renderRoot.getElementById('copy_node');
    await copyNode(_copy_node);
    const notice = this.renderRoot.querySelector('.notice');
    const label = this.renderRoot.querySelector('.label');
    label.hidden = true;
    notice.hidden = false;
    setTimeout(() => {
      notice.hidden = true;
      label.hidden = false;
    }, 1000);
  }

  async handleKey(e) {
    if (e.keyCode === 27) {
      if (this.state) {
        this.toggleModal();
      }
      return;
    }
    if (e.keyCode === 13) {
      this.handleCopy();
    }
  }

  connectedCallback() {
    super.connectedCallback();
    const _this = this;
    document.addEventListener('keydown', e => {
      _this.handleKey(e);
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    const _this = this;
    document.removeEventListener('keydown', e => {
      _this.handleKey(e);
    });
  }

  // eslint-disable no-unused-vars
  render() {
    return html`
      <div id="modal_id" class="modal">
        <div class="modal-content">
          <button
            id="close_button"
            class="close-button"
            @click="${this.toggleModal}"
            @keyup="${this.toggleModal}"
          >
            X
          </button>
          <div>${this.body}</div>
          <div
            id="copy_button"
            class="copy_button"
            @click="${this.handleCopy}"
            @keyup="${this.handleCopy}"
            role="button"
            tabindex="0"
          >
            <span class="label">Copy</span
            ><span class="notice" hidden>Copied!</span>
          </div>
        </div>
      </div>
    `;
  }
  // eslint-enable no-unused-vars
}

customElements.define('simple-modal', SimpleModal);
