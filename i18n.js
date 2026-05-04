// ════════════════════════════════════════════════════════════════════
//  Internationalization — English (default) + Russian
// ════════════════════════════════════════════════════════════════════

let LANG = (function () {
  try {
    const saved = localStorage.getItem('wealth.lang');
    if (saved === 'en' || saved === 'ru') return saved;
  } catch (_) {}
  return 'en';
})();

const I18N = {
  en: {
    // ─── document ──────────────────────────────────────────────
    pageTitle: "Where do you stand? — Global income percentile",

    // ─── header ────────────────────────────────────────────────
    eyebrow: "Income percentile calculator",
    heroTitle: 'Where do you stand <em>in the world</em>?',
    subtitle: "Enter your income and see what top percent you're in for any country, union, or region. All amounts in US dollars.",

    // ─── sections ──────────────────────────────────────────────
    secIncome: "1. Your income",
    secCompare: "2. Compare against",
    secResult: "3. Your percentile",

    // ─── salary input ──────────────────────────────────────────
    iEarn: "I earn",
    salaryPlaceholder: "50,000",
    perYear: "per year",
    perMonth: "per month",
    perWeek: "per week",
    perDay: "per day",
    perHour: "per hour",

    // ─── search & groups ───────────────────────────────────────
    searchPlaceholder: "Search a country or union…",
    quickGroups: "Quick groups:",
    metaUnion: "Union/region",
    nothingFound: "Nothing found",

    // ─── map ───────────────────────────────────────────────────
    mapHelp: "Click a country on the map to add it to the comparison",
    mapLoading: "Loading the world map…",
    mapLoadFailed: "Couldn't load the map (offline?) — use search or the group buttons",
    legendNormal: "normal",
    legendInGroup: "in group",
    legendSelected: "selected",
    noData: "no data",

    // ─── selected ──────────────────────────────────────────────
    selectedEmpty: "Nothing selected yet — click a country on the map, pick a union, or use the search",
    clearAll: "clear all",
    chipRemove: "remove",

    // ─── results ───────────────────────────────────────────────
    emptyEnter: "Enter your income",
    emptyEnterSub: "Amount in US dollars per chosen period",
    emptyPick: "Pick a country or group",
    emptyPickSub: "Use the map, search, or quick groups",

    countriesCount: "{n} countries",
    tagMain: "main",
    tagCountry: "country",
    tagGroup: "group",
    tagAiPredicted: "AI predicted",

    top: "Top",
    bottom: "Bottom",
    outOf: "of {n}",

    earnMore: "You earn more than <strong>{p}%</strong> of the adult population",
    earnMoreOnly: "You earn more than only <strong>{p}%</strong> of the adult population",
    nooneAbove: "No one {where} earns more · top <strong>{p}%</strong>",
    onlyOneAbove: "Only <strong>1 person</strong> {where} earns more · top <strong>{p}%</strong>",
    fewAbove: "Only <strong>{n}</strong> adults {where} earn more · top <strong>{p}%</strong>",
    inCountry: "in this country",
    inGroup: "in this group",

    threshMedian: "median",
    thresh10: "top 10%",
    thresh1: "top 1%",
    thresh01: "top 0.1%",

    source: "Source:",
    sourceModeled: "log-normal model",
    sourceDirect: "piecewise interpolation",
    groupSrcCountries: "{n} countries · {parts}",
    groupSrcDirect: "{n} direct (WID/WB)",
    groupSrcModeled: "{n} log-normal",
    groupSrcPredicted: "{n} AI predicted",

    // ─── people list ───────────────────────────────────────────
    peopleHeader: 'Richer than you — per <a href="{url}" target="_blank" rel="noopener">Forbes</a>',
    peopleCaveat: "compares total net worth, not annual income — public data on individual annual salary worldwide does not exist",
    peopleMore: "+ {n} more known to Forbes",

    // ─── methodology footer ────────────────────────────────────
    methodologySummary: "Methodology & sources",
    method1html: '<strong>Data sources.</strong> <a href="https://wid.world/" target="_blank" rel="noopener">World Inequality Database (WID.world)</a> — income percentile thresholds for major economies; <a href="https://data.worldbank.org/" target="_blank" rel="noopener">World Bank Open Data</a> — mean income (GDP per capita) and Gini coefficient; <a href="https://www.oecd.org/en/data.html" target="_blank" rel="noopener">OECD Income Distribution Database</a> — for OECD countries.',
    method2html: '<strong>Methodology.</strong> Where direct WID data is available we use piecewise log-linear interpolation between the published P10 / P25 / P50 / P75 / P90 / P95 / P99 thresholds. For other countries, the income distribution is approximated by a log-normal model with parameters derived from mean income and the Gini coefficient (a standard approach in inequality economics). Above the highest known percentile we extrapolate with a Pareto tail (alpha fitted from the slope between P95 and P99). For unions and regions, country distributions are aggregated weighted by adult population.',
    method3html: '<strong>Source labels</strong> on each card: "WID.world" / "World Bank" — direct published data; "log-normal model" — log-normal approximation from Gini; "AI predicted" — no open data available, rough estimate.',
    method4html: 'All figures expressed as annual income in US dollars (nominal, not PPP), latest available year (typically 2021–2023). This is a simplified model — it does not account for regional variation within countries, taxes, cost of living, or the shadow economy.',
    method5html: '<strong>The "richer than you" list.</strong> The named list appears on a card only when you fall in the very top rows (top &lt; 0.5%). Source — <a href="https://www.forbes.com/billionaires/" target="_blank" rel="noopener">Forbes 2026 World&#39;s Billionaires List</a> (March release + real-time updates, verified May 2026). The list shows <em>total net worth</em>, not annual income — public data on individual annual salary worldwide does not exist.',
  },

  ru: {
    pageTitle: "Где вы стоите? — Перцентиль вашего дохода в мире",

    eyebrow: "Калькулятор перцентиля дохода",
    heroTitle: 'Где вы стоите <em>в мире</em>?',
    subtitle: "Введите свой доход и узнайте, в какой топ-процент вы попадаете в любой стране, союзе или регионе. Все суммы в долларах США.",

    secIncome: "1. Ваш доход",
    secCompare: "2. С чем сравнить",
    secResult: "3. Ваш перцентиль",

    iEarn: "Я зарабатываю",
    salaryPlaceholder: "50 000",
    perYear: "в год",
    perMonth: "в месяц",
    perWeek: "в неделю",
    perDay: "в день",
    perHour: "в час",

    searchPlaceholder: "Найдите страну или союз…",
    quickGroups: "Быстрые группы:",
    metaUnion: "Союз/регион",
    nothingFound: "Ничего не найдено",

    mapHelp: "Кликните по стране на карте, чтобы добавить её в сравнение",
    mapLoading: "Загрузка карты мира…",
    mapLoadFailed: "Не удалось загрузить карту (работает без интернета?) — используйте поиск или кнопки групп",
    legendNormal: "обычная",
    legendInGroup: "в группе",
    legendSelected: "выбрана",
    noData: "нет данных",

    selectedEmpty: "Ничего не выбрано — кликните по стране на карте, добавьте союз кнопкой выше или найдите через поиск",
    clearAll: "очистить всё",
    chipRemove: "Убрать",

    emptyEnter: "Введите ваш доход",
    emptyEnterSub: "Сумма в долларах за выбранный период",
    emptyPick: "Выберите страну или группу",
    emptyPickSub: "Используйте карту, поиск или быстрые группы",

    countriesCount: "{n} стран",
    tagMain: "основная",
    tagCountry: "страна",
    tagGroup: "группа",
    tagAiPredicted: "AI predicted",

    top: "Топ",
    bottom: "Нижние",
    outOf: "из {n}",

    earnMore: "Вы зарабатываете больше <strong>{p}%</strong> взрослого населения",
    earnMoreOnly: "Вы зарабатываете больше только <strong>{p}%</strong> взрослого населения",
    nooneAbove: "Никто {where} не зарабатывает больше · топ <strong>{p}%</strong>",
    onlyOneAbove: "Вас обгоняет всего <strong>1 человек</strong> {where} · топ <strong>{p}%</strong>",
    fewAbove: "Вас обгоняют только <strong>{n}</strong> взрослых {where} · топ <strong>{p}%</strong>",
    inCountry: "в стране",
    inGroup: "в этой группе",

    threshMedian: "медиана",
    thresh10: "топ 10%",
    thresh1: "топ 1%",
    thresh01: "топ 0.1%",

    source: "Источник:",
    sourceModeled: "log-normal model",
    sourceDirect: "piecewise interpolation",
    groupSrcCountries: "{n} стран · {parts}",
    groupSrcDirect: "{n} direct (WID/WB)",
    groupSrcModeled: "{n} log-normal",
    groupSrcPredicted: "{n} AI predicted",

    peopleHeader: 'Кто богаче — по <a href="{url}" target="_blank" rel="noopener">Forbes</a>',
    peopleCaveat: "сравнивается общий капитал, а не годовой доход — публичных данных по личной годовой зарплате конкретных людей по миру не существует",
    peopleMore: "+ ещё {n} известных по Forbes",

    methodologySummary: "Методология и источники",
    method1html: '<strong>Источники данных.</strong> <a href="https://wid.world/" target="_blank" rel="noopener">World Inequality Database (WID.world)</a> — пороги перцентилей дохода для крупнейших экономик; <a href="https://data.worldbank.org/" target="_blank" rel="noopener">World Bank Open Data</a> — средний доход (GDP per capita) и коэффициент Джини; <a href="https://www.oecd.org/en/data.html" target="_blank" rel="noopener">OECD Income Distribution Database</a> — для стран ОЭСР.',
    method2html: '<strong>Методология.</strong> Где доступны прямые данные WID — используется кусочно-логлинейная интерполяция между порогами P10/P25/P50/P75/P90/P95/P99. Для остальных стран распределение дохода аппроксимируется логнормальной моделью с параметрами, выведенными из среднего дохода и коэффициента Джини (стандартный подход в экономике неравенства). Выше последнего опубликованного перцентиля экстраполируется хвостом Парето (alpha по наклону между P95 и P99). Для союзов и регионов распределения отдельных стран взвешиваются по численности взрослого населения.',
    method3html: '<strong>Метки источников</strong> на каждом результате: «WID.world» / «World Bank» — реальные опубликованные данные; «log-normal model» — логнормальная аппроксимация на основе Джини; «AI predicted» — данных нет в открытом доступе, оценка приближённая.',
    method4html: 'Все цифры приведены к годовому доходу в долларах США (номинальные, не PPP), последний доступный год (как правило, 2021–2023). Это упрощённая модель — она не учитывает региональные различия внутри стран, налоги, стоимость жизни и теневую экономику.',
    method5html: '<strong>Список «Кто богаче».</strong> Поимённый список появляется на карточке, только когда вы попадаете в очень верхние ряды (top &lt; 0,5%). Источник — <a href="https://www.forbes.com/billionaires/" target="_blank" rel="noopener">Forbes 2026 World&#39;s Billionaires List</a> (мартовский релиз + real-time обновления, проверено в мае 2026). В списке указан <em>общий капитал</em>, а не годовой доход — публичных данных по личной годовой зарплате конкретных людей по миру не существует.',
  },
};

