import { html } from 'lit';
import '../t-zones.js';

export default {
  title: 't-zones',
  zones: 'UTC,America/New_York,Pacific/Tahiti',
  component: 't-zones',
  argTypes: {
    zones: { control: 'text' },
    textColor: { control: 'color' },
  },
};

// eslint-disable-next-line no-unused-vars
function Template({
  title = 't-zones',
  zones = 'UTC,America/New_York,Pacific/Tahiti',
  textColor,
}) {
  return html`
    <t-zones style="--t-zones-color: ${textColor || 'black'}" .zones=${zones}>
    </t-zones>
  `;
}

export const Regular = Template.bind({});

export const CustomZones = Template.bind({});
CustomZones.args = {
  title: 't-zones',
  zones: 'UTC,America/New_York,Pacific/Tahiti',
};
