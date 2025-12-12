// バックエンドのID (0-33) を 画像ファイル名 に変換する関数
export const getTileImage = (id: number): string => {
  // 画像フォルダの場所
  const basePath = '/tiles';

  // IDの範囲による分岐
  if (id >= 0 && id <= 8) {
    // 0-8: Manzu (Man1.svg - Man9.svg)
    return `${basePath}/Man${id + 1}.svg`;
  } else if (id >= 9 && id <= 17) {
    // 9-17: Pinzu (Pin1.svg - Pin9.svg)
    return `${basePath}/Pin${id - 9 + 1}.svg`;
  } else if (id >= 18 && id <= 26) {
    // 18-26: Souzu (Sou1.svg - Sou9.svg)
    return `${basePath}/Sou${id - 18 + 1}.svg`;
  } else {
    // 字牌 (27-33)
    // FluffyStuffの標準的なファイル名に対応
    const honors = [
      'Ton',  // 27: 東
      'Nan',  // 28: 南
      'Shaa',  // 29: 西 (ファイル名が Sha.svg の場合もあるので注意)
      'Pei',  // 30: 北
      'Haku', // 31: 白
      'Hatsu',// 32: 發
      'Chun'  // 33: 中
    ];
    // IDが範囲外の場合の安全策
    if (id < 27 || id > 33) return `${basePath}/Back.svg`;
    
    return `${basePath}/${honors[id - 27]}.svg`;
  }
};