function t(key, vars) {
  let s = (I18N[LANG] && I18N[LANG][key]) || (I18N.en && I18N.en[key]) || key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replace(new RegExp('\\{' + k + '\\}', 'g'), v);
    }
  }
  return s;
}

function nameFor(item) {
  if (!item) return '';
  if (LANG === 'ru') return item.name || item.nameRu || item.nameEn || '';
  return item.nameEn || item.name || item.nameRu || '';
}

function descFor(item) {
  if (!item) return '';
  if (LANG === 'ru') return item.description || item.descriptionEn || '';
  return item.descriptionEn || item.description || '';
}

function nameForPerson(p) {
  if (!p) return '';
  if (LANG === 'ru') return p.nameRu || p.nameEn || '';
  return p.nameEn || p.nameRu || '';
}

function applyI18n(root) {
  root = root || document;
  for (const el of root.querySelectorAll('[data-i18n]')) {
    el.textContent = t(el.dataset.i18n);
  }
  for (const el of root.querySelectorAll('[data-i18n-placeholder]')) {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  }
  for (const el of root.querySelectorAll('[data-i18n-html]')) {
    el.innerHTML = t(el.dataset.i18nHtml);
  }
  if (root === document) {
    document.documentElement.lang = LANG;
    document.title = t('pageTitle');
  }
}

function setLang(lang) {
  if (lang !== 'en' && lang !== 'ru') return;
  if (lang === LANG) return;
  LANG = lang;
  try { localStorage.setItem('wealth.lang', lang); } catch (_) {}
  applyI18n();
  for (const btn of document.querySelectorAll('.lang-btn')) {
    btn.classList.toggle('active', btn.dataset.lang === LANG);
  }
  if (typeof onLangChange === 'function') onLangChange();
}

function localeNumFmt() {
  return new Intl.NumberFormat(LANG === 'ru' ? 'ru-RU' : 'en-US');
}
