import { EComponentKind, splitDatasourceID, T4DComponentConfig, T4DComponentDatasourceDeclaration } from '@ws-ui/webform-editor';
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
        label: 'On Select',
        value: 'onselect',
      },
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
       declarations: (props: any) => {
        const { currentElement, groupBy, datasource = '' } = props;
        const declarations: T4DComponentDatasourceDeclaration[] = [
          { path: datasource, iterable: true },
          { path: currentElement }
        ];
        if (groupBy ) {
          const { id: ds } = splitDatasourceID(datasource?.trim()) || {};

          if (!ds) {
            return;
          }

          const { id: groupByID } = splitDatasourceID(groupBy);
          declarations.push({
            path: `${datasource}.[].${groupByID}`,
          })
        }
        return declarations;
      },
    },
  },
  defaultProps: {
    iterable: true,
    style: {
      height: '400px',
      overflow: 'auto',
    },
  },
} as T4DComponentConfig<IDataGrouperProps>;

export interface IDataGrouperProps extends webforms.ComponentProps {
  groupBy?: string;
  sumBy?: any[];

}
