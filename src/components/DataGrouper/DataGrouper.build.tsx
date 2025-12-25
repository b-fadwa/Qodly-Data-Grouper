import {
  IteratorProvider,
  selectResolver,
  useEnhancedEditor,
  useEnhancedNode,
} from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC } from 'react';
import { Element } from '@ws-ui/craftjs-core';
import { IDataGrouperProps } from './DataGrouper.config';

const DataGrouper: FC<IDataGrouperProps> = ({ style, className, classNames = [] }) => {
  const {
    connectors: { connect },
  } = useEnhancedNode();

  const { resolver } = useEnhancedEditor(selectResolver);

  return (
    <div ref={connect} style={style} className={cn(className, classNames)}>
      <div className="p-2 h-full w-full">
        <div className="relative h-1/3 w-full">
          <IteratorProvider>
            <Element
              id="dataGrouperItem"
              className="w-full"
              role="dataGrouperItem-content"
              is={resolver.StyleBox}
              deletable={false}
              canvas
            />
          </IteratorProvider>
        </div>
      </div>
    </div>
  );
};

export default DataGrouper;
