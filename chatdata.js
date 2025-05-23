const messageMapping = {
  // מצב התחלתי (start)
  start: {
    text:
      "👋 שלום וברוך הבא לבוט של *אור השן*!\n\n" +
      "*הקש 1* לפרטי סניפים (כתובת, טלפון ושעות פעילות)\n\n" +
      "📸 *הקש 2* לקבלת קישור למערכת עצמית לשליחת צילומים\n\n" +
      "💬 *הקש 3* לשיחה עם נציג אנושי",
    next: {
      1: "regionsMenu",
      2: "photoUpload",
      3: "humanRepresentative",
    },
  },

  photoUpload: {
    text:
      "📸 *הקש 1* לקבלת הצילומים כאן בווטסאפ\n\n" +
      "✉️ *הקש 2* לקבלת הצילומים למייל\n\n" +
      "🔙 *הקש 0* חזרה לתפריט הראשי",
    next: {
      1: "sendWhatsAppPhotos",
      2: "sendEmailPhotos",
      0: "start",
    },
  },

  sendWhatsAppPhotos: {
    text:
      "📲 הצילומים מהשנתיים האחרונות יישלחו נא להמתין, בתהליך..\n\n" +
      "0) חזרה לתפריט הקודם\n" +
      "99) חזרה לתפריט הראשי",
    next: {
      0: "photoUpload",
      99: "start",
    },
  },

  sendEmailPhotos: {
    text:
      "🔗 לשליחת הצילומים למייל, יש להיכנס למערכת:\n" +
      "(https://getphotos.or-hashen.co.il/)\n\n" +
      "0) חזרה לתפריט הקודם\n" +
      "99) חזרה לתפריט הראשי",
    next: {
      0: "photoUpload",
      99: "start",
    },
  },

  // (נפתח כאן מצב זמני של נציג אנושי, נטפל בלוגיקה בהמשך)
  humanRepresentative: {
    text:
      "🔄 הנך מועבר כעת לנציג אנושי...\n\n" +
      "🙂 אנא שלח את בקשתך והמתן לתגובה מנציג.\n\n" +
      "⏳ שימו לב: התגובה עשויה לקחת זמן בהתאם לעומס וזמן השליחה.\n\n" +
      "❗ בכל שלב, הקש 99 לחזרה לתפריט הראשי ויציאה מהנציג האנושי.",
    next: {
      99: "start",
    },
  },

  // תפריט אזורים
  regionsMenu: {
    text:
      "*בחר אזור:*\n" +
      " *שלח את את מספר האזור הרצוי:*\n\n" +
      "1) צפון\n" +
      "2) שרון\n" +
      "3) מרכז\n" +
      "4) דרום\n" +
      "5) ירושלים והסביבה\n\n" +
      "0) חזרה לתפריט הראשי",
    next: {
      1: "northCities",
      2: "sharonCities",
      3: "centerCities",
      4: "southCities",
      5: "jerusalemCities",
      0: "start",
    },
  },

  // ------------------------------------------------------
  // אזור ירושלים
  // ------------------------------------------------------
  jerusalemCities: {
    text:
      "*בחר עיר באזור ירושלים:*\n" +
      "1) ירושלים\n" +
      "2) בית שמש\n" +
      "3) ביתר עילית\n" +
      "4) מודיעין עילית\n\n" +
      "0) חזרה לתפריט האזורים\n" +
      "99) חזרה לתפריט הראשי\n",
    next: {
      1: "jerusalemBranches",
      2: "beit_shemeshBranches",
      3: "beitarBranches",
      4: "modiin_illitBranches",
      0: "regionsMenu",
      99: "start",
    },
  },

  // סניפי ירושלים
  jerusalemBranches: {
    text:
      "🏢 *סניפי ירושלים:*\n\n" +
      "1) אור השן - קניון מלחה\n" +
      "   📍 כתובת: שער נרקיס, קומה 5, ירושלים\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00\n" +
      "   📞 טלפון: 02-648-1402\n\n" +
      "2) אור השן - מגדל העיר\n" +
      "   📍 כתובת: בן יהודה 37, קומה 7, ירושלים\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00\n" +
      "   📞 טלפון: 02-624-8694\n\n" +
      "3) אור השן - מלכי ישראל\n" +
      "   📍 כתובת: מלכי ישראל 39, קומה 2, ירושלים\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00\n" +
      "   📞 טלפון: 02-502-2131\n\n" +
      "4) אור השן - קניון רמות\n" +
      "   📍 כתובת: שדרות גולדה מאיר 255, קניון רמות, ירושלים\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00\n" +
      "   📞 טלפון: 02-626-4885\n\n" +
      "0) חזרה לערים באזור ירושלים\n" +
      "99) חזרה לתפריט הראשי\n",
    next: {
      0: "jerusalemCities",
      99: "start",
    },
  },

  // סניפי בית שמש
  beit_shemeshBranches: {
    text:
      "🏢 *סניפי בית שמש:*\n\n" +
      "1) אור השן - קניון נעימי\n" +
      "   📍 כתובת: יצחק רבין 2, בניין B, בית שמש\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00\n" +
      "   📞 טלפון: 02-624-9851\n\n" +
      "2) אור השן - מרכז רימונים\n" +
      "   📍 כתובת: דבורה הנביאה 1/4, מרכז רימונים, בית שמש\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00\n" +
      "   📞 טלפון: 073-371-2224\n\n" +
      "3) אור השן - רמת בית שמש\n" +
      "   📍 כתובת: נחל צאלים 6, רמת בית שמש א', קומה -1\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00\n" +
      "   📞 טלפון: 077-507-0185\n\n" +
      "0) חזרה לערים באזור ירושלים\n" +
      "99) חזרה לתפריט הראשי\n",
    next: {
      0: "jerusalemCities",
      99: "start",
    },
  },

  // סניפי ביתר עילית
  beitarBranches: {
    text:
      "🏢 *סניפי ביתר עילית:*\n\n" +
      "1) אור השן - ביתר עילית\n" +
      "   📍 כתובת: חיי יצחק 4, ביתר עילית\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00\n" +
      "   📞 טלפון: 02-580-3337\n\n" +
      "0) חזרה לערים באזור ירושלים\n" +
      "99) חזרה לתפריט הראשי\n",
    next: {
      0: "jerusalemCities",
      99: "start",
    },
  },

  // סניפי מודיעין עילית
  modiin_illitBranches: {
    text:
      "🏢 *סניפי מודיעין עילית:*\n\n" +
      "1) אור השן - מרכז קסם\n" +
      "   📍 כתובת: אבני נזר 46, מודיעין עילית\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00, ו' 09:00–12:00\n" +
      "   📞 טלפון: 073-371-2337\n\n" +
      "0) חזרה לערים באזור ירושלים\n" +
      "99) חזרה לתפריט הראשי\n",
    next: {
      0: "jerusalemCities",
      99: "start",
    },
  },

  // ------------------------------------------------------
  // אזור צפון
  // ------------------------------------------------------
  northCities: {
    text:
      "*בחר עיר בצפון:*\n" +
      "1) חיפה\n" +
      "2) קרית אתא\n\n" +
      "0) חזרה לתפריט האזורים\n" +
      "99) חזרה לתפריט הראשי\n",
    next: {
      1: "haifaBranches",
      2: "kiryat_ataBranches",
      0: "regionsMenu",
      99: "start",
    },
  },

  haifaBranches: {
    text:
      "🏢 *סניפי חיפה:*\n\n" +
      "1) אור השן - קניון כיכר האודיטוריום\n" +
      "   📍 כתובת: שדרות הנשיא 134, מרכז הכרמל, חיפה\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00, ו' 09:00–12:00\n" +
      "   📞 טלפון: 04-838-3389\n\n" +
      "2) אור השן - סיטי סנטר\n" +
      "   📍 כתובת: שדרות בן גוריון 6, קניון סיטי סנטר, חיפה\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00, ו' 09:00–12:00\n" +
      "   📞 טלפון: 04-833-0433\n\n" +
      "3) אור השן - גרנד קניון חיפה\n" +
      "   📍 כתובת: שמחה גולן 54, קומה 3, חיפה\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00, ו' 09:00–12:00\n" +
      "   📞 טלפון: 04-844-4924\n\n" +
      "0) חזרה לערים בצפון\n" +
      "99) חזרה לתפריט הראשי\n",
    next: {
      0: "northCities",
      99: "start",
    },
  },

  kiryat_ataBranches: {
    text:
      "🏢 *סניפי קרית אתא:*\n\n" +
      "1) אור השן - קניון קרית אתא\n" +
      "   📍 כתובת: העצמאות 41, קרית אתא\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00, ו' 09:00–12:00\n" +
      "   📞 טלפון: 073-371-2336\n\n" +
      "0) חזרה לערים בצפון\n" +
      "99) חזרה לתפריט הראשי\n",
    next: {
      0: "northCities",
      99: "start",
    },
  },

  // ------------------------------------------------------
  // אזור שרון
  // ------------------------------------------------------
  sharonCities: {
    text:
      "*בחר עיר בשרון:*\n" +
      "1) נתניה\n" +
      "2) כפר סבא\n" +
      "3) רעננה\n" +
      "4) הרצליה\n" +
      "5) הוד השרון\n" +
      "6) רמת השרון\n" +
      "7) פרדסיה\n\n" +
      "0) חזרה לתפריט האזורים\n" +
      "99) חזרה לתפריט הראשי\n",
    next: {
      1: "netanyaBranches",
      2: "kfar_sabaBranches",
      3: "raananaBranches",
      4: "herzliyaBranches",
      5: "hod_hasharonBranches",
      6: "ramat_hasharonBranches",
      7: "pardesiyaBranches",
      0: "regionsMenu",
      99: "start",
    },
  },

  // סניפי נתניה
  netanyaBranches: {
    text:
      "🏢 *סניפי נתניה:*\n\n" +
      "1) אור השן - קניון עיר ימים\n" +
      "   📍 כתובת: בני ברמן 2, נתניה\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00, ו' 09:00–12:00\n" +
      "   📞 טלפון: 073-398-0212\n\n" +
      "2) אור השן - שטמפפר\n" +
      "   📍 כתובת: יהושע שטמפפר 15, נתניה\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00\n" +
      "   📞 טלפון: 09-861-5766\n\n" +
      "3) אור השן - שדרות פנחס לבון\n" +
      "   📍 כתובת: שדרות פנחס לבון 18, נתניה\n" +
      "   ⏰ שעות פעילות: א'–ה' 08:30-12:30, 15:00-19:00, ו' 08:30-12:00\n" +
      "   📞 טלפון: 09-835-8149\n\n" +
      "4) אור השן - מרכז מסחרי אלון\n" +
      "   📍 כתובת: שדרות טום לנטוס 26, כניסה B קומה א', נתניה\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00, ו' 09:00–12:00\n" +
      "   📞 טלפון: 09-899-2002\n\n" +
      "0) חזרה לערים בשרון\n" +
      "99) חזרה לתפריט הראשי\n",
    next: {
      0: "sharonCities",
      99: "start",
    },
  },

  // סניפי כפר סבא
  kfar_sabaBranches: {
    text:
      "🏢 *סניפי כפר סבא:*\n\n" +
      "1) אור השן - קניון ערים\n" +
      "   📍 כתובת: ברל כצנלסון 14 (אזור צפוני, מעל רולדין), כפר סבא\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00, ו' 09:00–12:00\n" +
      "   📞 טלפון: 09-963-1411\n\n" +
      "2) אור השן - ויצמן\n" +
      "   📍 כתובת: ויצמן 64, כפר סבא\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–18:15, ו' 09:00–12:00\n" +
      "   📞 טלפון: 09-767-3277\n\n" +
      "0) חזרה לערים בשרון\n" +
      "99) חזרה לתפריט הראשי\n",
    next: {
      0: "sharonCities",
      99: "start",
    },
  },

  // סניפי רעננה
  raananaBranches: {
    text:
      "🏢 *סניפי רעננה:*\n\n" +
      "1) אור השן - מרכז גירון\n" +
      "   📍 כתובת: ז'בוטינסקי 5, רעננה\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00, ו' 09:00–12:00\n" +
      "   📞 טלפון: 09-744-0461\n\n" +
      "0) חזרה לערים בשרון\n" +
      "99) חזרה לתפריט הראשי\n",
    next: {
      0: "sharonCities",
      99: "start",
    },
  },

  // סניפי הרצליה
  herzliyaBranches: {
    text:
      "🏢 *סניפי הרצליה:*\n\n" +
      "1) אור השן - שער העיר\n" +
      "   📍 כתובת: בן גוריון 22, בניין ב', הרצליה\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00, ו' 09:00–12:00\n" +
      "   📞 טלפון: 09-958-5949\n\n" +
      "0) חזרה לערים בשרון\n" +
      "99) חזרה לתפריט הראשי\n",
    next: {
      0: "sharonCities",
      99: "start",
    },
  },

  // סניפי הוד השרון
  hod_hasharonBranches: {
    text:
      "🏢 *סניפי הוד השרון:*\n\n" +
      "1) אור השן - דרך רמתיים 96\n" +
      "   📍 כתובת: דרך רמתיים 96, בניין עומר האוס, קומה 1\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00, ו' 09:00–12:00\n" +
      "   📞 טלפון: 09-743-2773\n\n" +
      "2) אור השן - בית הבד (לא צוינו פרטים מלאים)\n" +
      "   📍 כתובת: רמתיים 29, הוד השרון\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00 (משוער)\n" +
      "   📞 טלפון: לא צויין במדויק\n\n" +
      "0) חזרה לערים בשרון\n" +
      "99) חזרה לתפריט הראשי\n",
    next: {
      0: "sharonCities",
      99: "start",
    },
  },

  // סניפי רמת השרון
  ramat_hasharonBranches: {
    text:
      "🏢 *סניפי רמת השרון:*\n\n" +
      "1) אור השן - שרון סנטר\n" +
      "   📍 כתובת: סוקולוב 81, רמת השרון\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00\n" +
      "   📞 טלפון: 03-549-8442\n\n" +
      "0) חזרה לערים בשרון\n" +
      "99) חזרה לתפריט הראשי",
    next: {
      0: "sharonCities",
      99: "start",
    },
  },

  // סניפי פרדסיה
  pardesiyaBranches: {
    text:
      "🏢 *סניפי פרדסיה:*\n\n" +
      "1) אור השן - שדרות הנשיא 1\n" +
      "   📍 כתובת: שדרות הנשיא 1, פרדסיה\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00, ו' 09:00–12:00 (משוער)\n" +
      "   📞 טלפון: 09-894-1110\n\n" +
      "0) חזרה לערים בשרון\n" +
      "99) חזרה לתפריט הראשי",
    next: {
      0: "sharonCities",
      99: "start",
    },
  },

  // ------------------------------------------------------
  // אזור מרכז
  // ------------------------------------------------------
  centerCities: {
    text:
      "*בחר עיר במרכז:*\n" +
      "1) תל אביב\n" +
      "2) רמת גן\n" +
      "3) פתח תקווה\n" +
      "4) ראשון לציון\n" +
      "5) חולון\n" +
      "6) בת ים\n" +
      "7) גבעתיים\n" +
      "8) בני ברק\n" +
      "9) קרית אונו\n" +
      "10) אור יהודה\n" +
      "11) ראש העין\n" +
      "12) לוד\n" +
      "13) רמלה\n" +
      "14) נס ציונה\n" +
      "15) רחובות\n" +
      "16) אלעד\n" +
      "17) שוהם\n" +
      "18) מודיעין מכבים רעות\n\n" +
      "0) חזרה לתפריט האזורים\n" +
      "99) חזרה לתפריט הראשי",
    next: {
      1: "tel_avivBranches",
      2: "ramat_ganBranches",
      3: "petah_tikvaBranches",
      4: "rishon_lezionBranches",
      5: "holonBranches",
      6: "bat_yamBranches",
      7: "givatayimBranches",
      8: "bnei_brakBranches",
      9: "kiryat_onoBranches",
      10: "or_yehudaBranches",
      11: "rosh_haayinBranches",
      12: "lodBranches",
      13: "ramleBranches",
      14: "nes_tzionaBranches",
      15: "rehovotBranches",
      16: "eladBranches",
      17: "shohamBranches",
      18: "modiinBranches",
      0: "regionsMenu",
      99: "start",
    },
  },

  // סניפי תל אביב
  tel_avivBranches: {
    text:
      "🏢 *סניפי תל אביב:*\n\n" +
      "1) אור השן - רמת אביב\n" +
      "   📍 כתובת: ברודצקי 43, צמוד לקניון רמת אביב, קומה 2\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–18:45, ו' 09:00–11:45\n" +
      "   📞 טלפון: 03-641-7455\n\n" +
      "2) אור השן - ויצמן\n" +
      "   📍 כתובת: ויצמן 14, קניון ויצמן, קומה 17\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00, ו' 09:00–12:00\n" +
      "   📞 טלפון: 073-398-0207\n\n" +
      "3) אור השן - צייטלין\n" +
      "   📍 כתובת: צייטלין 1, תל אביב (פינת אבן גבירול)\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00\n" +
      "   📞 טלפון: 03-695-0264 (עודכן מהטבלה)\n\n" +
      "4) אור השן - גלרי פאלאס\n" +
      "   📍 כתובת: הלוחמים 1, קניון גלארי פאלאס, מול בית חולים וולפסון\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00, ו' 09:00–12:00\n" +
      "   📞 טלפון: 03-505-5531\n\n" +
      "0) חזרה לערים במרכז\n" +
      "99) חזרה לתפריט הראשי\n",
    next: {
      0: "centerCities",
      99: "start",
    },
  },

  // סניפי רמת גן
  ramat_ganBranches: {
    text:
      "🏢 *סניפי רמת גן:*\n\n" +
      "1) אור השן - ביאליק\n" +
      "   📍 כתובת: ביאליק 30, רמת גן\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00, ו' 09:00–12:00\n" +
      "   📞 טלפון: 03-672-8069\n\n" +
      "2) אור השן - קניון איילון\n" +
      "   📍 כתובת: קניון איילון, רמת גן\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00\n" +
      "   📞 טלפון: 03-673-0042\n\n" +
      "0) חזרה לערים במרכז\n" +
      "99) חזרה לתפריט הראשי\n",
    next: {
      0: "centerCities",
      99: "start",
    },
  },

  // סניפי פתח תקווה
  petah_tikvaBranches: {
    text:
      "🏢 *סניפי פתח תקווה:*\n\n" +
      "1) אור השן - שפיגל\n" +
      "   📍 כתובת: שפיגל זוסיה 3, פתח תקווה\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–18:30, ו' 09:00–12:00\n" +
      "   📞 טלפון: 03-904-0072\n\n" +
      "2) אור השן - הקניון הגדול\n" +
      "   📍 כתובת: מוטה גור 4, מגדל המשרדים (Ofer Tower) הקניון הגדול אבנת, קומה 12\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00, ו' 09:00–12:00\n" +
      "   📞 טלפון: 073-398-0250\n\n" +
      "0) חזרה לערים במרכז\n" +
      "99) חזרה לתפריט הראשי\n",
    next: {
      0: "centerCities",
      99: "start",
    },
  },

  // סניפי ראשון לציון
  rishon_lezionBranches: {
    text:
      "🏢 *סניפי ראשון לציון:*\n\n" +
      "1) אור השן - קניון לב ראשון\n" +
      "   📍 כתובת: זבוטינסקי 16, קניון לב ראשון, קומה 3\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00, ו' 09:00–12:00\n" +
      "   📞 טלפון: 03-562-7384\n\n" +
      "0) לחזרה לערים במרכז\n" +
      "9) לחזרה לתפריט הראשי",
    next: {
      0: "centerCities",
      9: "start",
    },
  },

  // סניפי חולון
  holonBranches: {
    text:
      "🏢 *סניפי חולון:*\n\n" +
      "1) אור השן - סוקולוב\n" +
      "   📍 כתובת: סוקולוב 84, קומה 2, חולון\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00, ו' 09:00–12:00\n" +
      "   📞 טלפון: 03-562-7394\n\n" +
      "2) אור השן - קניון עזריאלי\n" +
      "   📍 כתובת: גולדה מאיר 7, קומה -2, חולון\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00, ו' 09:00–12:00\n" +
      "   📞 טלפון: 073-397-7579\n\n" +
      "3) אור השן - מרכז סאדאב\n" +
      "   📍 כתובת: רבינוביץ 11, מרכז סאדאב, קומה 2, חולון\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00, ו' 09:00–12:00\n" +
      "   📞 טלפון: 03-554-7255\n\n" +
      "0) לחזרה לערים במרכז\n" +
      "9) לחזרה לתפריט הראשי",
    next: {
      0: "centerCities",
      9: "start",
    },
  },

  // סניפי בת ים
  bat_yamBranches: {
    text:
      "🏢 *סניפי בת ים*:\n\n" +
      "1) אור השן - קדושי קהיר\n" +
      "   📍 כתובת: קדושי קהיר 17, בת ים\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00\n" +
      "   📞 טלפון: 073-398-0266\n\n" +
      "0) לחזרה לערים במרכז\n" +
      "9) לחזרה לתפריט הראשי",
    next: {
      0: "centerCities",
      9: "start",
    },
  },

  // סניפי גבעתיים
  givatayimBranches: {
    text:
      "🏢 *סניפי גבעתיים*:\n\n" +
      "1) אור השן - קניון גבעתיים\n" +
      "   📍 כתובת: דרך יצחק רבין 53, קניון גבעתיים, קומה 6\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00, ו' 09:00–12:00\n" +
      "   📞 טלפון: 073-371-2334\n\n" +
      "0) לחזרה לערים במרכז\n" +
      "9) לחזרה לתפריט הראשי",
    next: {
      0: "centerCities",
      9: "start",
    },
  },

  // סניפי בני ברק
  bnei_brakBranches: {
    text:
      "🏢 *סניפי בני ברק*:\n\n" +
      "1) אור השן - גרנד הול\n" +
      "   📍 כתובת: הרב כהנמן 111, בניין גרנד הול, קומה 4\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00, ו' 09:00–12:00\n" +
      "   📞 טלפון: 03-579-5399\n\n" +
      "2) אור השן - ירושלים 14 (בעבר מגדל לב העיר)\n" +
      "   📍 כתובת: רבי עקיבא פינת ירושלים 14, קומה 7 (ייתכן שינוי)\n" +
      "   ⏰ שעות פעילות: א'–ה' 08:00–16:00, ו' 08:30–12:00\n" +
      "   📞 טלפון: 03-618-6020\n\n" +
      "0) לחזרה לערים במרכז\n" +
      "9) לחזרה לתפריט הראשי",
    next: {
      0: "centerCities",
      9: "start",
    },
  },

  // סניפי קרית אונו
  kiryat_onoBranches: {
    text:
      "🏢 *סניפי קרית אונו*:\n\n" +
      "1) אור השן - קניון קרית אונו\n" +
      "   📍 כתובת: קניון קרית אונו, מגדל משרדים, קומה 5\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00, ו' 09:00–12:00\n" +
      "   📞 טלפון: 03-534-5584\n\n" +
      "0) לחזרה לערים במרכז\n" +
      "9) לחזרה לתפריט הראשי",
    next: {
      0: "centerCities",
      9: "start",
    },
  },

  // סניפי אור יהודה
  or_yehudaBranches: {
    text:
      "🏢 *סניפי אור יהודה*:\n\n" +
      "1) אור השן - קניון עזריאלי\n" +
      "   📍 כתובת: סעדון אליהו 120, קומה 0, אור יהודה\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00, ו' 09:00–12:00\n" +
      "   📞 טלפון: 073-254-5639\n\n" +
      "0) לחזרה לערים במרכז\n" +
      "9) לחזרה לתפריט הראשי",
    next: {
      0: "centerCities",
      9: "start",
    },
  },

  // סניפי ראש העין
  rosh_haayinBranches: {
    text:
      "🏢 *סניפי ראש העין*:\n\n" +
      "1) אור השן - שבזי 26\n" +
      "   📍 כתובת: שבזי 26, קומה 3 או 4, ראש העין\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–18:30\n" +
      "   📞 טלפון: 03-624-4157\n\n" +
      "0) לחזרה לערים במרכז\n" +
      "9) לחזרה לתפריט הראשי",
    next: {
      0: "centerCities",
      9: "start",
    },
  },

  // סניפי לוד
  lodBranches: {
    text:
      "🏢 *סניפי לוד:*\n\n" +
      "1) אור השן - מגדל קיסר\n" +
      "   📍 כתובת: שדרות הציונות 1, לוד\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00, ו' 09:00–12:00\n" +
      "   📞 טלפון: 073-254-5630\n\n" +
      "0) חזרה לערים במרכז\n" +
      "99) חזרה לתפריט הראשי",
    next: {
      0: "centerCities",
      99: "start",
    },
  },

  // סניפי רמלה
  ramleBranches: {
    text:
      "🏢 *סניפי רמלה:*\n\n" +
      "1) אור השן - בית רוחם\n" +
      "   📍 כתובת: שדרות הרצל 59, רמלה\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00 (משוער), ו' 09:00–12:00\n" +
      "   📞 טלפון: 08-923-7314\n\n" +
      "0) חזרה לערים במרכז\n" +
      "99) חזרה לתפריט הראשי",
    next: {
      0: "centerCities",
      99: "start",
    },
  },

  // סניפי נס ציונה
  nes_tzionaBranches: {
    text:
      "🏢 *סניפי נס ציונה:*\n\n" +
      "1) אור השן - קניותר\n" +
      "   📍 כתובת: האירוסין 52, נס ציונה\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00, ו' 09:00–12:00\n" +
      "   📞 טלפון: 073-371-2335\n\n" +
      "0) חזרה לערים במרכז\n" +
      "99) חזרה לתפריט הראשי",
    next: {
      0: "centerCities",
      99: "start",
    },
  },

  // סניפי רחובות
  rehovotBranches: {
    text:
      "🏢 *סניפי רחובות:*\n\n" +
      "1) אור השן - חיים פקריס 3\n" +
      "   📍 כתובת: חיים פקריס 3, קומה כניסה, רחובות\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00 (משוער), ו' 09:00–12:00\n" +
      "   📞 טלפון: 073-398-0300\n\n" +
      "2) אור השן - קניון עופר רחובות\n" +
      "   📍 כתובת: בילו 2, שער מזרחי, קומה 1, רחובות\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00, ו' 09:00–12:00\n" +
      "   📞 טלפון: 08-662-4477\n\n" +
      "3) אור השן - הרצל 157\n" +
      "   📍 כתובת: הרצל 157, רחובות\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00 (משוער), ו' 09:00–12:00\n" +
      "   📞 טלפון: 08-936-5776\n\n" +
      "0) חזרה לערים במרכז\n" +
      "99) חזרה לתפריט הראשי",
    next: {
      0: "centerCities",
      99: "start",
    },
  },

  // סניפי אלעד
  eladBranches: {
    text:
      "🏢 *סניפי אלעד:*\n\n" +
      "1) אור השן - מרכז רימון\n" +
      "   📍 כתובת: שמעון בן שטח 8, אלעד\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00, ו' 09:00–12:00\n" +
      "   📞 טלפון: 03-933-5017\n\n" +
      "0) חזרה לערים במרכז\n" +
      "99) חזרה לתפריט הראשי",
    next: {
      0: "centerCities",
      99: "start",
    },
  },

  // סניפי שוהם
  shohamBranches: {
    text:
      "🏢 *סניפי שוהם:*\n\n" +
      "1) אור השן - כותר פיס\n" +
      "   📍 כתובת: כרמל 6, בניין כותר פיס, שוהם\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00 (משוער), ו' 09:00–12:00\n" +
      "   📞 טלפון: 070-3397-7577\n\n" +
      "0) חזרה לערים במרכז\n" +
      "99) חזרה לתפריט הראשי",
    next: {
      0: "centerCities",
      99: "start",
    },
  },

  // סניפי מודיעין מכבים רעות
  modiinBranches: {
    text:
      "🏢 *סניפי מודיעין מכבים רעות:*\n\n" +
      "1) אור השן - קניון עזריאלי מודיעין\n" +
      "   📍 כתובת: לב העיר 14, בית יהונתן, קומה 5, מודיעין\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00, ו' 09:00–12:00\n" +
      "   📞 טלפון: 08-926-3968\n\n" +
      "0) חזרה לערים במרכז\n" +
      "99) חזרה לתפריט הראשי",
    next: {
      0: "centerCities",
      99: "start",
    },
  },

  // ------------------------------------------------------
  // אזור דרום
  // ------------------------------------------------------
  southCities: {
    text:
      "*בחר עיר בדרום:*\n" +
      "1) אשדוד\n" +
      "2) באר שבע\n" +
      "3) אשקלון\n" +
      "4) באר שבע\n" + // כפול בכוונה? נשאר לפי הקובץ
      "5) ערד\n" +
      "6) אופקים\n" +
      "7) דימונה\n" +
      "8) נתיבות\n" +
      "9) קרית גת\n" +
      "10) שדרות\n\n" +
      "0) חזרה לתפריט האזורים\n" +
      "99) חזרה לתפריט הראשי",
    next: {
      1: "ashdodBranches",
      2: "beer_shevaBranches",
      3: "ashkelonBranches",
      4: "beer_shevaBranches",
      5: "aradBranches",
      6: "ofakimBranches",
      7: "dimonaBranches",
      8: "netivotBranches",
      9: "kiryat_gatBranches",
      10: "sderotBranches",
      0: "regionsMenu",
      99: "start",
    },
  },

  // סניפי אשדוד
  ashdodBranches: {
    text:
      "🏢 *סניפי אשדוד:*\n\n" +
      "1) אור השן - מגדל דמרי\n" +
      '   📍 כתובת: צה"ל 1, מגדל דמרי, מול קניון סימול, אשדוד\n' +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00, ו' 09:00–12:00\n" +
      "   📞 טלפון: 08-867-6447\n\n" +
      "0) חזרה לערים בדרום\n" +
      "99) חזרה לתפריט הראשי\n",
    next: {
      0: "southCities",
      99: "start",
    },
  },

  // סניפי באר שבע
  beer_shevaBranches: {
    text:
      "🏢 *סניפי באר שבע:*\n\n" +
      "1) אור השן - קניון הנגב\n" +
      "   📍 כתובת: צומת אלי כהן, מגדל משרדים, קומה 6, באר שבע\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00, ו' 09:00–12:00\n" +
      "   📞 טלפון: 08-623-6108\n\n" +
      "0) חזרה לערים בדרום\n" +
      "99) חזרה לתפריט הראשי\n",
    next: {
      0: "southCities",
      99: "start",
    },
  },

  // סניפי אשקלון
  ashkelonBranches: {
    text:
      "🏢 *סניפי אשקלון:*\n\n" +
      "1) אור השן - הגבורה\n" +
      "   📍 כתובת: הגבורה 1, קומה א', ליד מכבי פארם, אשקלון\n" +
      "   ⏰ שעות פעילות: א'–ה' 08:30–19:00, ו' 08:30–12:00\n" +
      "   📞 טלפון: 08-673-8359\n\n" +
      "0) חזרה לערים בדרום\n" +
      "99) חזרה לתפריט הראשי\n",
    next: {
      0: "southCities",
      99: "start",
    },
  },

  // סניפי ערד
  aradBranches: {
    text:
      "🏢 *סניפי ערד:*\n\n" +
      "1) אור השן - אלעזר בן יאיר\n" +
      "   📍 כתובת: אלעזר בן יאיר 24/30, ערד\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00\n" +
      "   📞 טלפון: 08-631-1313\n\n" +
      "0) חזרה לערים בדרום\n" +
      "99) חזרה לתפריט הראשי",
    next: {
      0: "southCities",
      99: "start",
    },
  },

  // סניפי אופקים
  ofakimBranches: {
    text:
      "🏢 *סניפי אופקים:*\n\n" +
      "1) אור השן - הרצל\n" +
      "   📍 כתובת: הרצל 5, בפסאז', קומה 1, אופקים\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–18:00\n" +
      "   📞 טלפון: 073-398-0240\n\n" +
      "0) חזרה לערים בדרום\n" +
      "99) חזרה לתפריט הראשי\n",
    next: {
      0: "southCities",
      99: "start",
    },
  },

  // סניפי דימונה
  dimonaBranches: {
    text:
      "🏢 *סניפי דימונה:*\n\n" +
      "1) אור השן - שדרות הנשיא\n" +
      "   📍 כתובת: שדרות הנשיא 50, קומה 2, דימונה\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00\n" +
      "   📞 טלפון: 077-451-1800\n\n" +
      "0) חזרה לערים בדרום\n" +
      "99) חזרה לתפריט הראשי\n",
    next: {
      0: "southCities",
      99: "start",
    },
  },

  // סניפי נתיבות
  netivotBranches: {
    text:
      "🏢 *סניפי נתיבות:*\n\n" +
      "1) אור השן - יוסף סמלו\n" +
      "   📍 כתובת: יוסף סמלו 10, נתיבות\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00, ו' 09:00–12:00\n" +
      "   📞 טלפון: 08-993-1920\n\n" +
      "0) חזרה לערים בדרום\n" +
      "99) חזרה לתפריט הראשי\n",
    next: {
      0: "southCities",
      99: "start",
    },
  },

  // סניפי קרית גת
  kiryat_gatBranches: {
    text:
      "🏢 *סניפי קרית גת:*\n\n" +
      "1) אור השן - שדרות העצמאות\n" +
      "   📍 כתובת: שדרות העצמאות 60, קרית גת\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00, ו' 09:00–12:00\n" +
      "   📞 טלפון: 08-681-1978\n\n" +
      "0) חזרה לערים בדרום\n" +
      "99) חזרה לתפריט הראשי",
    next: {
      0: "southCities",
      99: "start",
    },
  },

  // סניפי שדרות
  sderotBranches: {
    text:
      "🏢 *סניפי שדרות:*\n\n" +
      "1) אור השן - בן יהודה\n" +
      "   📍 כתובת: בן יהודה 17 (ייתכן 23), שדרות\n" +
      "   ⏰ שעות פעילות: א'–ה' 09:00–19:00\n" +
      "   📞 טלפון: 073-398-0333\n\n" +
      "0) חזרה לערים בדרום\n" +
      "99) חזרה לתפריט הראשי\n",
    next: {
      0: "southCities",
      99: "start",
    },
  },
};

module.exports = {
  messageMapping,
};
