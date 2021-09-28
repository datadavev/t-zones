/* eslint-disable camelcase */
import { html, css, LitElement, render } from 'lit';
import { DateTime, Duration } from 'luxon';
import { openDialog } from 'web-dialog';
import '@github/clipboard-copy-element';

const DEFAULT_ZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Phoenix',
  'US/Pacific',
  'US/Alaska',
  'Pacific/Tahiti',
  'Pacific/Auckland',
  'Australia/Sydney',
  'Australia/Adelaide',
  'Asia/Tokyo',
  'Australia/Perth',
  'Asia/Hong_Kong',
  'Asia/Kathmandu',
  'Europe/Riga',
  'Europe/Paris',
  'Europe/London',
].join(',');

export class TZones extends LitElement {
  // #ffa
  static get styles() {
    return css`
      :host {
        display: block;
        padding: 16px;
        color: var(--t-zones-color, black);
        font-size: var(--t-zones-font-size, 14px);
        font-family: var(--t-zones-font-family, monospace);
        font-weight: var(--t-zones-font-weight, normal);
      }

      table {
        overflow: hidden;
        border: solid 0px gray;
        border-spacing: 0;
      }

      tr.czone {
        color: var(--t-zones-color-current, black);
        font-weight: var(--t-zones-font-weight-current, bold);
      }
      td,
      th {
        position: relative;
        padding-left: 3px;
        padding-right: 3px;
      }
      td.night {
        color: var(--t-zones-night, #888888);
        text-align: right;
      }
      td.day {
        color: var(--t-zones-day, #000000);
        text-align: right;
      }
      tr:hover {
        background-color: var(--t-zones-highlight, #eee);
      }
      td:hover::after,
      th:hover::after {
        content: '';
        position: absolute;
        background-color: var(--t-zones-highlight, #eee);
        left: 0;
        top: -5000px;
        height: 10000px;
        width: 100%;
        z-index: -1;
      }
    `;
  }

  static get properties() {
    return {
      zones: { type: String },
      czone: { type: String },
      times: { type: String },
      tnow: {},
    };
  }

  constructor() {
    super();
    this.tnow = DateTime.utc();
    this.dmatrix = null;
    this.zones = DEFAULT_ZONES;
    this.czone = DateTime.now().zoneName;
    this.times = '';
    this.offset = 0;
    this.c_col = 0;
    this.generateMatrix();
  }

  generateMatrix() {
    this.dmatrix = [];
    for (const z of this.zones.split(',')) {
      const dt_row = this.tnow.setZone(z);
      const row = [z, dt_row];
      for (let h = 1; h < 24; h += 1) {
        const dur = Duration.fromObject({ hours: h });
        row.push(dt_row.plus(dur));
      }
      this.dmatrix.push(row);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  _copied(e) {
    e.target.innerText = 'Copied!';
  }

  columnTimes(col) {
    const res = [];
    const _ct = this.dmatrix[0][col].set({ minute: this.offset });
    for (const rw of this.dmatrix) {
      const _t = _ct.setZone(rw[col].zone);
      res.push(_t.toFormat('yyyy-LLL-dd HH:mm z'));
    }
    return html`
      <style>
        clipboard-copy.button {
          padding: 0.4rem;
          border-radius: 4px;
          border: 1px solid black;
          display: inline-block;
        }      
        web-dialog {
            --dialog-container-padding: 0;
            --dialog-border-radius: 0;
            --dialog-max-width: 500px;
            --dialog-animation-duration: 0;
          }                      
      </style>
      <pre id="times">${res.join('\n')}
      </pre>
      <clipboard-copy style="width:4rem; padding:0.4rem; border-radius:4px; border: 1px solid red; display: inline-block" for="times" class="button" @clipboard-copy="${
        this._copied
      }">Copy</clipboard-copy>
    </div>`;
  }

  showTime(e) {
    const col = parseInt(e.target.getAttribute('x-col'), 10);
    /* if (this.c_col === col) {
      this.offset += 10;
      if (this.offset > 50) {
        this.offset = 0;
      }
    } */
    this.times = this.columnTimes(col);
    const _this = this;
    this.c_col = col;
    openDialog({
      $content: $dialog => {
        render(_this.times, $dialog);
      },
    });
  }

  render() {
    const rm = [];
    for (const rw of this.dmatrix) {
      const row = [rw[0]];
      for (let i = 1; i < rw.length; i += 1) {
        const hv = rw[i].toFormat('HH');
        const hv_f = parseFloat(hv);
        let hv_class = 'night';
        if (hv_f >= 6 && hv_f <= 18) {
          hv_class = 'day';
        }
        row.push(
          // eslint-disable-next-line lit-a11y/click-events-have-key-events
          html`<td
            class="${hv_class}"
            @click="${this.showTime}"
            x-col="${i}"
            title="${rw[i].toFormat('dd-LLL HH:mm ZZ')}"
          >
            ${hv}
          </td>`
        );
      }
      if (rw[1].zoneName === this.czone) {
        rm.push(
          html`<tr class="czone">
            ${row}
          </tr>`
        );
      } else {
        rm.push(
          html`<tr>
            ${row}
          </tr>`
        );
      }
    }
    return html`
          <input type="date" id="tz-date-picker" .value="${this.tnow.toFormat(
            'yyyy-MM-dd'
          )}"></input>
          <table>
              <tbody>
              ${rm}
              </tbody>
          </table>
      `;
  }

  firstUpdated() {
    const picker = this.renderRoot.getElementById('tz-date-picker');
    const _this = this;
    picker.addEventListener('change', event => {
      const _dt = DateTime.fromFormat(event.target.value, 'yyyy-MM-dd');
      _this.tnow = _this.tnow.set({
        year: _dt.year,
        month: _dt.month,
        day: _dt.day,
      });
      _this.generateMatrix();
      if (_this.times !== '') {
        _this.times = this.columnTimes(_this.c_col);
      }
    });
  }
}
