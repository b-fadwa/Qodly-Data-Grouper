import { EComponentKind, T4DComponentConfig } from '@ws-ui/webform-editor';
import { Settings } from '@ws-ui/webform-editor';
import { LuGroup } from 'react-icons/lu';

import DataGrouperSettings, { BasicSettings } from './DataGrouper.settings';

export default {
  craft: {
    displayName: 'DataGrouper',
    kind: EComponentKind.BASIC,
    props: {
      name: '',
      classNames: [],
      events: [],
    },
    related: {
      settings: Settings(DataGrouperSettings, BasicSettings),
    },
  },
  info: {
    settings: DataGrouperSettings,
    displayName: 'DataGrouper',
    exposed: true,
    icon: LuGroup,
    events: [
      {
        label: 'On Click',
        value: 'onclick',
      },
      {
        label: 'On Blur',
        value: 'onblur',
      },
      {
        label: 'On Focus',
        value: 'onfocus',
      },
      {
        label: 'On MouseEnter',
        value: 'onmouseenter',
      },
      {
        label: 'On MouseLeave',
        value: 'onmouseleave',
      },
      {
        label: 'On KeyDown',
        value: 'onkeydown',
      },
      {
        label: 'On KeyUp',
        value: 'onkeyup',
      },
    ],
    datasources: {
      accept: ['entitysel', 'array'],
    },
  },
  defaultProps: {
    groupBy: '',
    style: {
      height: '400px',
    },
  },
} as T4DComponentConfig<IDataGrouperProps>;

export interface IDataGrouperProps extends webforms.ComponentProps {
  groupBy?: string;
}
