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
  const [groupedData, setGroupedData] = useState<
    Record<string, { entity: any; originalIndex: number }[]>
  >({});

  //accordion effect
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
      const arr = await ds.getValue();
      await currentDs.setValue(null, arr[index]);

      emit('onselect', {
        index,
        value: arr[index],
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
      await fetchIndex(0);
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

    const grouped: Record<string, { entity: any; originalIndex: number }[]> = {};

    value.forEach((item, index) => {
      const rawKey = item[groupBy];
      //item.groupBy
      const key = normalizeGroupKey(rawKey);
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push({ entity: item, originalIndex: index });
    });

    setGroupedData(grouped);
  }, [value, groupBy]);

  useEffect(() => {
    if (!groupBy) return;

    setOpenGroups((prev) => {
      const next: Record<string, boolean> = {};
      Object.keys(groupedData).forEach((key) => {
        next[key] = prev[key] ?? true;
      });
      return next;
    });
  }, [groupedData, groupBy]);

  //accordion effect
  const toggleGroup = (groupKey: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  //refacto : data display structure
  const dataStructure = (entity: any, index: any) => (
    <div
      key={entity.__KEY ?? index}
      className="content-box border border-gray-300 rounded-md m-px relative h-full flex-shrink-0 w-full"
      onClick={() => handleSelectedElementChange({ index })}
    >
      <EntityProvider index={index} selection={ds} current={currentDs?.id} iterator={iterator}>
        <Element
          id="dataGrouperItem"
          className="h-full w-full"
          role="dataGrouperItem-content"
          is={resolver.StyleBox}
          canvas
          iterableChild
        />
      </EntityProvider>
    </div>
  );

  //used to format it to US format
  const formatDateUS = (key: string) => {
    const [y, m, d] = key.split('-');
    return `${Number(m)}/${Number(d)}/${y}`;
  };

  //makes sure it's a valid date
  const isISODateString = (value: any): value is string =>
    typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);

  //normalize group key
  const normalizeGroupKey = (value: any) => {
    if (value instanceof Date) {
      return value.toISOString().slice(0, 10);
    }

    if (isISODateString(value)) {
      return value;
    }

    return String(value);
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
                  const groupLabel = isISODateString(groupKey) ? formatDateUS(groupKey) : groupKey;
                  const isOpen = openGroups[groupKey];

                  return (
                    <div key={groupKey} className="mb-4">
                      {/* Accordion header */}
                      <div
                        className="category-label font-semibold mb-2 cursor-pointer flex justify-between items-center"
                        onClick={() => toggleGroup(groupKey)}
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
                  const groupLabel = isISODateString(groupKey) ? formatDateUS(groupKey) : groupKey;
                  const isOpen = openGroups[groupKey];

                  return (
                    <div key={groupKey} className="mb-4">
                      {/* Accordion header */}
                      <div
                        className="category-label font-semibold mb-2 cursor-pointer flex justify-between items-center"
                        onClick={() => toggleGroup(groupKey)}
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
