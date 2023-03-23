/* eslint-disable camelcase */
/* eslint import/no-unresolved: [2, { ignore: ['https.*'] }] */
import { html, css, LitElement } from 'https://esm.run/lit';
import { DateTime, Duration } from 'https://esm.run/luxon';

// eslint-disable-next-line no-unused-vars
import { SimpleModal } from './SimpleModal.js';

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
        overflow-x: scroll;
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
      tnow: { state: true },
      _zoneList: { state: true },
    };
  }

  constructor() {
    super();
    const _tnow = DateTime.now();
    this.tnow = DateTime.local(_tnow.year, _tnow.month, _tnow.day, 0, 1);
    this.dmatrix = null;
    this.zones = DEFAULT_ZONES;
    this._zoneList = this.zones.split(',');
    this.czone = DateTime.now().zoneName;
    this.times = '';
    this.offset = 0;
    this.c_col = 0;
  }

  connectedCallback() {
    super.connectedCallback();
    this.generateMatrix();
  }

  updated(changed) {
    if (changed.has('zones')) {
      this._zoneList = this.zones.split(',');
      this.generateMatrix();
    }
  }

  generateMatrix() {
    this.dmatrix = [];
    for (const z of this._zoneList) {
      const dt_row = this.tnow.setZone(z);
      const row = [z, dt_row];
      for (let h = 1; h < 24; h += 1) {
        const dur = Duration.fromObject({ hours: h });
        row.push(dt_row.plus(dur));
      }
      this.dmatrix.push(row);
    }
  }

  columnTimes(col) {
    const res = [];
    const _ct = this.dmatrix[0][col].set({ minute: this.offset });
    for (const rw of this.dmatrix) {
      const _t = _ct.setZone(rw[col].zone);
      res.push(_t.toFormat('yyyy-LLL-dd HH:mm z'));
    }
    return html` <pre id="copy_node">
${res.join('\n')}
      </pre
    >`;
  }

  showTime(e) {
    const col = parseInt(e.target.getAttribute('x-col'), 10);
    this.times = this.columnTimes(col);
    const _this = this;
    this.c_col = col;
    const _target = this.renderRoot.getElementById('dlg1');
    _target.body = _this.times;
    _target.toggleModal();
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
          <simple-modal id="dlg1"></simple-modal>
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
