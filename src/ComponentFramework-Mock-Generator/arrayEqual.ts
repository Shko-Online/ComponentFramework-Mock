export const itemEqual = (source, target) => {
    if (source === null && target === null) {
        return true;
    }
    if (typeof source === "object" || typeof target === "object") {
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


export const arrayEqual = <T>(source: T[], target: T[]) => {
    return (
        Array.isArray(source) &&
        Array.isArray(target) &&
        source.length == target.length &&
        source.every((s) => target.some((t) => itemEqual(s, t)))
    );
};

export default arrayEqual;