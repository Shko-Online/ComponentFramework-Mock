import itemEqual from '@shko.online/componentframework-mock/utils/itemEqual';

const arrayEqual = <T>(source: T[], target: T[]) => {
    return (
        Array.isArray(source) &&
        Array.isArray(target) &&
        source.length == target.length &&
        source.every((s) => target.some((t) => itemEqual<T>(s, t)))
    );
};

export default arrayEqual;
