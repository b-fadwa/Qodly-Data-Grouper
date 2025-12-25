import {
  EntityProvider,
  selectResolver,
  useDataLoader,
  useEnhancedEditor,
  useRenderer,
  useSources,
} from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useEffect, useState } from 'react';
import { Element } from '@ws-ui/craftjs-core';
import { IDataGrouperProps } from './DataGrouper.config';

const DataGrouper: FC<IDataGrouperProps> = ({
  groupBy,
  iterator,
  style,
  className,
  classNames = [],
}) => {
  const { connect } = useRenderer();
  const { resolver } = useEnhancedEditor(selectResolver);

  const {
    sources: { datasource: ds, currentElement: currentDs },
  } = useSources();

  const { entities, fetchIndex } = useDataLoader({ source: ds });

  const [value, setValue] = useState<any[]>([]);
  const [groupedData, setGroupedData] = useState<Record<string, any[]>>({});

  //read array datasource
  useEffect(() => {
    if (!ds) return;

    const load = async () => {
      console.log('ds.dataType', ds.dataType);
      if (ds.dataType === 'array') {
        const result = await ds.getValue();
        //check if it's a direct array or encapsulated inside object
        const arr = Array.isArray(result)
          ? result
          : Array.isArray(result?.value)
            ? result.value
            : [];
        setValue(arr);
        return;
      }
      fetchIndex(0);
    };

    load();
  }, [ds]);

  //read entity selection datasource
  useEffect(() => {
    if (ds?.dataType !== 'array') {
      setValue(entities);
    }
  }, [entities, ds]);


  //grouping data
  useEffect(() => {
    console.log({ groupBy });
    if (!groupBy || !value.length) {
      setGroupedData({});
      return;
    }
    const grouped = value.reduce(
      (acc: Record<string, any[]>, entity: any, originalIndex: number) => {
        const key = entity[groupBy] ?? 'Others';

        if (!acc[key]) acc[key] = [];

        acc[key].push({
          entity,
          originalIndex,
        });

        return acc;
      },
      {},
    );

    setGroupedData(grouped);
  }, [value, groupBy]);

  return (
    <div ref={connect} style={style} className={cn(className, classNames)}>
      <div className="bg-red-200 p-2">
        {/* array datasource, with or without groupBy */}
        {ds?.dataType === 'array' && (
          <>
            {groupBy
              ? Object.entries(groupedData).map(([groupKey, items]) => (
                  <div key={groupKey} className="mb-4">
                    <div className="font-semibold mb-2">{groupKey}</div>
                    {items.map((entity: any, index: any) => (
                      <div key={entity.__KEY} className="relative h-full flex-shrink-0 w-full">
                        <EntityProvider
                          index={index}
                          selection={ds}
                          current={currentDs?.id}
                          iterator={iterator}
                        >
                          <Element
                            id="dataGrouperItem"
                            className="h-full w-full "
                            role="dataGrouperItem-content"
                            is={resolver.StyleBox}
                            canvas
                          />
                        </EntityProvider>
                      </div>
                    ))}
                  </div>
                ))
              : value.map((entity, index) => (
                  <div key={entity.__KEY} className="relative h-full flex-shrink-0 w-full">
                    <EntityProvider
                      index={index}
                      selection={ds}
                      current={currentDs?.id}
                      iterator={iterator}
                    >
                      <Element
                        id="dataGrouperItem"
                        className="h-full w-full "
                        role="dataGrouperItem-content"
                        is={resolver.StyleBox}
                        canvas
                      />
                    </EntityProvider>
                  </div>
                ))}
          </>
        )}
      </div>
    </div>
  );
};

export default DataGrouper;
