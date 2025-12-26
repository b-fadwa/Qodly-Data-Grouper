import config, { IDataGrouperProps } from './DataGrouper.config';
import { T4DComponent, useEnhancedEditor } from '@ws-ui/webform-editor';
import Build from './DataGrouper.build';
import Render from './DataGrouper.render';

const DataGrouper: T4DComponent<IDataGrouperProps> = (props) => {
  const { enabled } = useEnhancedEditor((state) => ({
    enabled: state.options.enabled,
  }));

  return enabled ? <Build {...props} /> : <Render {...props} />;
};

DataGrouper.craft = config.craft;
DataGrouper.info = config.info;
DataGrouper.defaultProps = config.defaultProps;

export default DataGrouper;
