import { Question } from '../../types';

export const zdravovedaQuestions: Question[] = [
  {
    id: 'zdr-01',
    subject: 'Zdravověda a první pomoc',
    topic: 'Zástava masivního krvácení & TCCC',
    question: 'Jaký je prioritní a správný postup při masivním tepenném krvácení z končetiny (např. po bodném poranění odsouzeným)?',
    answer: 'Okamžitě naložit taktické škrtidlo (turniket / CAT) 5–7 cm nad ránu (nebo na horní část končetiny – „high and tight“), dotáhnout vratidlo až do úplného vymizení pulzu a zástavy krvácení, zajistit a poznamenat přesný čas naložení na čelo nebo pásek škrtidla.',
    options: [
      'Aplikovat turniket přímo na kloub nejblíže nad ránou a každých 15 minut škrtidlo povolit na 2 minuty pro obnovení perfuze tkáně bez nutnosti záznamu času naložení.',
      'Okamžitě naložit taktické škrtidlo (turniket / CAT) 5–7 cm nad ránu (nebo na horní část končetiny – „high and tight“), dotáhnout vratidlo až do úplného vymizení pulzu a zástavy krvácení, zajistit a poznamenat přesný čas naložení na čelo nebo pásek škrtidla.',
      'Nejprve provést wound packing hemostatickou gázou a přiložit tlakový obvaz, vyčkat 10 minut na vytvoření krevního koláče a turniket použít až po selhání tlakového obvazu.',
      'Naložit škrtidlo pod místo poranění, dotáhnout pouze do pocitu mírného tlaku zraněného a po 30 minutách turniket zcela sejmout, aby se předešlo ischemické nekróze končetiny.'
    ],
    correctOption: 1,
    rationale: 'Masivní tepenné krvácení je nejčastější odvratitelnou příčinou smrti v taktickém a bezpečnostním prostředí. Algoritmus TCCC (bod M - Massive Bleeding) vyžaduje okamžitou aplikaci turniketu s řádným dotažením a označením času naložení.',
    source: 'TCCC Guidelines & Standardy neodkladné první pomoci Akademie VS ČR'
  },
  {
    id: 'zdr-02',
    subject: 'Zdravověda a první pomoc',
    topic: 'Zástava dechu a oběhu – KPR dospělého',
    question: 'Jaký je správný poměr stlačování hrudníku a umělých vdechů při kardiopulmonální resuscitaci (KPR) dospělého člověka podle platných doporučení ERC?',
    answer: '30 stlačení hrudníku : 2 umělé vdechy; frekvence stlačování 100–120/minuta, hloubka stlačení 5–6 cm uprostřed hrudníku na dolní polovině hrudní kosti.',
    options: [
      '15 stlačení hrudníku : 2 umělé vdechy; frekvence stlačování 80–100/minuta, hloubka stlačení maximálně 3–4 cm v horní třetině hrudní kosti.',
      '30 stlačení hrudníku : 2 umělé vdechy; frekvence stlačování 100–120/minuta, hloubka stlačení 5–6 cm uprostřed hrudníku na dolní polovině hrudní kosti.',
      '30 stlačení hrudníku : 5 umělých vdechů; frekvence stlačování 60–80/minuta, hloubka stlačení 7–8 cm v oblasti mečovitého výběžku kosti hrudní.',
      '5 úvodních záchranných vdechů a následně poměr 15:2; frekvence stlačování 140–160/minuta, stlačování výhradně v levém mezižebří.'
    ],
    correctOption: 1,
    rationale: 'Doporučené postupy Evropské resuscitační rady (ERC) stanovují univerzální poměr 30:2 u dospělých. V případě neochoty či nemožnosti dýchat (např. riziko infekce u vězně) se provádí nepřerušovaná kvalitní masáž srdce frekvencí 100–120/min.',
    source: 'Doporučené postupy ERC (European Resuscitation Council)'
  },
  {
    id: 'zdr-03',
    subject: 'Zdravověda a první pomoc',
    topic: 'Automatizovaný externí defibrilátor (AED)',
    question: 'Jak se postupuje při použití AED (automatizovaného externího defibrilátoru) umístěného ve věznici u osoby v bezvědomí bez normálního dýchání?',
    answer: 'AED ihned zapnout, řídit se hlasovými a vizuálními pokyny přístroje, nalepit elektrody na suchý holý hrudník (pod pravou klíční kost a na levý bok pod podpaží), při analýze a výboji se nikdo nesmí dotýkat postiženého a ihned po výboji pokračovat v KPR 30:2.',
    options: [
      'Před zapnutím AED provést nejprve 10 minut nepřerušované manuální KPR, elektrody nalepit na přední stranu břicha a bedra bez ohledu na vlhkost pokožky a po výboji vyčkávat na kontrolu pulzu.',
      'AED ihned zapnout, řídit se hlasovými a vizuálními pokyny přístroje, nalepit elektrody na suchý holý hrudník (pod pravou klíční kost a na levý bok pod podpaží), při analýze a výboji se nikdo nesmí dotýkat postiženého a ihned po výboji pokračovat v KPR 30:2.',
      'AED zapnout až po příjezdu zdravotníka ZZS, elektrody nalepit křížem přes hrudník, během analýzy rytmu a výboje pokračovat v nepřerušovaném stlačování hrudníku a po výboji 2 minuty pasivně čekat.',
      'Zapnout přístroj, elektrody umístit na obě klíční kosti, po aplikaci defibrilačního výboje elektrody ihned strhnout, uložit postiženého do zotavovací polohy a zkontrolovat zornicový reflex.'
    ],
    correctOption: 1,
    rationale: 'AED je bezpečný poloautomatický přístroj, který sám vyhodnotí fibrilaci komor či bezpulzovou komorovou tachykardii a instruuje zachránce. Včasná defibrilace během prvních 3–5 minut zvyšuje šanci na přežití až na 70 %.',
    source: 'ERC Guidelines – Resuscitation with AED & Metodika VS ČR'
  },
  {
    id: 'zdr-04',
    subject: 'Zdravověda a první pomoc',
    topic: 'Pokus o sebevraždu oběšením',
    question: 'Jaký je správný postup příslušníka při nálezu oběšené osoby na cele?',
    answer: 'Okamžitě nadzvednout a zajistit tělo proti pádu, přeříznout/přestřihnout smyčku (ne v uzlu, uzel nechat pro šetření), položit na pevnou podložku na záda, zprůchodnit dýchací cesty, zkontrolovat dech a v případě zástavy ihned zahájit KPR a přivolat lékaře/ZZS.',
    options: [
      'Tělo ponechat v původní poloze z důvodu zachování stop pro orgány činné v trestním řízení, zajistit celu, vyčkat na příchod lékaře věznice a resuscitaci zahájit až po fotodokumentaci.',
      'Okamžitě nadzvednout a zajistit tělo proti pádu, přeříznout/přestřihnout smyčku (ne v uzlu, uzel nechat pro šetření), položit na pevnou podložku na záda, zprůchodnit dýchací cesty, zkontrolovat dech a v případě zástavy ihned zahájit KPR a přivolat lékaře/ZZS.',
      'Rozvázat nebo přeříznout uzel škrtidla, posadit osobu na lůžko, podepřít záda, podat tekutiny a provést vyšetření zornic bez zahájení kardiopulmonální resuscitace.',
      'Okamžitě přestřihnout závěs, postiženého uložit na břicho do stabilizované polohy na měkkou matraci, vyčkat 5 minut na spontánní obnovení dechu a teprve poté aktivovat poplach.'
    ],
    correctOption: 1,
    rationale: 'Záchrana lidského života má absolutní přednost. Příslušník tělo jistí, odřízne smyčku mimo uzel (z důvodu zachování kriminalistické stopy) a bez prodlení zahajuje resuscitaci, protože mozek bez kyslíku odumírá po 4–5 minutách.',
    source: 'Metodika řešení mimořádných událostí a suicidálního jednání VS ČR'
  },
  {
    id: 'zdr-05',
    subject: 'Zdravověda a první pomoc',
    topic: 'Otevřené poranění hrudníku (Pneumotorax)',
    question: 'Jak se poskytuje první pomoc při otevřeném (penetrujícím) poranění hrudníku, kdy je slyšet nasávání vzduchu do hrudní dutiny?',
    answer: 'Přiložit poloprodyšné krytí s chlopní (Chest Seal / hrudní chlopeň) nebo improvizované krytí přilepené ze tří stran, které umožňuje únik vzduchu ven, ale brání nasátí dovnitř (prevence tenzního pneumotoraxu), polohovat v polosedě a sledovat dech.',
    options: [
      'Ránu hermeticky a neprodyšně uzavřít sterilním krytím podlepeným ze všech čtyř stran bez možnosti odvodu vzduchu a zraněného položit na záda se zvednutými dolními končetinami.',
      'Přiložit poloprodyšné krytí s chlopní (Chest Seal / hrudní chlopeň) nebo improvizované krytí přilepené ze tří stran, které umožňuje únik vzduchu ven, ale brání nasátí dovnitř (prevence tenzního pneumotoraxu), polohovat v polosedě a sledovat dech.',
      'Provést hluboký wound packing rány hemostatickou gázou až do pleurální dutiny a pevně stáhnout elastickým obinadlem po celém obvodu hrudníku pro zabránění dýchacím pohybům.',
      'Ponechat ránu zcela volně otevřenou k volné ventilaci vzduchu, uložit zraněného na zdravý bok a aplikovat studený obklad na břicho k utlumení bolesti.'
    ],
    correctOption: 1,
    rationale: 'Otevřený pneumotorax může rychle přejít v tenzní (přetlakový) pneumotorax se stlačením srdce a velkých cév. Chlopňové krytí působí jako jednosměrný ventil.',
    source: 'TCCC Guidelines & Traumatologie v neodkladné péči'
  },
  {
    id: 'zdr-06',
    subject: 'Zdravověda a první pomoc',
    topic: 'Zotavovací (stabilizovaná) poloha',
    question: 'Kdy je indikováno uložení postiženého do zotavovací (stabilizované) polohy na boku?',
    answer: 'U osoby v bezvědomí, která normálně a spontánně dýchá a není u ní podezření na poranění páteře; poloha zajišťuje volné dýchací cesty a zabraňuje zapadnutí jazyka nebo vdechnutí zvratků.',
    options: [
      'U osoby v bezvědomí s lapavými dechy (gasping) a nehmatným pulzem, aby se uvolnily dýchací cesty před případným zahájením resuscitace po 10 minutách sledování.',
      'U osoby v bezvědomí, která normálně a spontánně dýchá a není u ní podezření na poranění páteře; poloha zajišťuje volné dýchací cesty a zabraňuje zapadnutí jazyka nebo vdechnutí zvratků.',
      'U všech osob při podezření na zlomeninu krční páteře a pánve, protože poloha na boku fixuje osový skelet a zabraňuje vzniku míšního šoku.',
      'U osoby při vědomí s probíhajícím masivním arteriálním krvácením nebo u pacienta v rozvinutém anafylaktickém šoku k prevenci kolapsu krevního oběhu.'
    ],
    correctOption: 1,
    rationale: 'Zotavovací poloha chrání dýchací cesty před obstrukcí a aspirací žaludečního obsahu u bezvědomého. Stav dýchání se musí nepřetržitě kontrolovat.',
    source: 'Standardy první pomoci ČČK a ERC'
  },
  {
    id: 'zdr-07',
    subject: 'Zdravověda a první pomoc',
    topic: 'Intoxikace a předávkování opioidy (Naloxon)',
    question: 'Jaké jsou typické příznaky předávkování opioidy (např. heroin, fentanyl, morfin) a jaká je první pomoc?',
    answer: 'Příznaky: bezvědomí, mióza (zúžené zornice jako špendlíkové hlavičky), těžký útlum až zástava dechu, cyanóza (promodrání rtů). První pomoc: zprůchodnit dýchací cesty, podat Naloxon (intranazální sprej Nyxoid do nosu), v případě zástavy dechu dýchat/resuscitovat a volat ZZS.',
    options: [
      'Příznaky: mydriáza (široce rozšířené zornice), tachykardie, hyperventilace a agrese. První pomoc: podat perorálně živočišné uhlí, aplikovat studené obklady na čelo a vyčkat do odeznění účinku.',
      'Příznaky: bezvědomí, mióza (zúžené zornice jako špendlíkové hlavičky), těžký útlum až zástava dechu, cyanóza (promodrání rtů). První pomoc: zprůchodnit dýchací cesty, podat Naloxon (intranazální sprej Nyxoid do nosu), v případě zástavy dechu dýchat/resuscitovat a volat ZZS.',
      'Příznaky: bezvědomí, zúžené zornice a útlum dechu. První pomoc: podat postiženému vypít roztok slané vody k vyvolání zvracení, uložit do polosedu a nepodávat žádná antidota z důvodu rizika zástavy srdce.',
      'Příznaky: křeče celého těla, nystagmus a zarudnutí kůže. První pomoc: podat intranazálně Glukagon, zahájit prudké pasivní rozdýchávání bez kontroly dýchacích cest a vyčkat 30 minut.'
    ],
    correctOption: 1,
    rationale: 'Opioidy tlumí dechové centrum v prodloužené míše. Naloxon je specifický opioidní antagonista, který vyváže receptory a obnoví spontánní dýchání během 2–3 minut.',
    source: 'Toxikologie a neodkladná péče ve vězeňství VS ČR'
  },
  {
    id: 'zdr-08',
    subject: 'Zdravověda a první pomoc',
    topic: 'Epileptický záchvat a křečové stavy',
    question: 'Jak správně postupovat při generalizovaném epileptickém záchvatu (tonicko-klonické křeče celého těla) vězněné osoby na cele?',
    answer: 'Zamezit sekundárnímu poranění (podložit hlavu měkkým oděvem, odstranit ostré a tvrdé předměty z okolí), nebránit křečím násilím, NIKDY nevkládat nic do úst, po odeznění křečí zkontrolovat dýchání, polohovat na bok a přivolat zdravotníka.',
    options: [
      'Násilím rozevřít čelisti roubíkem, vytáhnout jazyk peánem nebo prsty, pevně znehybnit končetiny přilehnutím a podat vodu se sedativy.',
      'Zamezit sekundárnímu poranění (podložit hlavu měkkým oděvem, odstranit ostré a tvrdé předměty z okolí), nebránit křečím násilím, NIKDY nevkládat nic do úst, po odeznění křečí zkontrolovat dýchání, polohovat na bok a přivolat zdravotníka.',
      'Ihned zahájit nepřerušovanou masáž srdce a umělé dýchání i přes probíhající křeče, postiženého posadit a zaklonit mu hlavu do maximálního záklonu.',
      'Položit postiženého na břicho s obličejem do polštáře k utlumení hluku, vložit mezi zuby kapesník a podat perorálně tablety proti křečím během záchvatu.'
    ],
    correctOption: 1,
    rationale: 'Násilné vkládání předmětů do úst vede k vylomení zubů a ucpání dýchacích cest. Základem je ochrana hlavy před nárazy a sledování průchodnosti dýchacích cest po záchvatu.',
    source: 'První pomoc při neurologických urgentních stavech'
  },
  {
    id: 'zdr-09',
    subject: 'Zdravověda a první pomoc',
    topic: 'Anafylaktický šok (těžká alergická reakce)',
    question: 'Jak se aplikuje autoinjektor s adrenalinem (EpiPen / Emerade) při rozvoji anafylaktického šoku (otok hrdla, dušení, pokles tlaku)?',
    answer: 'Sejmout bezpečnostní kryt, přiložit autoinjektor kolmo k vnější straně stehna (lze i přes oděv), silně zatlačit až do cvaknutí, podržet 5–10 sekund, masírovat místo vpichu a volat 155.',
    options: [
      'Sejmout kryt, aplikovat autoinjektor šikmo pod úhlem 45° do hýžďového svalu nebo přímo do podkoží břicha, ihned po vpichu vytáhnout a podat antihistaminika v tabletách.',
      'Sejmout bezpečnostní kryt, přiložit autoinjektor kolmo k vnější straně stehna (lze i přes oděv), silně zatlačit až do cvaknutí, podržet 5–10 sekund, masírovat místo vpichu a volat 155.',
      'Aplikovat autoinjektor přímo do žíly na předloktí nebo do deltového svalu na paži, držet po dobu 60 sekund a postiženého uložit do polohy se svěšenou hlavou.',
      'Přiložit autoinjektor na palec ruky nebo plosku nohy pro rychlou periferní absorpci, stisknout píst a ponechat postiženého v chůzi pro zrychlení krevního oběhu.'
    ],
    correctOption: 1,
    rationale: 'Adrenalin (epinefrin) intramuskulárně do anterolaterální strany stehna zužuje cévy, zvyšuje tlak a rozšiřuje dýchací cesty. Včasné podání zachraňuje život před udušením otokem hrtanu.',
    source: 'Doporučené postupy České společnosti alergologie a klinické imunologie'
  },
  {
    id: 'zdr-10',
    subject: 'Zdravověda a první pomoc',
    topic: 'Cévní mozková příhoda (CMP) a test FAST',
    question: 'Co znamená mezinárodní diagnostický test FAST pro rychlé rozpoznání cévní mozkové příhody (mrtvice)?',
    answer: 'F = Face (pokles koutku úst, asymetrie obličeje), A = Arms (ochrnutí/pokles jedné paže při předpažení), S = Speech (porucha řeči, nesrozumitelnost), T = Time (čas je mozek – okamžitě volat 155 a hlásit čas vzniku příznaků).',
    options: [
      'F = Fractures (kontrola zlomenin), A = Airway (zprůchodnění dýchacích cest), S = Shock (protišoková opatření), T = Tourniquet (aplikace zaškrcovadla při krvácení).',
      'F = Face (pokles koutku úst, asymetrie obličeje), A = Arms (ochrnutí/pokles jedné paže při předpažení), S = Speech (porucha řeči, nesrozumitelnost), T = Time (čas je mozek – okamžitě volat 155 a hlásit čas vzniku příznaků).',
      'F = Fever (měření tělesné teploty), A = Abdomen (vyšetření břišní stěny), S = Spine (fixace krční páteře), T = Transport (okamžitý přesun do vězeňské nemocnice).',
      'F = Frequency (tepová frekvence), A = Alertness (stupeň bdělosti dle AVPU), S = Saturation (okysličení krve pulzním oxymetrem), T = Tension (tlak krve tonometrem).'
    ],
    correctOption: 1,
    rationale: 'Při ischemické mozkové příhodě rozhoduje časové okno pro trombolýzu (ideálně do 4,5 hodiny od prvních příznaků). Test FAST umožňuje laickému zachránci okamžité rozpoznání.',
    source: 'Národní doporučený postup pro iktovou péči v ČR'
  },
  {
    id: 'zdr-11',
    subject: 'Zdravověda a první pomoc',
    topic: 'Dusící se osoba (Obstrukce dýchacích cest)',
    question: 'Jaký je správný postup první pomoci u dospělého člověka při těžké neprůchodnosti dýchacích cest cizím tělesem (nemůže mluvit, kašlat ani dýchat, drží se za krk)?',
    answer: 'Až 5 rázných úderů dlaní mezi lopatky v předklonu (Gordonovy údery); pokud nepomohou, provést až 5 stlačení nadbřišku (Heimlichův manévr) zezadu; postupy střídat, při ztrátě vědomí ihned zahájit KPR 30:2.',
    options: [
      'Okamžitě provést naslepo hlubokou revizi dutiny ústní prsty, podat zraněnému 0,5 l vody k zapití sousta a provést 10 stlačení hrudní kosti v záklonu hlavy.',
      'Až 5 rázných úderů dlaní mezi lopatky v předklonu (Gordonovy údery); pokud nepomohou, provést až 5 stlačení nadbřišku (Heimlichův manévr) zezadu; postupy střídat, při ztrátě vědomí ihned zahájit KPR 30:2.',
      'Okamžitě provést koniotomii kapesním nožem, uložit postiženého do lehu na zádech a provádět nepřerušované stlačování břicha oběma rukama až do uvolnění dýchacích cest.',
      'Zavěsit postiženého za dolní končetiny hlavou dolů, provést 15 silných úderů pěstí do oblasti beder a podat léky na uvolnění hladkého svalstva průdušek.'
    ],
    correctOption: 1,
    rationale: 'Gordonovy údery a Heimlichův manévr prudce zvýší nitrohrudní tlak a vypudí váznoucí těleso z hrtanu/průdušnice. Při bezvědomí se okamžitě přechází na resuscitaci.',
    source: 'ERC Guidelines – Management of Foreign Body Airway Obstruction (FBAO)'
  },
  {
    id: 'zdr-12',
    subject: 'Zdravověda a první pomoc',
    topic: 'Popáleniny a poleptání',
    question: 'Jaká jsou základní pravidla první pomoci při termických popáleninách II. a III. stupně?',
    answer: 'Okamžitě chladit čistou vlažnou/chladnou vodou (10–20 minut, vyvarovat se celkového podchlazení), nestrhávat přiškvařený oděv, sterilně či čistě překrýt (ideálně netrhavým krytím / Water-Jel gelem), nepíchat puchýře a nemaže se mastmi.',
    options: [
      'Chladit ledem nebo ledovou tříští po dobu nejméně 60 minut, vzniklé puchýře sterilně propíchnout k vypuštění tekutiny a ránu potřít hojivou mastí s panthenolem nebo lihem.',
      'Okamžitě chladit čistou vlažnou/chladnou vodou (10–20 minut, vyvarovat se celkového podchlazení), nestrhávat přiškvařený oděv, sterilně či čistě překrýt (ideálně netrhavým krytím / Water-Jel gelem), nepíchat puchýře a nemaže se mastmi.',
      'Přiškvařené syntetické oděvy ihned strhnout z rány, popálené plochy vydezinfikovat koncentrovaným jódovým roztokem a pevně stáhnout tlakovým obvazem pro zástavu edému.',
      'Ponořit celého popáleného do ledové lázně na 45 minut, na rány nasypat zásyp s antibiotiky a ponechat plochy zcela nezakryté pro volný přístup vzduchu.'
    ],
    correctOption: 1,
    rationale: 'Chlazení zastavuje termickou destrukci hlubších vrstev tkání a tlumí bolest. Aplikace mastí, zásypů nebo trhání oděvu zhoršuje infekci a poškozuje tkáň.',
    source: 'Popáleninová medicína a traumatologie – FN Královské Vinohrady'
  },
  {
    id: 'zdr-13',
    subject: 'Zdravověda a první pomoc',
    topic: 'Infekční rizika a profylaxe personálu',
    question: 'Jaký je postup při poranění příslušníka VS ČR o použitou injekční jehlu nalezenou při bezpečnostní prohlídce na cele (riziko HIV, HBV, HCV)?',
    answer: 'Ránu nechat krátce volně krvácet (nevymačkávat násilím), důkladně omýt mýdlovou vodou a vydezinfikovat (např. Jodisol / Betadine), jehlu bezpečně zajistit v pevném kontejneru, událost ihned ohlásit nadřízenému a do 2–4 hodin vyhledat infekční oddělení pro zahájení PEP (postexpoziční profylaxe).',
    options: [
      'Ránu okamžitě silně vymačkat až do hloubky, končetinu zaškrtit turniketem, ránu vypálit desinfekcí na bázi chloru a na infekční oddělení se dostavit až po 14 dnech na kontrolní test protilátek.',
      'Ránu nechat krátce volně krvácet (nevymačkávat násilím), důkladně omýt mýdlovou vodou a vydezinfikovat (např. Jodisol / Betadine), jehlu bezpečně zajistit v pevném kontejneru, událost ihned ohlásit nadřízenému a do 2–4 hodin vyhledat infekční oddělení pro zahájení PEP (postexpoziční profylaxe).',
      'Jehlu zabalit do igelitového sáčku pro chemickou expertizu, ránu pouze zalepit rychloobvazem a lékařské vyšetření vyhledat pouze v případě, že se u odsouzeného potvrdí pozitivita na AIDS.',
      'Krev z rány okamžitě vysát ústy, aplikovat alkoholový obklad, událost zapsat pouze do denního záznamu bez hlášení a profylaxi zahájit nejdříve po uplynutí inkubační doby 3 měsíců.'
    ],
    correctOption: 1,
    rationale: 'Včasné zahájení postexpoziční profylaxe (PEP) proti HIV do několika hodin po expozici dramaticky snižuje riziko sérokonverze. Současně se odebírají nulté vzorky krve a kontroluje se očkování proti žloutence B.',
    source: 'Metodický pokyn Hlavního hygienika ČR a zdravotnické služby VS ČR'
  },
  {
    id: 'zdr-14',
    subject: 'Zdravověda a první pomoc',
    topic: 'Tlakový obvaz a packing rány',
    question: 'Jak se správně ošetřuje hluboká krvácející rána v místech, kde nelze použít turniket (např. tříslo, podpaží, krk)?',
    answer: 'Provést vyplnění (packing) rány hemostatickou nebo sterilní gázou s nepřetržitým přímým tlakem prsty/dlaní po dobu minimálně 3 minut a přiložit tlakový obvaz (např. Izraelský tlakový obvaz).',
    options: [
      'Naložit škrtidlo CAT přímo přes krk nebo tříslo s maximálním dotažením vratidla a ránu pouze povrchově překrýt jedním sterilním čtvercem bez manuální komprese.',
      'Provést vyplnění (packing) rány hemostatickou nebo sterilní gázou s nepřetržitým přímým tlakem prsty/dlaní po dobu minimálně 3 minut a přiložit tlakový obvaz (např. Izraelský tlakový obvaz).',
      'Do hloubky rány nasypat hemostatický prášek bez gázy, stlačit ránu po dobu 10 sekund a nechat krev volně prosakovat do savého obvazu bez fixace tlakovým prvkem.',
      'Slepo v hloubce rány sondovat pinzetou a zachytit krvácející tepnu chirurgickým peánem, ránu vypláchnout fyziologickým roztokem a vyčkat příjezdu chirurgického týmu.'
    ],
    correctOption: 1,
    rationale: 'V junkčních oblastech (třísla, axily) je wound packing jedinou účinnou metodou přímého stlačení poraněné cévy v hloubce rány. Na krk je aplikace škrtidla přísně zakázána.',
    source: 'TCCC Guidelines – Junctional Bleeding Management'
  },
  {
    id: 'zdr-15',
    subject: 'Zdravověda a první pomoc',
    topic: 'Poranění páteře a manipulace',
    question: 'Jaké jsou zásady manipulace s osobou s podezřením na poranění páteře (např. po pádu z výšky nebo autonehodě)?',
    answer: 'S postiženým nehýbat, nedochází-li k bezprostřednímu ohrožení života; zajistit manuální stabilizaci hlavy a krční páteře v neutrální ose a vyčkat na transportní pomůcky (vakuová matrace, Scoop rám, krční límec).',
    options: [
      'Okamžitě provést vyproštění Rautekovým chvatem z jakéhokoliv prostoru bez ohledu na bezpečnost a aktivně vyzkoušet rozsah pohybu krku rotací hlavy do krajních poloh.',
      'S postiženým nehýbat, nedochází-li k bezprostřednímu ohrožení života; zajistit manuální stabilizaci hlavy a krční páteře v neutrální ose a vyčkat na transportní pomůcky (vakuová matrace, Scoop rám, krční límec).',
      'Postiženého posadit s oporou zad, podložit hlavu měkkým polštářem do mírného předklonu a transportovat v sedě na běžné židli za asistence dvou zachránců.',
      'Ihned přetočit zraněného do stabilizované polohy na břicho k uvolnění dýchacích cest bez fixace krční páteře a podložit dolní končetiny pro prevenci míšního šoku.'
    ],
    correctOption: 1,
    rationale: 'Nevhodná manipulace může vést k posunu nestabilního obratle a nevratnému přerušení míchy s následným ochrnutím (kvadruplegií) nebo zástavou dechu.',
    source: 'Traumatologie páteře a urgentní medicína'
  },
  {
    id: 'zdr-16',
    subject: 'Zdravověda a první pomoc',
    topic: 'Hypoglykemické kóma vs. Hyperglykémie',
    question: 'Jak se poskytuje první pomoc při těžké hypoglykémii u diabetika (zmatenost, třes, pocení, agresivita až bezvědomí)?',
    answer: 'Při zachovaném vědomí a polykání podat rychle vstřebatelný cukr (slazený nápoj, hroznový cukr, džus); při bezvědomí NIKDY nepodávat tekutiny do úst, polohovat na bok a volat ZZS.',
    options: [
      'Ihned aplikovat pacientovo inzulínové pero v plné dávce do břišní stěny, podat neslazený čaj a uložit postiženého do vodorovné polohy na zádech.',
      'Při zachovaném vědomí a polykání podat rychle vstřebatelný cukr (slazený nápoj, hroznový cukr, džus); při bezvědomí NIKDY nepodávat tekutiny do úst, polohovat na bok a volat ZZS.',
      'Při bezvědomí nalít do úst koncentrovaný cukerný sirup nebo teplý slazený čaj, zaklonit hlavu a masírovat krk pro usnadnění polykacího reflexu.',
      'Podat výhradně nízkoenergetické dietní potraviny s vysokým obsahem vlákniny, zakázat příjem jednoduchých sacharidů a nechat pacienta vyspat bez lékařské kontroly.'
    ],
    correctOption: 1,
    rationale: 'Při hypoglykémii trpí mozkové buňky kritickým nedostatkem glukózy. Podání tekutin bezvědomému hrozí aspirací a udušením; v bezvědomí pomůže nitrožilní glukóza aplikovaná lékařem.',
    source: 'Diabetologie v akutní medicíně – ČLS JEP'
  },
  {
    id: 'zdr-17',
    subject: 'Zdravověda a první pomoc',
    topic: 'Akutní infarkt myokardu',
    question: 'Jaké jsou typické varovné signály akutního infarktu myokardu (srdeční příhody)?',
    answer: 'Svíravá, pálivá nebo tlaková bolest za hrudní kostí trvající >15 minut, vyzařující do levé paže, krku, čelisti nebo zad, dušnost, pocení, nevolnost a úzkost ze smrti.',
    options: [
      'Ostrá píchavá bolest na hrotu srdce závislá na hlubokém nádechu a poloze těla, trvající několik sekund, která zcela vymizí při mírném rozcvičení hrudníku.',
      'Svíravá, pálivá nebo tlaková bolest za hrudní kostí trvající >15 minut, vyzařující do levé paže, krku, čelisti nebo zad, dušnost, pocení, nevolnost a úzkost ze smrti.',
      'Křečovitá kolikovitá bolest v pravém podžebří s propagací do pravého stehna, provázená vysokou horečkou a svěděním kůže po požití tučného jídla.',
      'Náhlá pulzující bolest v zátylku s dvojitým viděním, asymetrií zornic a jednostranným brněním prstů dolní končetiny bez přítomnosti dušnosti.'
    ],
    correctOption: 1,
    rationale: 'Ischémie srdečního svalu vyžaduje okamžitý klidový režim v polosedě, uvolnění těsného oděvu, zákaz jakékoliv fyzické námahy a neodkladné volání linky 155.',
    source: 'Kardiologie pro záchranáře – Česká kardiologická společnost'
  },
  {
    id: 'zdr-18',
    subject: 'Zdravověda a první pomoc',
    topic: 'Hypotermie a omrzliny',
    question: 'Jaká je správná první pomoc u silně podchlazeného vězně nalezeného v nevytápěném prostoru věznice (tělesná teplota <32 °C)?',
    answer: 'Zabránit dalším ztrátám tepla (odstranit mokrý oděv, zabalit do izotermické fólie a teplých dek), ohřívat pozvolna a pasivně, s postiženým manipulovat extrémně šetrně (hrozí fibrilace komor při prudkém pohybu), podat teplý slazený nápoj pouze při plném vědomí.',
    options: [
      'Postiženého okamžitě vložit do horké lázně o teplotě 45 °C, podat koncentrovaný alkohol k rozšíření cév a energicky třít končetiny hrubou tkaninou.',
      'Zabránit dalším ztrátám tepla (odstranit mokrý oděv, zabalit do izotermické fólie a teplých dek), ohřívat pozvolna a pasivně, s postiženým manipulovat extrémně šetrně (hrozí fibrilace komor při prudkém pohybu), podat teplý slazený nápoj pouze při plném vědomí.',
      'Přinutit zraněného ke dřepům a rychlému běhu na místě pro stimulaci svalové termogeneze, omrzlé prsty třít sněhem a podat horkou kávu bez cukru.',
      'Aplikovat horké termofory přímo na distální části končetin (chodidla a dlaně), provádět intenzivní masáž svalstva a uložit do Trendelenburgovy polohy.'
    ],
    correctOption: 1,
    rationale: 'Prudké zahřívání nebo hrubá manipulace vyvolá návrat studené a kyselé krve z periferie do jádra (afterdrop) s fatální srdeční zástavou. Alkohol navíc roztahuje periferní cévy a zrychluje prochladnutí.',
    source: 'Urgentní medicína – Hypotermie a chladová poranění'
  },
  {
    id: 'zdr-19',
    subject: 'Zdravověda a první pomoc',
    topic: 'Zlomeniny a jejich znehybnění',
    question: 'Jaké je základní pravidlo pro znehybnění (fixaci) zavřené zlomeniny dlouhé kosti (např. předloktí nebo bérce)?',
    answer: 'Znehybnit minimálně dva sousední klouby – jeden nad a jeden pod místem zlomeniny (pomocí dlahy SAM splint nebo improvizovaně) a kontrolovat periferní prokrvení a citlivost.',
    options: [
      'Před přiložením dlahy provést silným tahem reponaci a narovnání kostních úlomků do anatomické osy a zafixovat pouze samotné místo zlomeniny elastickým obinadlem.',
      'Znehybnit minimálně dva sousední klouby – jeden nad a jeden pod místem zlomeniny (pomocí dlahy SAM splint nebo improvizovaně) a kontrolovat periferní prokrvení a citlivost.',
      'Znehybnit výhradně jeden kloub nejblíže ke zlomenině a končetinu pevně stáhnout škrtidlem k prevenci vzniku poúrazového edému a hematomu.',
      'Fixovat celou končetinu včetně páteře do vakuové matrace bez použití dlahy a aplikovat hřejivé zábaly přímo na místo předpokládané fraktury.'
    ],
    correctOption: 1,
    rationale: 'Správná fixace zabraňuje pohybu kostních úlomků, tlumí bolest a předchází sekundárnímu poškození cév, nervů a svalů.',
    source: 'Základy traumatologie a první pomoci'
  },
  {
    id: 'zdr-20',
    subject: 'Zdravověda a první pomoc',
    topic: 'Poranění oka',
    question: 'Jak se poskytuje první pomoc při mechanickém zapíchnutí cizího tělesa (např. střepu či kovu) do oční koule?',
    answer: 'Cizí těleso z oka NIKDY nevytahovat, těleso sterilně zastabilizovat a fixovat (např. pomocí kelímku či obvazového věnečku), krýt obě oči (z důvodu synkineze a zamezení pohybu poraněného oka) a zajistit transport k očnímu lékaři.',
    options: [
      'Cizí těleso opatrně vytáhnout sterilní pinzetou ve směru osy vniku, oko důkladně vypláchnout proudem tekoucí vody a přiložit krytí pouze na zraněné oko.',
      'Cizí těleso z oka NIKDY nevytahovat, těleso sterilně zastabilizovat a fixovat (např. pomocí kelímku či obvazového věnečku), krýt obě oči (z důvodu synkineze a zamezení pohybu poraněného oka) a zajistit transport k očnímu lékaři.',
      'Na poraněné oko aplikovat oční mast s antibiotiky, přiložit pevný tlakový obvaz k zástavě nitroočního krvácení a nechat druhé oko zcela nezakryté pro orientaci.',
      'Vyzvat zraněného k intenzivnímu mrkání a promnutí oka přes sterilní gázu, aplikovat dezinfekční kapky s alkoholem a zkontrolovat zrak čtením textu.'
    ],
    correctOption: 1,
    rationale: 'Vytahování tělesa laickým zachráncem vede k výhřezu očních struktur a trvalé slepotě. Zakrytí obou očí eliminuje zrcadlový pohyb očních bulbů.',
    source: 'Oftalmologie a urgentní péče v traumatologii'
  },
  {
    id: 'zdr-21',
    subject: 'Zdravověda a první pomoc',
    topic: 'Aktivace Záchranného řetězce (155 vs 112)',
    question: 'Jaké klíčové informace musí příslušník VS ČR sdělit operátorovi Zdravotnické záchranné služby (linka 155) při hlášení závažného úrazu ve věznici?',
    answer: '1. Kde přesně se incident stal (název věznice, adresa, přesný vchod/brána), 2. Co se stalo a kolik je zraněných, 3. Stav vědomí a dýchání zraněných, 4. Kdo volá, 5. Nikdy nezavěšovat jako první.',
    options: [
      'Pouze sdělit kód věznice a požadavek na příjezd sanitky, okamžitě zavěsit pro uvolnění linky a vyčkávat na příjezd posádky u hlavní brány bez upřesnění stavu pacienta.',
      '1. Kde přesně se incident stal (název věznice, adresa, přesný vchod/brána), 2. Co se stalo a kolik je zraněných, 3. Stav vědomí a dýchání zraněných, 4. Kdo volá, 5. Nikdy nezavěšovat jako první.',
      'Nahlásit trestní minulost a paragrafové zařazení zraněného vězně, datum konce trestu, jméno velitele směny a požadovat výhradně leteckou záchrannou službu.',
      'Uvést pouze počet přítomných příslušníků eskorty, typ použitých služebních zbraní a vyčkat na zpětné zavolání krajského operačního střediska policie.'
    ],
    correctOption: 1,
    rationale: 'Strukturované hlášení umožňuje operátorovi vyslat adekvátní posádku (RLP s lékařem vs RZP) a navigovat personál k místu zásahu v rozsáhlém vězeňském areálu.',
    source: 'Standardy operačního řízení ZZS ČR a směrnice VS ČR'
  },
  {
    id: 'zdr-22',
    subject: 'Zdravověda a první pomoc',
    topic: 'Šok a protišoková opatření (5T)',
    question: 'Co zahrnuje klasické pravidlo 5T jako souhrn protišokových opatření při rozvoji traumatického šoku?',
    answer: '1. Teplo (zabalení do fólie/deky), 2. Ticho (uklidnění, psychická podpora), 3. Tišení bolesti (znehybnění, šetrné ošetření), 4. Tekutiny (pouze vlhčení rtů, NIKDY nepodávat pít), 5. Transport (odborný transport ZZS).',
    options: [
      '1. Tekutiny (vypití min. 1,5 l minerálky), 2. Teplota (horká sprcha), 3. Terapie (podání analgetik perorálně), 4. Tlak (tlakový obvaz na celé tělo), 5. Testování (chůze).',
      '1. Teplo (zabalení do fólie/deky), 2. Ticho (uklidnění, psychická podpora), 3. Tišení bolesti (znehybnění, šetrné ošetření), 4. Tekutiny (pouze vlhčení rtů, NIKDY nepodávat pít), 5. Transport (odborný transport ZZS).',
      '1. Tourniquet (zaškrcení končetin), 2. Třídění (triáž dle START), 3. Tenze (dekomprese hrudníku jehlou), 4. Tamponáda (packing rány), 5. Trakce (narovnání zlomenin).',
      '1. Trénink (fyzická aktivita), 2. Tlak (měření TK každou minutu), 3. Tlumení (aplikace sedativ), 4. Termofor (přikládání vroucí vody na břicho), 5. Telefonát (kontakt rodiny).'
    ],
    correctOption: 1,
    rationale: 'Protišoková opatření 5T stabilizují mikrocirkulaci a brání prohloubení centralizace oběhu před příjezdem záchranné služby.',
    source: 'Standardy první pomoci Českého červeného kříže'
  }
  ,
  // 31. Intoxikace a předávkování
  {
    id: 'zdr-31',
    subject: 'Zdravověda a první pomoc',
    topic: 'Akutní stavy',
    question: 'Jaké jsou typické příznaky předávkování opioidy (např. heroin, fentanyl) a jaká je první pomoc?',
    answer: 'Příznaky: zpomalené až zástavové dýchání, bezvědomí, modrání rtů a prstů (cyanóza), extrémně zúžené zorničky (špendlíkové hlavičky). První pomoc: přivolat ZZS, zajistit dýchací cesty, při zástavě dechu zahájit KPR, pokud je k dispozici, podat antidotum Naloxon (Nyxoid sprej do nosu).',
    options: [
      'Příznaky: hyperaktivita, rozšířené zorničky, rychlý tep. První pomoc: podat kávu a nechat osobu běhat, aby se urychlil metabolismus.',
      'Příznaky: zpomalené až zástavové dýchání, bezvědomí, modrání rtů a prstů (cyanóza), extrémně zúžené zorničky (špendlíkové hlavičky). První pomoc: přivolat ZZS, zajistit dýchací cesty, při zástavě dechu zahájit KPR, pokud je k dispozici, podat antidotum Naloxon (Nyxoid sprej do nosu).',
      'Příznaky: zvracení krve a silné křeče. První pomoc: podat aktivní uhlí a donutit osobu vypít velké množství vody.',
      'Příznaky: žluté zbarvení kůže a očí. První pomoc: podat sladký čaj a uložit do stabilizované polohy.'
    ],
    correctOption: 1,
    rationale: 'Předávkování opioidy je život ohrožující stav kvůli útlumu dýchacího centra v mozku. Rychlé podání Naloxonu (antidota) a podpora dýchání zachraňuje život.',
    source: 'Metodický pokyn zdravotnické služby VS ČR'
  },
  // 32. Anafylaktický šok
  {
    id: 'zdr-32',
    subject: 'Zdravověda a první pomoc',
    topic: 'Akutní stavy',
    question: 'Jak se projevuje anafylaktický šok a jaká je neodkladná první pomoc?',
    answer: 'Jde o těžkou alergickou reakci (např. na bodnutí hmyzem, potravinu, lék). Projevuje se otokem (zejména rtů, jazyka a dýchacích cest), dušností, poklesem krevního tlaku a poruchou vědomí. První pomoc: přivolat ZZS, uložit do protišokové polohy, u pacienta s předepsaným adrenalinovým autoinjektorem (EpiPen) pomoci s jeho aplikací do stehna, při zástavě dechu zahájit KPR.',
    options: [
      'Jde o mírnou vyrážku. První pomoc: namazat kůži chladivou mastí a podat sklenici vody.',
      'Jde o psychický šok po špatné zprávě. První pomoc: uklidnit osobu a nechat ji odpočívat v sedě.',
      'Jde o těžkou alergickou reakci (např. na bodnutí hmyzem, potravinu, lék). Projevuje se otokem (zejména rtů, jazyka a dýchacích cest), dušností, poklesem krevního tlaku a poruchou vědomí. První pomoc: přivolat ZZS, uložit do protišokové polohy, u pacienta s předepsaným adrenalinovým autoinjektorem (EpiPen) pomoci s jeho aplikací do stehna, při zástavě dechu zahájit KPR.',
      'Jde o úpal ze slunce. První pomoc: přesunout do stínu a podat teplý nápoj.'
    ],
    correctOption: 2,
    rationale: 'Anafylaxe je život ohrožující stav vyžadující okamžitou aplikaci adrenalinu (EpiPen), který rozšíří dýchací cesty a zvedne krevní tlak.',
    source: 'Doporučené postupy ERC (Evropská resuscitační rada)'
  },
  // 33. Popáleniny
  {
    id: 'zdr-33',
    subject: 'Zdravověda a první pomoc',
    topic: 'Traumata',
    question: 'Jaká je správná první pomoc u popálenin 2. a 3. stupně?',
    answer: 'Bezpečně ukončit působení tepla, zasažené místo začít ihned chladit mírným proudem studené vody (minimálně 10-20 minut, chladit pouze popálenou plochu, ne celé tělo - riziko podchlazení), neslupovat přiškvařený oděv, nepropichovat puchýře, nic na ránu nemazat, sterilně krýt (nebo použít čistý igelitový sáček) a přivolat ZZS.',
    options: [
      'Puchýře propíchnout jehlou, aby vytekla tekutina, a ránu zasypat dětským pudrem.',
      'Popáleninu okamžitě namazat mastným krémem, olejem nebo máslem a pevně zavázat obinadlem.',
      'Bezpečně ukončit působení tepla, zasažené místo začít ihned chladit mírným proudem studené vody (minimálně 10-20 minut, chladit pouze popálenou plochu, ne celé tělo - riziko podchlazení), neslupovat přiškvařený oděv, nepropichovat puchýře, nic na ránu nemazat, sterilně krýt (nebo použít čistý igelitový sáček) a přivolat ZZS.',
      'Popáleninu ničím nechladit, protože hrozí infekce, a pouze podat léky proti bolesti.'
    ],
    correctOption: 2,
    rationale: 'Chlazení snižuje hloubku poškození tkání a tlumí bolest. Použití mastí nebo krémů ránu uzavře a brání odvodu tepla (zhoršuje stav).',
    source: 'Doporučené postupy ČČK'
  },
  // 34. Stabilizovaná poloha
  {
    id: 'zdr-34',
    subject: 'Zdravověda a první pomoc',
    topic: 'Základní postupy',
    question: 'Kdy se používá zotavovací (stabilizovaná) poloha na boku?',
    answer: 'Používá se výhradně u pacienta, který je v bezvědomí, ALE normálně a pravidelně dýchá (a nemá podezření na zranění páteře). Účelem je udržet průchodné dýchací cesty a zabránit vdechnutí zvratků.',
    options: [
      'Používá se u pacienta v bezvědomí, který vůbec nedýchá nebo lapá po dechu (gasping).',
      'Používá se výhradně u pacienta, který je v bezvědomí, ALE normálně a pravidelně dýchá (a nemá podezření na zranění páteře). Účelem je udržet průchodné dýchací cesty a zabránit vdechnutí zvratků.',
      'Používá se u všech pacientů s bolestí břicha nebo hrudníku jako úlevová poloha.',
      'Používá se u zlomenin dolních končetin k fixaci kostí.'
    ],
    correctOption: 1,
    rationale: 'Zotavovací poloha zajišťuje dýchací cesty (jazyk nepadá dozadu). Pokud pacient nedýchá normálně, musí ležet na zádech a musí být zahájena KPR.',
    source: 'Doporučené postupy ERC (Evropská resuscitační rada)'
  },
  // 35. Použití škrtidla (CAT) na krku
  {
    id: 'zdr-35',
    subject: 'Zdravověda a první pomoc',
    topic: 'TCCC - Zástava krvácení',
    question: 'Lze použít taktické turniketové škrtidlo (CAT) k zástavě masivního krvácení na krku?',
    answer: 'NE. Škrtidlo (turniket) se používá výhradně k zástavě masivního tepenného krvácení na končetinách (paže, stehna). Aplikace na krk by způsobila udušení. Krvácení na krku se zastavuje přímým tlakem v ráně (prsty/dlouhodobým tlakem ruky) nebo metodou wound packing (tamponáda rány).',
    options: [
      'Ano, ale škrtidlo se smí utáhnout pouze na 50 % maximální síly.',
      'NE. Škrtidlo (turniket) se používá výhradně k zástavě masivního tepenného krvácení na končetinách (paže, stehna). Aplikace na krk by způsobila udušení. Krvácení na krku se zastavuje přímým tlakem v ráně (prsty/dlouhodobým tlakem ruky) nebo metodou wound packing (tamponáda rány).',
      'Ano, je to standardní postup TCCC pro všechny typy masivního krvácení.',
      'Ne, škrtidlo se používá výhradně k fixaci zlomenin a nikdy k zástavě krvácení.'
    ],
    correctOption: 1,
    rationale: 'Turniket okluduje krevní řečiště kompletním stlačením tkáně proti kosti. Na krku by to znemožnilo dýchání a zablokovalo průtok krve do mozku oběma karotidami.',
    source: 'Mezinárodní taktický standard TCCC'
  }
];
