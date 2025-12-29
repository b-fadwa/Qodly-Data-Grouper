import {
  EntityProvider,
  selectResolver,
  updateEntity,
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
  const { connect, emit } = useRenderer();
  const { resolver } = useEnhancedEditor(selectResolver);

  const {
    sources: { datasource: ds, currentElement: currentDs },
  } = useSources();

  const { entities, fetchIndex } = useDataLoader({ source: ds });

  const [value, setValue] = useState<any[]>([]);
  const [groupedData, setGroupedData] = useState<Record<string, any[]>>({});

  // accordion effect
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  //update selected element
  const handleSelectedElementChange = async ({ index }: { index: number }) => {
    if (!ds || !currentDs) return;

    //entity case
    if (currentDs.type === 'entity') {
      await updateEntity({
        index,
        datasource: ds,
        currentElement: currentDs,
        fireEvent: true,
      });

      emit('onselect', {
        index,
        datasourceId: ds.id,
        type: 'entity',
      });
    }

    //object case
    if (currentDs.type === 'scalar' && ds.dataType === 'array') {
      const value = await ds.getValue();
      await currentDs.setValue(null, value[index]);

      emit('onselect', {
        index,
        value: value[index],
        type: 'scalar',
      });
    }
  };

  //read array datasource
  useEffect(() => {
    if (!ds) return;

    const load = async () => {
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
    ds.addListener('changed', load);
    return () => {
      ds.removeListener('changed', load);
    };
  }, [ds]);

  //read entity selection datasource
  useEffect(() => {
    if (ds?.dataType !== 'array') {
      setValue(entities);
    }
  }, [entities, ds]);

  //grouping data
  useEffect(() => {
    if (!groupBy || !value.length) {
      setGroupedData({});
      return;
    }
    const grouped = value.reduce(
      (
        acc: Record<string, { entity: any; originalIndex: number }[]>,
        entity: any,
        originalIndex: number,
      ) => {
        const key = entity[groupBy];
        if (!acc[key]) acc[key] = [];
        acc[key].push({ entity, originalIndex });
        return acc;
      },
      {},
    );

    setGroupedData(grouped);
  }, [value, groupBy]);

  useEffect(() => {
    if (!groupBy) return;

    const initialOpenState = Object.keys(groupedData).reduce(
      (acc: Record<string, boolean>, key) => {
        acc[key] = true;
        return acc;
      },
      {},
    );

    setOpenGroups(initialOpenState);
  }, [groupedData, groupBy]);

  //accordion effect
  const toggleGroup = (groupKey: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  //refacto : data display structure
  const dataStructure = (entity: any, index: any) => {
    return (
      <div
        key={entity.__KEY}
        className="content-box border border-gray-300 rounded-md m-px relative h-full flex-shrink-0 w-full"
        onClick={() => handleSelectedElementChange({ index })}
      >
        <EntityProvider index={index} selection={ds} current={currentDs?.id} iterator={iterator}>
          <Element
            id="dataGrouperItem"
            className="h-full w-full "
            role="dataGrouperItem-content"
            is={resolver.StyleBox}
            canvas
            iterableChild
          />
        </EntityProvider>
      </div>
    );
  };

  //used to check if input is a date
  const isValidDate = (value: string) => {
    const d = new Date(value);
    return !isNaN(d.getTime());
  };

  //used to format date if needed
  const formatDateUS = (date: any): string => {    
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();    

    return  `${month}/${day}/${year}`;
  };

  return (
    <div ref={connect} style={style} className={cn(className, classNames, 'overflow-auto')}>
      <div className="p-2">
        {/* array datasource, with or without groupBy */}
        {ds?.dataType === 'array' && (
          <>
            {groupBy
              ? Object.entries(groupedData).map(([groupKey, items]) => {
                // format date if provided
                  const groupLabel = isValidDate(groupKey)
                    ? formatDateUS(new Date(groupKey))
                    : groupKey;
                  const isOpen = openGroups[groupLabel];

                  return (
                    <div key={groupLabel} className="mb-4">
                      {/* Accordion header */}
                      <div
                        className="category-label font-semibold mb-2 cursor-pointer flex justify-between items-center"
                        onClick={() => toggleGroup(groupLabel)}
                      >
                        <span>{groupLabel}</span>
                        <span className="text-sm">{isOpen ? '−' : '+'}</span>
                      </div>

                      {/* Accordion content */}
                      {isOpen &&
                        items.map(({ entity, originalIndex }) =>
                          dataStructure(entity, originalIndex),
                        )}
                    </div>
                  );
                })
              : value.map((entity, index) => dataStructure(entity, index))}
          </>
        )}
        {/* entitySel datasource with or without groupBy */}
        {ds?.dataType !== 'array' && (
          <>
            {groupBy
              ? Object.entries(groupedData).map(([groupKey, items]) => {
                // format date if provided
                  const groupLabel = isValidDate(groupKey)
                    ? formatDateUS(new Date(groupKey))
                    : groupKey;
                  const isOpen = openGroups[groupLabel];

                  return (
                    <div key={groupLabel} className="mb-4">
                      {/* Accordion header */}
                      <div
                        className="category-label font-semibold mb-2 cursor-pointer flex justify-between items-center"
                        onClick={() => toggleGroup(groupLabel)}
                      >
                        <span>{groupLabel}</span>
                        <span className="text-sm">{isOpen ? '−' : '+'}</span>
                      </div>

                      {/* Accordion content */}
                      {isOpen &&
                        items.map(({ entity, originalIndex }) =>
                          dataStructure(entity, originalIndex),
                        )}
                    </div>
                  );
                })
              : value.map((entity, index) => dataStructure(entity, index))}
          </>
        )}
      </div>
    </div>
  );
};

export default DataGrouper;
