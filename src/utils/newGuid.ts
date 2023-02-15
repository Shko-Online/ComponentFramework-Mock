export function newGuid() {
    const a = [];
    for (let i = 0; i < 31; i++) {
        a[i] = (Math.random() * 16) | 0;
    }

    return (
        a[0].toString(16) +
        a[1].toString(16) +
        a[2].toString(16) +
        a[3].toString(16) +
        a[4].toString(16) +
        a[5].toString(16) +
        a[6].toString(16) +
        a[7].toString(16) +
        '-' +
        a[8].toString(16) +
        a[9].toString(16) +
        a[10].toString(16) +
        a[11].toString(16) +
        '-4' +
        a[12].toString(16) +
        a[13].toString(16) +
        a[14].toString(16) +
        '-' +
        (a[15] & 0x7).toString(16) +
        a[16].toString(16) +
        a[17].toString(16) +
        a[18].toString(16) +
        '-' +
        a[19].toString(16) +
        a[20].toString(16) +
        a[21].toString(16) +
        a[22].toString(16) +
        a[23].toString(16) +
        a[24].toString(16) +
        a[25].toString(16) +
        a[26].toString(16) +
        a[27].toString(16) +
        a[28].toString(16) +
        a[29].toString(16) +
        a[30].toString(16)
    );
}
