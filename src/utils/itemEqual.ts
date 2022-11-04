const itemEqual = <T>(source: T, target: T) => {
    if (source === null && target === null) {
        return true;
    }
    if (typeof source === 'object' || typeof target === 'object') {
        const sourceO = source as ComponentFramework.LookupValue;
        const targetO = target as ComponentFramework.LookupValue;
        return (
            sourceO !== null &&
            targetO !== null &&
            sourceO.entityType === targetO.entityType &&
            sourceO.id === targetO.id
        );
    }
    return source === target;
};

export default itemEqual;
