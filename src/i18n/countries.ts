/**
 * zh↔en display names for film countries. Countries are stored as the
 * editors' Chinese vocabulary (`films.countries text[]`); /en pages map
 * them for display, and en filter params (`/en/films?country=France`)
 * reverse-map to the stored zh value for the query. Unmapped names fall
 * back to the raw string so a new country never breaks a page.
 */
const COUNTRY_EN: Record<string, string> = {
  法国: "France",
  美国: "United States",
  日本: "Japan",
  意大利: "Italy",
  瑞典: "Sweden",
  苏联: "Soviet Union",
  德国: "Germany",
  西德: "West Germany",
  东德: "East Germany",
  丹麦: "Denmark",
  墨西哥: "Mexico",
  印度: "India",
  英国: "United Kingdom",
  西班牙: "Spain",
  波兰: "Poland",
  捷克斯洛伐克: "Czechoslovakia",
  匈牙利: "Hungary",
  奥地利: "Austria",
  瑞士: "Switzerland",
  比利时: "Belgium",
  荷兰: "Netherlands",
  希腊: "Greece",
  葡萄牙: "Portugal",
  挪威: "Norway",
  芬兰: "Finland",
  巴西: "Brazil",
  阿根廷: "Argentina",
  加拿大: "Canada",
  澳大利亚: "Australia",
  韩国: "South Korea",
  中国: "China",
  中国香港: "Hong Kong",
  中国台湾: "Taiwan",
  伊朗: "Iran",
};

const COUNTRY_ZH = new Map(Object.entries(COUNTRY_EN).map(([zh, en]) => [en, zh]));

export function countryToEn(zh: string): string {
  return COUNTRY_EN[zh] ?? zh;
}

export function countryToZh(en: string): string {
  return COUNTRY_ZH.get(en) ?? en;
}
