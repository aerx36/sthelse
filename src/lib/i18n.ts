export type Locale = 'vi' | 'en' | 'zh' | 'ko' | 'ja' | 'ru' | 'fr'

export const locales: { id: Locale; label: string; native: string; flag: string }[] = [
  { id: 'vi', label: 'Tiếng Việt', native: 'VI', flag: '🇻🇳' },
  { id: 'en', label: 'English', native: 'EN', flag: '🇬🇧' },
  { id: 'zh', label: '简体中文', native: '中', flag: '🇨🇳' },
  { id: 'ko', label: '한국어', native: '한국', flag: '🇰🇷' },
  { id: 'ja', label: '日本語', native: '日本', flag: '🇯🇵' },
  { id: 'ru', label: 'Русский', native: 'РУ', flag: '🇷🇺' },
  { id: 'fr', label: 'Français', native: 'FR', flag: '🇫🇷' },
]

type Copy = Record<string, string>

const copy: Record<Locale, Copy> = {
  vi: {
    theme: 'MÀU', language: 'NGÔN NGỮ', soundOn: 'ÂM THANH BẬT', soundOff: 'ÂM THANH TẮT',
    hero: 'Không biết xem gì?', subhero: 'Bạn không cần một đích đến. Chỉ cần một chút tò mò.',
    chooseMode: 'Chọn chế độ khám phá', weirdHint: 'Những điều kỳ lạ', learnHint: 'Hiểu thêm một chút', exploreHint: 'Đi xa thêm một chút', chaosHint: 'Để vũ trụ quyết định',
    weirdDesc: 'Một chút kỳ lạ. Một chút không thể giải thích.', learnDesc: 'Một điều mới. Một góc nhìn khác.', exploreDesc: 'Những nơi xa lạ. Những thế giới chưa biết.', chaosDesc: 'Không quy luật. Không đoán trước. Cứ đi thôi.',
    rolling: 'ROLLING', shuffling: 'SHUFFLING', roll: 'ROLL', discovering: 'Đang tìm một khám phá mới…', drawLabel: 'Lá bài đang được mở', cardLabel: 'Một lá bài úp mặt', cardOpening: 'Lá bài {n} trên {total}, đang được mở', noChoice: 'Một lối rẽ. Không cần lựa chọn.', shuffleAgain: '↻ XÁO LẠI',
    noAccount: 'Không tài khoản. Không đích đến.', curiosity: 'Một chút tò mò, một chút bất ngờ.', sideQuest: 'MỘT CHUYẾN ĐI NHỎ CHO TÂM TRÍ.', powered: 'ĐƯỢC VẬN HÀNH BỞI SỰ TÒ MÒ & WIKIPEDIA', what: 'ĐÂY LÀ GÌ?', github: 'GITHUB',
    detour: 'sthelse / MỘT LỐI RẼ NHỎ', discovery: 'KHÁM PHÁ', resultNote: 'Không phải bài kiểm tra. Chỉ là cách sự tò mò dẫn đường.',
    aboutEyebrow: 'MỘT LỐI THOÁT NHỎ KHỎI THUẬT TOÁN', aboutTitle: 'Đi lạc một chút.', close: 'Đóng giới thiệu', aboutEnd: 'KHÔNG CẦN ĐÍCH ĐẾN. ↗',
    imageRetry: 'Thử tải lại ↻', explore: 'Khám phá', sourceVietnamese: 'NỘI DUNG TIẾNG VIỆT', sourceEnglish: 'NỘI DUNG GỐC · ENGLISH', original: 'NGUỒN GỐC, LUÔN LUÔN.', curious: 'TÒ MÒ THÊM MỘT CHÚT.',
  },
  en: {
    theme: 'THEME', language: 'LANGUAGE', soundOn: 'SOUND ON', soundOff: 'SOUND OFF',
    hero: 'Not sure what to watch?', subhero: 'You do not need a destination. Just a little curiosity.',
    chooseMode: 'Choose a discovery mode', weirdHint: 'Strange things', learnHint: 'Learn a little more', exploreHint: 'Go a little farther', chaosHint: 'Let the universe decide',
    weirdDesc: 'A little strange. A little unexplainable.', learnDesc: 'Something new. Another point of view.', exploreDesc: 'Unfamiliar places. Unknown worlds.', chaosDesc: 'No rules. No predictions. Just go.',
    rolling: 'ROLLING', shuffling: 'SHUFFLING', roll: 'ROLL', discovering: 'Finding a new discovery…', drawLabel: 'A card is opening', cardLabel: 'One facedown card', cardOpening: 'Card {n} of {total}, opening', noChoice: 'One little detour. No choice required.', shuffleAgain: '↻ SHUFFLE AGAIN',
    noAccount: 'No account. No destination.', curiosity: 'A little curiosity, a little surprise.', sideQuest: 'A SIDE QUEST FOR YOUR MIND.', powered: 'POWERED BY CURIOSITY & WIKIPEDIA', what: 'WHAT IS THIS?', github: 'GITHUB',
    detour: 'sthelse / YOUR LITTLE DETOUR', discovery: 'DISCOVERY', resultNote: 'Not a test. Just one way curiosity finds a path.',
    aboutEyebrow: 'A SMALL ESCAPE FROM THE ALGORITHM', aboutTitle: 'Get a little lost.', close: 'Close introduction', aboutEnd: 'NO DESTINATION REQUIRED. ↗',
    imageRetry: 'Try again ↻', explore: 'Explore', sourceVietnamese: 'VIETNAMESE CONTENT', sourceEnglish: 'ORIGINAL CONTENT · ENGLISH', original: 'ORIGINAL SOURCE, ALWAYS.', curious: 'A LITTLE MORE CURIOUS.',
  },
  zh: {
    theme: '主题', language: '语言', soundOn: '声音 开', soundOff: '声音 关', hero: '不知道看什么？', subhero: '不需要目的地，只需要一点好奇心。',
    chooseMode: '选择探索模式', weirdHint: '奇怪的事', learnHint: '再了解一点', exploreHint: '走得更远一点', chaosHint: '让宇宙决定', weirdDesc: '有一点奇怪，有一点无法解释。', learnDesc: '一个新发现，一个新角度。', exploreDesc: '陌生的地方，未知的世界。', chaosDesc: '没有规则，不可预测，出发吧。',
    rolling: '正在滚动', shuffling: '正在洗牌', roll: '开始', discovering: '正在寻找新的发现…', drawLabel: '正在翻开卡片', cardLabel: '一张背面朝上的卡片', cardOpening: '第 {n} 张，共 {total} 张，正在打开', noChoice: '一条小岔路，不需要选择。', shuffleAgain: '↻ 再洗一次',
    noAccount: '无需账户，无需目的地。', curiosity: '一点好奇，一点惊喜。', sideQuest: '给心灵的一次小冒险。', powered: '由好奇心与维基百科驱动', what: '这是什么？', github: 'GITHUB', detour: 'sthelse / 你的小岔路', discovery: '发现', resultNote: '不是测试，只是好奇心带路的一种方式。', aboutEyebrow: '逃离算法的小小出口', aboutTitle: '迷路一会儿。', close: '关闭介绍', aboutEnd: '无需目的地。↗', imageRetry: '重试 ↻', explore: '探索', sourceVietnamese: '越南语内容', sourceEnglish: '原始内容 · 英语', original: '始终保留原始来源。', curious: '再多一点好奇。',
  },
  ko: {
    theme: '테마', language: '언어', soundOn: '소리 켬', soundOff: '소리 끔', hero: '뭘 볼지 모르겠나요?', subhero: '목적지는 필요 없어요. 작은 호기심이면 충분해요.', chooseMode: '탐험 모드 선택', weirdHint: '이상한 것들', learnHint: '조금 더 배우기', exploreHint: '조금 더 멀리', chaosHint: '우주에 맡기기', weirdDesc: '조금 이상하고, 조금 설명할 수 없어요.', learnDesc: '새로운 것, 다른 관점.', exploreDesc: '낯선 곳, 알려지지 않은 세계.', chaosDesc: '규칙도 예측도 없이, 그냥 가요.', rolling: '굴리는 중', shuffling: '섞는 중', roll: '시작', discovering: '새로운 발견을 찾는 중…', drawLabel: '카드를 여는 중', cardLabel: '엎어진 카드 한 장', cardOpening: '{total}장 중 {n}번째 카드, 여는 중', noChoice: '작은 우회로. 선택은 필요 없어요.', shuffleAgain: '↻ 다시 섞기', noAccount: '계정 없음. 목적지 없음.', curiosity: '작은 호기심, 작은 놀라움.', sideQuest: '마음을 위한 작은 모험.', powered: '호기심과 위키백과로 작동', what: '이게 뭔가요?', github: 'GITHUB', detour: 'sthelse / 당신의 작은 우회로', discovery: '발견', resultNote: '시험이 아니에요. 호기심이 길을 찾는 방식일 뿐이에요.', aboutEyebrow: '알고리즘에서 잠시 벗어나는 곳', aboutTitle: '잠시 길을 잃어보세요.', close: '소개 닫기', aboutEnd: '목적지는 필요 없어요. ↗', imageRetry: '다시 시도 ↻', explore: '탐험', sourceVietnamese: '베트남어 콘텐츠', sourceEnglish: '원문 콘텐츠 · 영어', original: '항상 원본 출처.', curious: '조금 더 호기심을.',
  },
  ja: {
    theme: 'テーマ', language: '言語', soundOn: '音声オン', soundOff: '音声オフ', hero: '何を見ればいいかわからない？', subhero: '目的地はいりません。少しの好奇心だけで十分です。', chooseMode: '探索モードを選ぶ', weirdHint: '不思議なこと', learnHint: 'もう少し学ぶ', exploreHint: 'もう少し遠くへ', chaosHint: '宇宙に任せる', weirdDesc: '少し奇妙で、少し説明できない。', learnDesc: '新しいこと、別の視点。', exploreDesc: '見知らぬ場所、未知の世界。', chaosDesc: 'ルールなし、予測なし、行こう。', rolling: 'ROLLING', shuffling: 'SHUFFLING', roll: 'ROLL', discovering: '新しい発見を探しています…', drawLabel: 'カードを開いています', cardLabel: '伏せたカード一枚', cardOpening: '{total}枚中{n}枚目、開いています', noChoice: '小さな寄り道。選ぶ必要はありません。', shuffleAgain: '↻ もう一度混ぜる', noAccount: 'アカウントなし。目的地なし。', curiosity: '少しの好奇心、少しの驚き。', sideQuest: '心のための小さな冒険。', powered: '好奇心とWikipediaで動いています', what: 'これは何？', github: 'GITHUB', detour: 'sthelse / あなたの小さな寄り道', discovery: '発見', resultNote: 'テストではありません。好奇心が道を見つける方法です。', aboutEyebrow: 'アルゴリズムからの小さな脱出', aboutTitle: '少し迷ってみよう。', close: '紹介を閉じる', aboutEnd: '目的地は必要ありません。↗', imageRetry: '再試行 ↻', explore: '探索', sourceVietnamese: 'ベトナム語の内容', sourceEnglish: '原文の内容 · 英語', original: 'いつでも原典を表示。', curious: 'もう少し好奇心を。',
  },
  ru: {
    theme: 'ТЕМА', language: 'ЯЗЫК', soundOn: 'ЗВУК ВКЛ', soundOff: 'ЗВУК ВЫКЛ', hero: 'Не знаете, что посмотреть?', subhero: 'Вам не нужна цель. Достаточно немного любопытства.', chooseMode: 'Выберите режим открытия', weirdHint: 'Странные вещи', learnHint: 'Узнать немного больше', exploreHint: 'Пойти чуть дальше', chaosHint: 'Пусть решит вселенная', weirdDesc: 'Немного странно. Немного необъяснимо.', learnDesc: 'Что-то новое. Другой взгляд.', exploreDesc: 'Незнакомые места. Неизвестные миры.', chaosDesc: 'Без правил и предсказаний. Просто вперёд.', rolling: 'КРУТИМ', shuffling: 'ПЕРЕМЕШИВАЕМ', roll: 'КРУТИТЬ', discovering: 'Ищем новое открытие…', drawLabel: 'Открываем карту', cardLabel: 'Одна закрытая карта', cardOpening: 'Карта {n} из {total}, открывается', noChoice: 'Небольшой поворот. Выбирать не нужно.', shuffleAgain: '↻ ПЕРЕМЕШАТЬ СНОВА', noAccount: 'Без аккаунта. Без цели.', curiosity: 'Немного любопытства, немного сюрприза.', sideQuest: 'МАЛЕНЬКОЕ ПРИКЛЮЧЕНИЕ ДЛЯ УМА.', powered: 'РАБОТАЕТ НА ЛЮБОПЫТСТВЕ И WIKIPEDIA', what: 'ЧТО ЭТО?', github: 'GITHUB', detour: 'sthelse / ВАШ НЕБОЛЬШОЙ ПОВОРОТ', discovery: 'ОТКРЫТИЕ', resultNote: 'Это не тест. Просто один из путей любопытства.', aboutEyebrow: 'МАЛЕНЬКИЙ ПОБЕГ ОТ АЛГОРИТМА', aboutTitle: 'Немного заблудиться.', close: 'Закрыть описание', aboutEnd: 'ЦЕЛЬ НЕ НУЖНА. ↗', imageRetry: 'Повторить ↻', explore: 'Исследовать', sourceVietnamese: 'КОНТЕНТ НА ВЬЕТНАМСКОМ', sourceEnglish: 'ОРИГИНАЛ · АНГЛИЙСКИЙ', original: 'ОРИГИНАЛЬНЫЙ ИСТОЧНИК.', curious: 'ЕЩЁ НЕМНОГО ЛЮБОПЫТСТВА.',
  },
  fr: {
    theme: 'THÈME', language: 'LANGUE', soundOn: 'SON ACTIVÉ', soundOff: 'SON DÉSACTIVÉ', hero: 'Vous ne savez pas quoi regarder ?', subhero: 'Pas besoin de destination. Un peu de curiosité suffit.', chooseMode: 'Choisir un mode de découverte', weirdHint: 'Choses étranges', learnHint: 'En apprendre un peu plus', exploreHint: 'Aller un peu plus loin', chaosHint: 'Laisser l’univers décider', weirdDesc: 'Un peu étrange. Un peu inexplicable.', learnDesc: 'Quelque chose de nouveau. Un autre point de vue.', exploreDesc: 'Des lieux inconnus. Des mondes inexplorés.', chaosDesc: 'Sans règles ni prédictions. Allons-y.', rolling: 'EN COURS', shuffling: 'MÉLANGE', roll: 'LANCER', discovering: 'À la recherche d’une découverte…', drawLabel: 'Ouverture d’une carte', cardLabel: 'Une carte face cachée', cardOpening: 'Carte {n} sur {total}, ouverture', noChoice: 'Un petit détour. Aucun choix nécessaire.', shuffleAgain: '↻ MÉLANGER ENCORE', noAccount: 'Sans compte. Sans destination.', curiosity: 'Un peu de curiosité, un peu de surprise.', sideQuest: 'UNE PETITE QUÊTE POUR L’ESPRIT.', powered: 'PROPULSÉ PAR LA CURIOSITÉ & WIKIPEDIA', what: 'QU’EST-CE QUE C’EST ?', github: 'GITHUB', detour: 'sthelse / VOTRE PETIT DÉTOUR', discovery: 'DÉCOUVERTE', resultNote: 'Pas un test. Juste une façon pour la curiosité de trouver son chemin.', aboutEyebrow: 'UNE PETITE ÉCHAPPÉE À L’ALGORITHME', aboutTitle: 'Se perdre un peu.', close: 'Fermer la présentation', aboutEnd: 'AUCUNE DESTINATION REQUISE. ↗', imageRetry: 'Réessayer ↻', explore: 'Explorer', sourceVietnamese: 'CONTENU VIETNAMIEN', sourceEnglish: 'CONTENU ORIGINAL · ANGLAIS', original: 'SOURCE ORIGINALE, TOUJOURS.', curious: 'UN PEU PLUS DE CURIOSITÉ.',
  },
}

export function initialLocale(): Locale {
  try {
    const stored = localStorage.getItem('sthelse-locale') as Locale | null
    return stored && locales.some(item => item.id === stored) ? stored : 'vi'
  } catch { return 'vi' }
}

export function translate(locale: Locale, key: string, replacements?: Record<string, string | number>): string {
  let value = copy[locale][key] || copy.en[key] || key
  Object.entries(replacements || {}).forEach(([name, replacement]) => { value = value.replace(`{${name}}`, String(replacement)) })
  return value
}
