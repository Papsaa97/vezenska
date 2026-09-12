import { Question } from '../../types';

export const profesniEtikaQuestions: Question[] = [
  {
    id: 'pe_01',
    subject: 'Profesní etika',
    topic: 'Základní pojmy etiky',
    question: 'Jakými jevy se zabývá vědní disciplína Etika?',
    answer: 'Etika je praktická filozofická disciplína, věda o správném způsobu života a teorie normativních systémů (mravnost, morálka, právo). Hledá pravidla harmonického a vzájemně prospěšného soužití lidí a zkoumá směřování k nejvyššímu etickému cíli (dobru).',
    options: [
              `Etika je pozitivněprávní nauka zabývající se striktně jazykovým a systematickým výkladem procesních předpisů v trestním řízení a tvorbou služebních předpisů bezpečnostních sborů.`,
              `Etika je teoretická sociologická disciplína zkoumající výhradně statistické rozložení kriminality a efektivitu represivních opatření státu vůči recidivistům bez vazby na morální hodnoty.`,
              `Etika je praktická filozofická disciplína, věda o správném způsobu života a teorie normativních systémů (mravnost, morálka, právo). Hledá pravidla harmonického a vzájemně prospěšného soužití lidí a zkoumá směřování k nejvyššímu etickému cíli (dobru).`,
              `Etika je odvětví obecné psychologie studující biochemické reakce mozku na stresové situace při rozhodování v mezních situacích ohrožení života.`
            ],
    correctOption: 2,
    rationale: 'Etika zkoumá tři základní normativní systémy společnosti (mravnost, morálku a právo), které tvoří vrstvy rozhodování člověka a směřují k naplnění nejvyššího etického cíle.',
    source: 'Studijní opora pro ZOP A – předmět Profesní etika, str. 1',
      explanation: `Etika zkoumá tři základní normativní systémy společnosti (mravnost, morálku a právo), které tvoří vrstvy rozhodování člověka a směřují k naplnění nejvyššího etického cíle. (Právní úprava: Studijní opora pro ZOP A – předmět Profesní etika, str. 1)`
},
  {
    id: 'pe_02',
    subject: 'Profesní etika',
    topic: 'Svoboda a odpovědnost',
    question: 'Jaký je vztah svobody a odpovědnosti při rozhodování a jednání člověka?',
    answer: 'Každý člověk se rodí svobodný a má svobodnou vůli volit své jednání, avšak se svobodou je neoddělitelně spojena osobní odpovědnost za volbu cílů a důsledky svých činů vůči sobě, společnosti i právnímu řádu.',
    options: [
              `Svoboda je v etice chápána jako absolutní nevázanost jakýmikoli pravidly, přičemž odpovědnost nese výhradně stát a nadřízený služební funkcionář, který vydal konkrétní rozkaz.`,
              `Každý člověk se rodí svobodný a má svobodnou vůli volit své jednání, avšak se svobodou je neoddělitelně spojena osobní odpovědnost za volbu cílů a důsledky svých činů vůči sobě, společnosti i právnímu řádu.`,
              `Svoboda jedince je v bezpečnostním sboru zcela potlačena principem subordinace, takže příslušník nenese žádnou osobní ani morální odpovědnost za zvolené prostředky.`,
              `Svoboda volby existuje výhradně v oblasti soukromého života, zatímco při výkonu státní správy je rozhodování determinováno bez možnosti etické sebereflexe a odpovědnosti.`
            ],
    correctOption: 1,
    rationale: 'Svobodné rozhodování zakládá morální a právní odpovědnost. Člověk volí směřování k etickému cíli nebo odklon od něj a nese následky své volby.',
    source: 'Studijní opora pro ZOP A – předmět Profesní etika, str. 1–3',
      explanation: `Svobodné rozhodování zakládá morální a právní odpovědnost. Člověk volí směřování k etickému cíli nebo odklon od něj a nese následky své volby. (Právní úprava: Studijní opora pro ZOP A – předmět Profesní etika, str. 1–3)`
},
  {
    id: 'pe_03',
    subject: 'Profesní etika',
    topic: 'Normativní systémy',
    question: 'O jaké společné základy se opírají normy mravní, morální a právní?',
    answer: 'Opírají se o společný cíl – hledání nejvyššího etického cíle (dobra), ochranu lidské důstojnosti, života, spravedlnosti a zajištění mírového a bezpečného soužití lidí ve společnosti.',
    options: [
              `Nemají žádný společný základ, protože mravnost zkoumá výhradně biologické reflexy, morálka tržní vztahy a právo represivní techniky vězeňství.`,
              `Opírají se o historicky podmíněné náboženské dogmatické předpisy, které jsou pro všechny tři normativní systémy nadřazené platné Ústavě ČR.`,
              `Opírají se výhradně o státní donucení, hrozbu trestní sankce a ekonomickou efektivitu výkonu státní správy v daném rozpočtovém období.`,
              `Opírají se o společný cíl – hledání nejvyššího etického cíle (dobra), ochranu lidské důstojnosti, života, spravedlnosti a zajištění mírového a bezpečného soužití lidí ve společnosti.`
            ],
    correctOption: 3,
    rationale: 'Všechny tři normativní systémy jsou vrstvami téhož úsilí společnosti o regulaci lidského jednání směrem k dobru a ochraně lidských práv.',
    source: 'Studijní opora pro ZOP A – předmět Profesní etika, str. 1–2',
      explanation: `Všechny tři normativní systémy jsou vrstvami téhož úsilí společnosti o regulaci lidského jednání směrem k dobru a ochraně lidských práv. (Právní úprava: Studijní opora pro ZOP A – předmět Profesní etika, str. 1–2)`
},
  {
    id: 'pe_04',
    subject: 'Profesní etika',
    topic: 'Etický cíl',
    question: 'Jaký vztah k našemu životu má idea a směr jednání, který označujeme jako nejvyšší etický cíl?',
    answer: 'Etický cíl je ideový směr zaměřený k absolutnímu dobru; není to dosažitelný fyzický bod, ale celoživotní kompas, podle kterého poměřujeme své úmysly, činy a hodnotový žebříček.',
    options: [
              `Etický cíl je vymezen jako stav absolutního utilitarianismu, kde jednorázový užitek většiny plně ospravedlňuje porušení základních práv jednotlivce.`,
              `Etický cíl je ideový směr zaměřený k absolutnímu dobru; není to dosažitelný fyzický bod, ale celoživotní kompas, podle kterého poměřujeme své úmysly, činy a hodnotový žebříček.`,
              `Etický cíl je formalizovaný soubor interních protikorupčních opatření vydaný formou nařízení generálního ředitele, jehož platnost končí splněním úkolu.`,
              `Etický cíl představuje konkrétní a měřitelný kariérní postup v hierarchii bezpečnostního sboru stanovený ve služebním hodnocení pro daný kalendářní rok.`
            ],
    correctOption: 1,
    rationale: 'Etický cíl nemá materiální podstatu, je to idea a směr. Člověk se v každé situaci rozhoduje, zda se k dobru přiblíží, nebo se od něj odchýlí.',
    source: 'Studijní opora pro ZOP A – předmět Profesní etika, str. 7',
      explanation: `Etický cíl nemá materiální podstatu, je to idea a směr. Člověk se v každé situaci rozhoduje, zda se k dobru přiblíží, nebo se od něj odchýlí. (Právní úprava: Studijní opora pro ZOP A – předmět Profesní etika, str. 7)`
},
  {
    id: 'pe_05',
    subject: 'Profesní etika',
    topic: 'Sankce v normativních systémech',
    question: 'Co jsou při rozhodování a jednání člověka sankce vnitřní a vnější, pozitivní a negativní?',
    answer: 'Vnitřní sankce působí skrze svědomí (pocit viny vs. čisté svědomí/sebeúcta), vnější sankce přicházejí z okolí od společnosti nebo státu jako pozitivní (pochvala, odměna, uznání) či negativní (odsouzení, vyloučení, trest, pokuta).',
    options: [
              `Vnitřní sankce jsou somatické projevy stresu a nemoci, zatímco vnější sankce jsou výhradně pozitivní stimuly ve formě služebního povýšení a medailí.`,
              `Vnitřní sankce působí skrze svědomí (pocit viny vs. čisté svědomí/sebeúcta), vnější sankce přicházejí z okolí od společnosti nebo státu jako pozitivní (pochvala, odměna, uznání) či negativní (odsouzení, vyloučení, trest, pokuta).`,
              `Všechny sankce v normativních systémech mají ze své podstaty výhradně negativní a represivní charakter; pozitivní sankce etická teorie neuznává.`,
              `Vnitřní sankce představují služební kázeňské tresty udělené ředitelem věznice a vnější sankce jsou výhradně peněžité tresty vymáhané soudním exekutorem.`
            ],
    correctOption: 1,
    rationale: 'Mravnost využívá interní sankce (svědomí), morálka nepsané vnější sociální sankce a právo institucionalizované vnější právní sankce.',
    source: 'Studijní opora pro ZOP A – předmět Profesní etika, str. 1–2',
      explanation: `Mravnost využívá interní sankce (svědomí), morálka nepsané vnější sociální sankce a právo institucionalizované vnější právní sankce. (Právní úprava: Studijní opora pro ZOP A – předmět Profesní etika, str. 1–2)`
},
  {
    id: 'pe_06',
    subject: 'Profesní etika',
    topic: 'Normativní systém mravnost',
    question: 'Jaké sankce při rozhodování a jednání člověka využívá normativní systém mravnost?',
    answer: 'Využívá výhradně vnitřní (interní) sankce, kterými je lidské svědomí (pocit viny, výčitky svědomí při provinění, pocit klidu a sebeúcty při správném jednání).',
    options: [
              `Využívá nepsané společenské sankce v podobě veřejného odsouzení, ostrakizace a vyloučení jednotlivce z profesní komunity.`,
              `Využívá formalizované vnější sankce, jako je uložení kázeňského trestu písemné důtky nebo snížení základního služebního tarifu.`,
              `Využívá právní sankce spočívající v odnětí svobody, propadnutí majetku nebo zákazu činnosti na základě soudního rozhodnutí.`,
              `Využívá výhradně vnitřní (interní) sankce, kterými je lidské svědomí (pocit viny, výčitky svědomí při provinění, pocit klidu a sebeúcty při správném jednání).`
            ],
    correctOption: 3,
    rationale: 'Mravnost se opírá o vnitřní hledání jednotlivce a svědomí je její jedinou interní pozitivní i negativní sankcí.',
    source: 'Studijní opora pro ZOP A – předmět Profesní etika, str. 2',
      explanation: `Mravnost se opírá o vnitřní hledání jednotlivce a svědomí je její jedinou interní pozitivní i negativní sankcí. (Právní úprava: Studijní opora pro ZOP A – předmět Profesní etika, str. 2)`
},
  {
    id: 'pe_07',
    subject: 'Profesní etika',
    topic: 'Normativní systém morálka',
    question: 'Jaké sociální sankce při rozhodování a jednání člověka využívá normativní systém morálka?',
    answer: 'Využívá vnější nepsané sociální sankce: pozitivní (společenské uznání, respekt, přijetí skupinou) a negativní (veřejné odsouzení, pohrdání, pomluva, ostrakizace/vyloučení z komunity).',
    options: [
              `Využívá institucionalizované právní tresty stanovené v trestním zákoníku a vynucované státním aparátem a justiční stráží.`,
              `Využívá výhradně vnitřní psychické sankce, kterými jsou výčitky svědomí a pocit studu bez jakékoliv vazby na sociální okolí jedince.`,
              `Využívá administrativní procesní pokuty a opatření k nápravě ukládaná orgány dohledu a kontrolními inspekcemi státu.`,
              `Využívá vnější nepsané sociální sankce: pozitivní (společenské uznání, respekt, přijetí skupinou) a negativní (veřejné odsouzení, pohrdání, pomluva, ostrakizace/vyloučení z komunity).`
            ],
    correctOption: 3,
    rationale: 'Morálka se opírá o společenské zvyklosti a tradice; není vázána svědomím přímo, ale reguluje chování vnějšími sociálními sankcemi okolí.',
    source: 'Studijní opora pro ZOP A – předmět Profesní etika, str. 2',
      explanation: `Morálka se opírá o společenské zvyklosti a tradice; není vázána svědomím přímo, ale reguluje chování vnějšími sociálními sankcemi okolí. (Právní úprava: Studijní opora pro ZOP A – předmět Profesní etika, str. 2)`
},
  {
    id: 'pe_08',
    subject: 'Profesní etika',
    topic: 'Normativní systém právo',
    question: 'Jaké sociální sankce při rozhodování a jednání člověka využívá normativní systém právo?',
    answer: 'Využívá formalizované, státem vynutitelné vnější sankce: negativní (tresty, pokuty, propadnutí majetku, odnětí svobody) a pozitivní (právní ochrana, přiznání nároků a právních záruk).',
    options: [
              `Využívá výhradně pozitivní finanční pobídky a dotace pro bezúhonné občany, přičemž negativní sankce jsou v právním státě zakázány.`,
              `Využívá výhradně nepsané etické zvyklosti a společenský posměch komunity při zjištění protiprávního chování pachatele.`,
              `Využívá formalizované, státem vynutitelné vnější sankce: negativní (tresty, pokuty, propadnutí majetku, odnětí svobody) a pozitivní (právní ochrana, přiznání nároků a právních záruk).`,
              `Využívá výhradně neformální vnitřní sankce svědomí a morální apele na čest a bezúhonnost občana bez možnosti mocenského donucení.`
            ],
    correctOption: 2,
    rationale: 'Právo nastupuje tam, kde selhává morálka a mravnost. Legitimně deleguje moc na státní orgány k vynucení dodržování norem vnějšími sankcemi.',
    source: 'Studijní opora pro ZOP A – předmět Profesní etika, str. 2',
      explanation: `Právo nastupuje tam, kde selhává morálka a mravnost. Legitimně deleguje moc na státní orgány k vynucení dodržování norem vnějšími sankcemi. (Právní úprava: Studijní opora pro ZOP A – předmět Profesní etika, str. 2)`
},
  {
    id: 'pe_09',
    subject: 'Profesní etika',
    topic: 'Individuální etika',
    question: 'Čím se zabývá etická disciplína „Individuální etika“?',
    answer: 'Zkoumá procesy mravního zrání jednotlivce, vlivy působící na dosahování různých stupňů socializace, formování svědomí a osobní volbu směřování k nejvyššímu etickému cíli.',
    options: [
              `Zkoumá procesy mravního zrání jednotlivce, vlivy působící na dosahování různých stupňů socializace, formování svědomí a osobní volbu směřování k nejvyššímu etickému cíli.`,
              `Zabývá se výhradně statistickou analýzou korupčních rizik u vedoucích služebních funkcionářů v ozbrojených sborech.`,
              `Zkoumá kolektivní rozhodovací procesy ve státní správě a optimalizaci legislativních procedur v parlamentních výborech.`,
              `Zkoumá makroekonomické dopady vězeňství na státní rozpočet a efektivitu zadávání veřejných zakázek ve VS ČR.`
            ],
    correctOption: 0,
    rationale: 'Individuální etika se zaměřuje na člověka jako samostatnou bytost, jeho morální profil, vliv edukace a prostředí na jeho hodnotovou orientaci.',
    source: 'Studijní opora pro ZOP A – předmět Profesní etika, str. 3',
      explanation: `Individuální etika se zaměřuje na člověka jako samostatnou bytost, jeho morální profil, vliv edukace a prostředí na jeho hodnotovou orientaci. (Právní úprava: Studijní opora pro ZOP A – předmět Profesní etika, str. 3)`
},
  {
    id: 'pe_10',
    subject: 'Profesní etika',
    topic: 'Deskriptivní etika',
    question: 'Jaké souvislosti rozlišuje etická disciplína „Deskriptivní etika“?',
    answer: 'Popisuje a analyzuje reálné etické kontexty situací bez jejich hodnocení – zúčastněné osoby, čas, místo, vztahy, kulturní prostředí a skutečné mravní zvyklosti dané společnosti.',
    options: [
              `Vytváří hierarchický žebříček služebních povinností a předepisuje přesné vzorce chování při provádění osobních prohlídek odsouzených.`,
              `Popisuje a analyzuje reálné etické kontexty situací bez jejich hodnocení – zúčastněné osoby, čas, místo, vztahy, kulturní prostředí a skutečné mravní zvyklosti dané společnosti.`,
              `Zkoumá metafyzickou podstatu dobra a zla a odvozuje etická pravidla výhradně z přirozeného božského práva a církevních dogmat.`,
              `Formuluje závazné normativní imperativy a stanovuje trestněprávní odpovědnost za nedodržení etických zásad v bezpečnostních sborech.`
            ],
    correctOption: 1,
    rationale: 'Deskriptivní etika na rozdíl od normativní etiky (která říká, co má být) nestanoví normy, ale věcně popisuje reálný stav lidského chování a mravních postojů.',
    source: 'Studijní opora pro ZOP A – předmět Profesní etika, str. 8',
      explanation: `Deskriptivní etika na rozdíl od normativní etiky (která říká, co má být) nestanoví normy, ale věcně popisuje reálný stav lidského chování a mravních postojů. (Právní úprava: Studijní opora pro ZOP A – předmět Profesní etika, str. 8)`
},
  {
    id: 'pe_11',
    subject: 'Profesní etika',
    topic: 'Právní vědomí',
    question: 'Co je to právní vědomí?',
    answer: 'Právní vědomí je souhrn znalostí o platném právu (znalost norem) spojený s vnitřním postojem k právu, mírou jeho uznávání, respektování a reálného dodržování v každodenní praxi.',
    options: [
              `Právní vědomí je soubor represivních opatření státu směřujících k potlačení disociálního chování rizikových skupin obyvatelstva.`,
              `Právní vědomí je formální osvědčení o složení závěrečné zkoušky v základní odborné přípravě na Akademii Vězeňské služby ČR.`,
              `Právní vědomí je souhrn znalostí o platném právu (znalost norem) spojený s vnitřním postojem k právu, mírou jeho uznávání, respektování a reálného dodržování v každodenní praxi.`,
              `Právní vědomí je schopnost obhájce vyhledávat procesní chyby v trestním řízení a účelově mařit výkon spravedlnosti.`
            ],
    correctOption: 2,
    rationale: 'Právní filosofie dokládá, že právní vědomí tvoří nejen pasivní znalost práva, ale především úroveň jeho dobrovolného dodržování a realizace občany i funkcionáři.',
    source: 'Studijní opora pro ZOP A – předmět Profesní etika, str. 2',
      explanation: `Právní filosofie dokládá, že právní vědomí tvoří nejen pasivní znalost práva, ale především úroveň jeho dobrovolného dodržování a realizace občany i funkcionáři. (Právní úprava: Studijní opora pro ZOP A – předmět Profesní etika, str. 2)`
},
  {
    id: 'pe_12',
    subject: 'Profesní etika',
    topic: 'Právní vědomí a socializace',
    question: 'Jaký význam pro míru socializace má péče o rozvoj právního vědomí?',
    answer: 'Rozvoj právního vědomí je klíčovým pilířem úspěšné socializace a resocializace; vede jedince k dobrovolnému respektování práv druhých, k prevenci kriminality a k ochraně demokratického řádu.',
    options: [
              `Nemá pro socializaci podstatný vliv, neboť adaptace jedince na společnost je determinována výhradně biologickými vlohami a socioekonomickým statusem rodiny.`,
              `Rozvoj právního vědomí je klíčovým pilířem úspěšné socializace a resocializace; vede jedince k dobrovolnému respektování práv druhých, k prevenci kriminality a k ochraně demokratického řádu.`,
              `Péče o právní vědomí vede k nadměrné kverulaci vězněných osob a znesnadňuje uplatňování kázeňské pravomoci služebních funkcionářů.`,
              `Význam má výhradně pro příslušníky justičních orgánů, zatímco u pachatelů trestné činnosti rozvoj právního vědomí zvyšuje riziko sofistikovanější kriminality.`
            ],
    correctOption: 1,
    rationale: 'Nízká úroveň právního vědomí vede k maladaptaci a páchání trestné činnosti. Výchova k právnímu vědomí je základem penitenciárního působení na odsouzené.',
    source: 'Studijní opora pro ZOP A – předmět Profesní etika, str. 2–4',
      explanation: `Nízká úroveň právního vědomí vede k maladaptaci a páchání trestné činnosti. Výchova k právnímu vědomí je základem penitenciárního působení na odsouzené. (Právní úprava: Studijní opora pro ZOP A – předmět Profesní etika, str. 2–4)`
},
  {
    id: 'pe_13',
    subject: 'Profesní etika',
    topic: 'Požadavky na nositele státní moci',
    question: 'Jaké nároky na právní vědomí jsou kladeny na osoby, na které jsou delegovány kompetence výkonu státní moci (zákonodárné, soudní a výkonné)?',
    answer: 'Mimořádně vysoké nároky – musí nejen bezchybně znát a aplikovat zákony, ale jít příkladem v bezúhonnosti, nestrannosti, odmítání korupce a ochraně lidské důstojnosti.',
    options: [
              `Nároky zaměřené výhradně na ekonomickou efektivitu a rychlost rozhodování bez ohledu na dodržování procesních práv dotčených osob.`,
              `Mimořádně vysoké nároky – musí nejen bezchybně znát a aplikovat zákony, ale jít příkladem v bezúhonnosti, nestrannosti, odmítání korupce a ochraně lidské důstojnosti.`,
              `Standardní nároky odpovídající běžnému občanovi, přičemž případná pochybení jsou kryta služební imunitou a zásadou presumpce správnosti úředních aktů.`,
              `Pouze formální nároky na znalost základních organizačních předpisů daného rezortu bez požadavku na osobní etickou integritu a morální profil.`
            ],
    correctOption: 1,
    rationale: 'Příslušníci VS ČR jsou představiteli výkonné moci státu, proto jejich selhání diskredituje důvěru veřejnosti v právní stát.',
    source: 'Studijní opora pro ZOP A – předmět Profesní etika, str. 2, 7',
      explanation: `Příslušníci VS ČR jsou představiteli výkonné moci státu, proto jejich selhání diskredituje důvěru veřejnosti v právní stát. (Právní úprava: Studijní opora pro ZOP A – předmět Profesní etika, str. 2, 7)`
},
  {
    id: 'pe_14',
    subject: 'Profesní etika',
    topic: 'Prameny ochrany LP',
    question: 'O které ústavní a další zákony ČR a mezinárodní doporučení se opírá ochrana lidských práv vězněných osob?',
    answer: 'Ústava ČR, Listina základních práv a svobod (č. 2/1993 Sb.), zákony č. 555/1992 Sb., 169/1999 Sb., 293/1993 Sb., 129/2008 Sb., Evropská vězeňská pravidla (Rec(2006)2-rev) a Mandelova pravidla OSN.',
    options: [
              `Ústava ČR, Listina základních práv a svobod (č. 2/1993 Sb.), zákony č. 555/1992 Sb., 169/1999 Sb., 293/1993 Sb., 129/2008 Sb., Evropská vězeňská pravidla (Rec(2006)2-rev) a Mandelova pravidla OSN.`,
              `Ženevské úmluvy o ochraně obětí mezinárodních ozbrojených konfliktů a Haagské úmluvy o válečném právu z roku 1907.`,
              `Výhradně mezinárodní obchodní dohody Světové obchodní organizace (WTO) a směrnice Evropské unie o volném pohybu služeb a kapitálu.`,
              `Pouze zákon o státní službě č. 234/2014 Sb. a interní pokyny ředitele konkrétní věznice bez vazby na ústavní pořádek ČR.`
            ],
    correctOption: 0,
    rationale: 'Ochrana lidských práv vězněných osob tvoří provázaný systém od mezinárodních úmluv přes ústavní pořádek ČR až po speciální vězeňské zákony.',
    source: 'Studijní opora pro ZOP A – předmět Profesní etika, str. 2–4',
      explanation: `Ochrana lidských práv vězněných osob tvoří provázaný systém od mezinárodních úmluv přes ústavní pořádek ČR až po speciální vězeňské zákony. (Právní úprava: Studijní opora pro ZOP A – předmět Profesní etika, str. 2–4)`
},
  {
    id: 'pe_15',
    subject: 'Profesní etika',
    topic: 'Podstata korupce',
    question: 'Co je to korupce a jaké jsou její formy?',
    answer: 'Zneužití pravomoci a postavení k získání neoprávněného prospěchu pro sebe nebo jiného. Zahrnuje úplatkářství (přijetí úplatku, podplácení, nepřímé úplatkářství), klientelismus (vzájemné výhody) i nepotismus (protežování příbuzných).',
    options: [
              `Každé legální poskytnutí finančního sponzorského daru Vězeňské službě ČR řádně zaevidované v účetní evidenci organizační jednotky.`,
              `Výhradně přímé předání peněžní hotovosti v částce převyšující 500 000 Kč úřední osobě bez přítomnosti dalších svědků.`,
              `Zneužití pravomoci a postavení k získání neoprávněného prospěchu pro sebe nebo jiného. Zahrnuje úplatkářství (přijetí úplatku, podplácení, nepřímé úplatkářství), klientelismus (vzájemné výhody) i nepotismus (protežování příbuzných).`,
              `Standardní vyjednávání odborových organizací o navýšení platových tarifů a benefitů pro příslušníky bezpečnostních sborů.`
            ],
    correctOption: 2,
    rationale: 'Korupci nelze zužovat jen na finanční úplatky; zahrnuje veškeré formy neoprávněného zvýhodňování na úkor rovnosti, veřejného zájmu a zákona.',
    source: 'NGŘ č. 28/2018 Sb. Příloha 1; Studijní opora str. 12',
      explanation: `Korupci nelze zužovat jen na finanční úplatky; zahrnuje veškeré formy neoprávněného zvýhodňování na úkor rovnosti, veřejného zájmu a zákona. (Právní úprava: NGŘ č. 28/2018 Sb. Příloha 1; Studijní opora str. 12)`
},
  {
    id: 'pe_16',
    subject: 'Profesní etika',
    topic: 'Katalog korupčních rizik',
    question: 'Co obsahuje Katalog korupčních rizik, který je přílohou NGŘ č. 28/2018 Sb.?',
    answer: 'Strukturovaný přehled činností ve VS ČR, popisy konkrétních korupčních rizik, jejich pravděpodobnost (1–5), dopad (1–5), celkovou míru rizika (1–25) a stanovená preventivní/kontrolní protikorupční opatření.',
    options: [
              `Trestní sazby za zneužití pravomoci úřední osoby a sazebník odměn pro informátory z řad vězněných osob poskytujících operativní poznatky.`,
              `Seznam pravomocně odsouzených bývalých příslušníků bezpečnostních sborů a výši uložených trestů odnětí svobody za trestné činy úplatkářství.`,
              `Strukturovaný přehled činností ve VS ČR, popisy konkrétních korupčních rizik, jejich pravděpodobnost (1–5), dopad (1–5), celkovou míru rizika (1–25) a stanovená preventivní/kontrolní protikorupční opatření.`,
              `Metodický návod pro vedení vyšetřovacích spisů Generální inspekcí bezpečnostních sborů (GIBS) při prověřování korupčních kauz.`
            ],
    correctOption: 2,
    rationale: 'Katalog korupčních rizik je klíčovým nástrojem Interního protikorupčního programu pro identifikaci a eliminaci rizik na všech úrovních řízení VS ČR.',
    source: 'NGŘ č. 28/2018 Sb., Přílohy 2–5',
      explanation: `Katalog korupčních rizik je klíčovým nástrojem Interního protikorupčního programu pro identifikaci a eliminaci rizik na všech úrovních řízení VS ČR. (Právní úprava: NGŘ č. 28/2018 Sb., Přílohy 2–5)`
},
  {
    id: 'pe_17',
    subject: 'Profesní etika',
    topic: 'Katalog korupčních rizik – obsah',
    question: 'Je v Katalogu korupčních rizik uvedeno jednání, při kterém vzniká korupční riziko, nebo trestní sazby za korupci?',
    answer: 'V Katalogu jsou uvedeny konkrétní činnosti, riziková jednání a míra rizika s preventivními opatřeními (trestní sazby stanovuje Trestní zákoník, v katalogu nejsou).',
    options: [
              `Katalog obsahuje výhradně jmenný seznam vedoucích funkcionářů podléhajících povinnému bezpečnostnímu prověření NBÚ na stupeň Tajné.`,
              `V Katalogu jsou uvedeny konkrétní činnosti, riziková jednání a míra rizika s preventivními opatřeními (trestní sazby stanovuje Trestní zákoník, v katalogu nejsou).`,
              `Katalog uvádí výhradně statistické přehledy zachycených nepovolených předmětů a drog ve věznicích za uplynulé pětileté období.`,
              `V Katalogu jsou uvedeny výhradně trestní sazby a peněžité tresty podle trestního zákoníku, zatímco preventivní opatření jsou obsažena v trestním řádu.`
            ],
    correctOption: 1,
    rationale: 'Katalog slouží jako interní manažerský a kontrolní nástroj k prevenci, nikoli jako trestní kodex.',
    source: 'NGŘ č. 28/2018 Sb., § 1 a Přílohy 2–5; Studijní opora str. 12',
      explanation: `Katalog slouží jako interní manažerský a kontrolní nástroj k prevenci, nikoli jako trestní kodex. (Právní úprava: NGŘ č. 28/2018 Sb., § 1 a Přílohy 2–5; Studijní opora str. 12)`
},
  {
    id: 'pe_18',
    subject: 'Profesní etika',
    topic: 'Etické rozhodování',
    question: 'Co vede ke správnému etickému rozhodnutí?',
    answer: 'Kritická sebereflexe, znalost a úcta k etickým zásadám a právním normám, orientace na nejvyšší etický cíl (dobro), potlačení sobeckých zájmů a vnímání společenské prospěšnosti a lidské důstojnosti.',
    options: [
              `Nekritické podřízení se neformálnímu nátlaku kolektivu a loajalita ke kolegům i za cenu porušení služebních a právních předpisů.`,
              `Kritická sebereflexe, znalost a úcta k etickým zásadám a právním normám, orientace na nejvyšší etický cíl (dobro), potlačení sobeckých zájmů a vnímání společenské prospěšnosti a lidské důstojnosti.`,
              `Mechanické upřednostnění okamžitého osobního prospěchu a pragmatické minimalizování rizika odhalení nestandardního postupu kontrolními orgány.`,
              `Rychlé intuitivní rozhodnutí motivované snahou vyhnout se administrativní zátěži spojené s řádným zadokumentováním incidentu.`
            ],
    correctOption: 1,
    rationale: 'Správné etické rozhodnutí vyžaduje harmonii mezi svědomím (mravnost), společenskou odpovědností (morálka) a zákonností (právo).',
    source: 'Studijní opora pro ZOP A – předmět Profesní etika, str. 1, 7',
      explanation: `Správné etické rozhodnutí vyžaduje harmonii mezi svědomím (mravnost), společenskou odpovědností (morálka) a zákonností (právo). (Právní úprava: Studijní opora pro ZOP A – předmět Profesní etika, str. 1, 7)`
},
  {
    id: 'pe_19',
    subject: 'Profesní etika',
    topic: 'Vznik práva z etiky',
    question: 'Proč se z Etiky na základě vzájemných dohod členů společnosti rodí normativní systém Právo?',
    answer: 'Protože samotná mravnost (svědomí) a morálka (nepsané zvyky) nemají dostatečnou donucovací moc zabránit škůdcům v páchání nebezpečných činů; právo proto kodifikuje závazná pravidla a dává státu legitimní donucovací moc.',
    options: [
              `Protože samotná mravnost (svědomí) a morálka (nepsané zvyky) nemají dostatečnou donucovací moc zabránit škůdcům v páchání nebezpečných činů; právo proto kodifikuje závazná pravidla a dává státu legitimní donucovací moc.`,
              `Z důvodu potřeby generovat finanční příjmy do státního rozpočtu prostřednictvím soudních poplatků a ukládaných majetkových sankcí.`,
              `Aby bylo možné vyloučit jakékoli etické hodnocení činů a nahradit jej čistě mechanickou aplikací tabulkových procesů státní správy.`,
              `Protože morální normy a mravní principy zcela pozbyly v moderní společnosti platnost a byly plně nahrazeny tržními mechanismy.`
            ],
    correctOption: 0,
    rationale: 'Právo vzniká jako nezbytný formalizovaný nástroj ochrany společnosti, když selhávají neformální morální korektivy.',
    source: 'Studijní opora pro ZOP A – předmět Profesní etika, str. 2',
      explanation: `Právo vzniká jako nezbytný formalizovaný nástroj ochrany společnosti, když selhávají neformální morální korektivy. (Právní úprava: Studijní opora pro ZOP A – předmět Profesní etika, str. 2)`
},
  {
    id: 'pe_20',
    subject: 'Profesní etika',
    topic: 'Axiologie',
    question: 'Čím se zabývá etická disciplína Axiologie?',
    answer: 'Axiologie (z řec. axia = hodnota) je věda o hodnotách; zkoumá procesy vzniku hodnot, jejich povahu, třídění (materiální vs. nemateriální) a vytváření hodnotových žebříčků u člověka.',
    options: [
              `Axiologie je odvětví penologie zkoumající architektonické standardy a stavebně-technické zabezpečení vězeňských objektů.`,
              `Axiologie (z řec. axia = hodnota) je věda o hodnotách; zkoumá procesy vzniku hodnot, jejich povahu, třídění (materiální vs. nemateriální) a vytváření hodnotových žebříčků u člověka.`,
              `Axiologie je filozofická disciplína studující výhradně logickou stavbu právních norem a metody jejich jazykového výkladu.`,
              `Axiologie je nauka o služebních povinnostech a odpovědnosti příslušníků bezpečnostních sborů při zákrocích pod jednotným velením.`
            ],
    correctOption: 1,
    rationale: 'Axiologie objasňuje, jak si člověk vytváří vztah k idejím, lidem a věcem a proč staví určité hodnoty nad jiné.',
    source: 'Studijní opora pro ZOP A – předmět Profesní etika, str. 3',
      explanation: `Axiologie objasňuje, jak si člověk vytváří vztah k idejím, lidem a věcem a proč staví určité hodnoty nad jiné. (Právní úprava: Studijní opora pro ZOP A – předmět Profesní etika, str. 3)`
},
  {
    id: 'pe_21',
    subject: 'Profesní etika',
    topic: 'Hodnotový žebříček',
    question: 'Co je to hodnotový žebříček a která disciplína zkoumá jeho vznik a projevy?',
    answer: 'Hodnotový žebříček je individuální hierarchické uspořádání hodnot podle jejich důležitosti pro daného jedince; vznikem a tříděním hodnot se zabývá axiologie, jejich individuálními projevy individuální etika.',
    options: [
              `Hodnotový žebříček je tabulka tarifních platových tříd a stupňů ve veřejné správě zkoumaná mzdovou a pracovní legislativou.`,
              `Hodnotový žebříček představuje klasifikaci věznic podle stupně zabezpečení, jejíž tvorbou se zabývá penitenciární administrativa.`,
              `Hodnotový žebříček je systém služebního hodnocení příslušníků dle zákona č. 361/2003 Sb., kterým se zabývá personální odbor generálního ředitelství.`,
              `Hodnotový žebříček je individuální hierarchické uspořádání hodnot podle jejich důležitosti pro daného jedince; vznikem a tříděním hodnot se zabývá axiologie, jejich individuálními projevy individuální etika.`
            ],
    correctOption: 3,
    rationale: 'U zralé osobnosti stojí na vrcholu žebříčku hodnoty nemateriální (život, spravedlnost, čest), od kterých se odvíjí vztah k materiálním statkům.',
    source: 'Studijní opora pro ZOP A – předmět Profesní etika, str. 3',
      explanation: `U zralé osobnosti stojí na vrcholu žebříčku hodnoty nemateriální (život, spravedlnost, čest), od kterých se odvíjí vztah k materiálním statkům. (Právní úprava: Studijní opora pro ZOP A – předmět Profesní etika, str. 3)`
},
  {
    id: 'pe_22',
    subject: 'Profesní etika',
    topic: 'Deformace hodnot pachatelů',
    question: 'Jaké jsou příčiny deformace hodnotového systému u pachatelů trestné činnosti?',
    answer: 'Jde o multifaktoriální jev z hlediska bio-psycho-sociálně-spirituálního modelu: vliv nevhodného prostředí a subkultury, výchovná zanedbanost, dominance okamžitého materiálního zisku, závislosti, nízké právní vědomí a chybějící respekt k právům druhých.',
    options: [
              `Výhradně genetická determinace s přítomností chromozomální anomálie XYY, kterou nelze výchovným působením ani resocializací nijak ovlivnit.`,
              `Jde o multifaktoriální jev z hlediska bio-psycho-sociálně-spirituálního modelu: vliv nevhodného prostředí a subkultury, výchovná zanedbanost, dominance okamžitého materiálního zisku, závislosti, nízké právní vědomí a chybějící respekt k právům druhých.`,
              `Jedinou příčinou je nadměrná přísnost trestních sazeb v platném trestním zákoníku vedoucí k sekundární stigmatizaci pachatele.`,
              `Deformace hodnotového systému delikventů je mýtus; hodnotová orientace pachatelů je plně identická se standardní většinovou populací.`
            ],
    correctOption: 1,
    rationale: 'Hodnotový žebříček delikventa je typický preferencí materiálního prospěchu a ignorováním vyšších nemateriálních hodnot a práv ostatních lidí.',
    source: 'Studijní opora pro ZOP A – předmět Profesní etika, str. 3–4',
      explanation: `Hodnotový žebříček delikventa je typický preferencí materiálního prospěchu a ignorováním vyšších nemateriálních hodnot a práv ostatních lidí. (Právní úprava: Studijní opora pro ZOP A – předmět Profesní etika, str. 3–4)`
},
  {
    id: 'pe_23',
    subject: 'Profesní etika',
    topic: 'Deontologie',
    question: 'Jak se nazývá etická nauka o povinnostech?',
    answer: 'Deontologie (z řeckého deon = povinnost, to co je nezbytné/správné).',
    options: [
              `Deontologie (z řeckého deon = povinnost, to co je nezbytné/správné).`,
              `Ontologie (z řeckého on = jsoucno, zkoumající podstatu bytí a světa).`,
              `Utilitarismus (z latinského utilis = užitečný, zkoumající prospěch většiny).`,
              `Hedonismus (z řeckého hédoné = slast, zkoumající dosažení příjemných prožitků).`
            ],
    correctOption: 0,
    rationale: 'Profesní deontologie stanovuje soubor povinností, standardů a etických závazků příslušníka při výkonu bezpečnostní služby.',
    source: 'Studijní opora pro ZOP A – předmět Profesní etika, str. 3, 8',
      explanation: `Profesní deontologie stanovuje soubor povinností, standardů a etických závazků příslušníka při výkonu bezpečnostní služby. (Právní úprava: Studijní opora pro ZOP A – předmět Profesní etika, str. 3, 8)`
},
  {
    id: 'pe_24',
    subject: 'Profesní etika',
    topic: 'Tvorba norem',
    question: 'Jakým způsobem jsou ve společnosti tvořeny normy?',
    answer: 'Vývojem od mravních intuicí a zvyklostí přes společenskou morální dohodu až po formální legislativní proces, kterým stát kodifikuje nejdůležitější pravidla do zákonů.',
    options: [
              `Okamžitým ústním konsensem vězněných osob na ubytovnách při řešení vnitřních sporů ve vězeňské subkultuře.`,
              `Vývojem od mravních intuicí a zvyklostí přes společenskou morální dohodu až po formální legislativní proces, kterým stát kodifikuje nejdůležitější pravidla do zákonů.`,
              `Výhradně direktivním rozhodnutím mezinárodních bankovních institucí bez ohledu na historické a kulturní tradice daného státu.`,
              `Automatickým generováním prediktivních algoritmů umělé inteligence na základě ekonomických ukazatelů trhu.`
            ],
    correctOption: 1,
    rationale: 'Normotvorba prochází procesem zrání normy od etické ideje dobra přes morální konsensus až ke kodifikaci do platného práva.',
    source: 'Studijní opora pro ZOP A – předmět Profesní etika, str. 1–2, 7–8',
      explanation: `Normotvorba prochází procesem zrání normy od etické ideje dobra přes morální konsensus až ke kodifikaci do platného práva. (Právní úprava: Studijní opora pro ZOP A – předmět Profesní etika, str. 1–2, 7–8)`
},
  {
    id: 'pe_25',
    subject: 'Profesní etika',
    topic: 'Mezinárodní konvence vězeňství',
    question: 'O které mezinárodní konvence se opírá model zacházení s vězni v ČR?',
    answer: 'Evropská vězeňská pravidla (Doporučení Rec(2006)2-rev Rady Evropy ve znění revize 2020) a Standardní minimální pravidla OSN pro zacházení s vězni (Mandelova pravidla z roku 2015, původně 1955/1957).',
    options: [
              `Evropská vězeňská pravidla (Doporučení Rec(2006)2-rev Rady Evropy ve znění revize 2020) a Standardní minimální pravidla OSN pro zacházení s vězni (Mandelova pravidla z roku 2015, původně 1955/1957).`,
              `Model zacházení v ČR vychází výhradně z interních instrukcí Ministerstva spravedlnosti bez návaznosti na mezinárodní standardy.`,
              `Smlouva o fungování Evropské unie (Lisabonská smlouva) a Schengenská prováděcí úmluva o ochraně vnějších hranic.`,
              `Severoatlantická smlouva (Washingtonská úmluva) a předpisy mezinárodní organizace civilního letectví ICAO.`
            ],
    correctOption: 0,
    rationale: 'Tato dvě stěžejní mezinárodní doporučení definují evropské a světové standardy humánního zacházení s vězněnými osobami.',
    source: 'Studijní opora pro ZOP A – předmět Profesní etika, str. 4',
      explanation: `Tato dvě stěžejní mezinárodní doporučení definují evropské a světové standardy humánního zacházení s vězněnými osobami. (Právní úprava: Studijní opora pro ZOP A – předmět Profesní etika, str. 4)`
},
  {
    id: 'pe_26',
    subject: 'Profesní etika',
    topic: 'Vztah k etickému cíli',
    question: 'K čemu nám slouží etický cíl a jaký vztah bychom k němu měli zaujmout?',
    answer: 'Slouží jako hodnotový kompas v rozhodování; měli bychom k němu zaujmout aktivní, dobrovolný vztah a vědomě pěstovat schopnost směřovat své myšlení i činy k dobru i za cenu osobního úsilí.',
    options: [
              `Slouží výhradně jako formální deklarace v etickém kodexu, ke které je žádoucí přistupovat pragmaticky a uplatňovat ji jen při přímé kontrole nadřízenými.`,
              `Etický cíl představuje rigidní dogma, které zbavuje příslušníka nutnosti samostatně vyhodnocovat bezpečnostní rizika na stanovišti.`,
              `Slouží jako hodnotový kompas v rozhodování; měli bychom k němu zaujmout aktivní, dobrovolný vztah a vědomě pěstovat schopnost směřovat své myšlení i činy k dobru i za cenu osobního úsilí.`,
              `Slouží k ospravedlnění jakýchkoli nezákonných metod služebního zákroku, pokud vedou k rychlému zpacifikování agresora.`
            ],
    correctOption: 2,
    rationale: 'Kultivace etického myšlení posiluje morální integritu příslušníka při zvládání náročných a konfliktních služebních situací.',
    source: 'Studijní opora pro ZOP A – předmět Profesní etika, str. 7',
      explanation: `Kultivace etického myšlení posiluje morální integritu příslušníka při zvládání náročných a konfliktních služebních situací. (Právní úprava: Studijní opora pro ZOP A – předmět Profesní etika, str. 7)`
},
  {
    id: 'pe_27',
    subject: 'Profesní etika',
    topic: 'Právo vs. Etika',
    question: 'Jak se liší právo od etiky?',
    answer: 'Etika zkoumá vnitřní mravní motivy, svědomí a dobrovolné směřování k dobru, zatímco právo upravuje vnější chování lidí, stanovuje přesné minimum závazných povinností a vynucuje je státní mocí a formálními sankcemi.',
    options: [
              `Etika je souborem státem vynutitelných pravidel obsažených ve Sbírce zákonů, zatímco právo představuje výhradně nezávazná filozofická doporučení.`,
              `Právo reguluje výhradně vztahy mezi rodinnými příslušníky, zatímco etika stanovuje pravidla pro výkon služby v ozbrojených sborech.`,
              `Mezi právem a etikou není žádný věcný ani formální rozdíl; obě disciplíny využívají totožné nástroje trestního postihu.`,
              `Etika zkoumá vnitřní mravní motivy, svědomí a dobrovolné směřování k dobru, zatímco právo upravuje vnější chování lidí, stanovuje přesné minimum závazných povinností a vynucuje je státní mocí a formálními sankcemi.`
            ],
    correctOption: 3,
    rationale: 'Právo představuje etické minimum kodifikované státem do přesně definovaných a vynutitelných právních norem.',
    source: 'Studijní opora pro ZOP A – předmět Profesní etika, str. 1–2',
      explanation: `Právo představuje etické minimum kodifikované státem do přesně definovaných a vynutitelných právních norem. (Právní úprava: Studijní opora pro ZOP A – předmět Profesní etika, str. 1–2)`
},
  {
    id: 'pe_28',
    subject: 'Profesní etika',
    topic: 'Hierarchie hodnot',
    question: 'Která etická disciplína rozlišuje vyšší a nižší hodnoty, či hierarchii hodnot podle jejich vztahu k nejvyššímu etickému cíli?',
    answer: 'Axiologie.',
    options: [
              `Axiologie.`,
              `Deskriptivní etika.`,
              `Profesní deontologie.`,
              `Normativní kriminologie.`
            ],
    correctOption: 0,
    rationale: 'Axiologie třídí hodnoty a hodnotí jejich postavení v hierarchii lidských motivů a cílů.',
    source: 'Studijní opora pro ZOP A – předmět Profesní etika, str. 3',
      explanation: `Axiologie třídí hodnoty a hodnotí jejich postavení v hierarchii lidských motivů a cílů. (Právní úprava: Studijní opora pro ZOP A – předmět Profesní etika, str. 3)`
},
  {
    id: 'pe_29',
    subject: 'Profesní etika',
    topic: 'Obsah deontologie',
    question: 'Čím se zabývá etická disciplína deontologie?',
    answer: 'Zabývá se vytvářením žebříčku a pořadí plnění povinností odvozených z hierarchie hodnot, stanovuje profesní etické normy a profesní odpovědnost pracovníků.',
    options: [
              `Zabývá se výpočtem ekonomických nákladů na stravování a ubytování vězněných osob v jednotlivých typech věznic.`,
              `Zkoumá biologickou dědičnost psychopatických rysů u odsouzených pachatelů násilné trestné činnosti.`,
              `Popisuje historický vývoj střelných zbraní a donucovacích prostředků používaných vězeňskou stráží od 19. století.`,
              `Zabývá se vytvářením žebříčku a pořadí plnění povinností odvozených z hierarchie hodnot, stanovuje profesní etické normy a profesní odpovědnost pracovníků.`
            ],
    correctOption: 3,
    rationale: 'Deontologie převádí etické hodnoty do konkrétních povinností a standardů chování v dané profesi.',
    source: 'Studijní opora pro ZOP A – předmět Profesní etika, str. 3, 8',
      explanation: `Deontologie převádí etické hodnoty do konkrétních povinností a standardů chování v dané profesi. (Právní úprava: Studijní opora pro ZOP A – předmět Profesní etika, str. 3, 8)`
},
  {
    id: 'pe_30',
    subject: 'Profesní etika',
    topic: 'Normativní etika',
    question: 'O jaké vztahy se opírá normativní etika?',
    answer: 'Opírá se o vztahy mezi tím, „co je“ a tím, „co má být“ (preskripce); formuluje morální pravidla, principy spravedlnosti, povinnosti a ideály žádoucího jednání jednotlivce i společnosti.',
    options: [
              `Zkoumá výhradně finanční toky a ekonomickou bilanci hospodaření příspěvkových organizací ve vězeňství.`,
              `Opírá se o biomechanické zákonitosti lidského pohybu při použití chvatů a hmatů sebeobrany.`,
              `Opírá se o vztahy mezi tím, „co je“ a tím, „co má být“ (preskripce); formuluje morální pravidla, principy spravedlnosti, povinnosti a ideály žádoucího jednání jednotlivce i společnosti.`,
              `Opírá se výhradně o empirický popis existujících kriminálních zvyklostí ve vězeňské subkultuře bez jejich morálního hodnocení.`
            ],
    correctOption: 2,
    rationale: 'Normativní etika stanovuje etické standardy a kritéria pro hodnocení činů jako dobrých či zlých, spravedlivých či nespravedlivých.',
    source: 'Studijní opora pro ZOP A – předmět Profesní etika, str. 1–3',
      explanation: `Normativní etika stanovuje etické standardy a kritéria pro hodnocení činů jako dobrých či zlých, spravedlivých či nespravedlivých. (Právní úprava: Studijní opora pro ZOP A – předmět Profesní etika, str. 1–3)`
},
  {
    id: 'pe_31',
    subject: 'Profesní etika',
    topic: 'Genderové stereotypy ve VS ČR',
    question: 'Jaký vztah máme zaujmout vůči genderovým stereotypům a předsudkům v podmínkách VS ČR?',
    answer: 'Zaujmout profesionální, nediskriminační a věcný přístup; aktivně odmítat genderové předsudky, respektovat rovnost mužů a žen a důsledně dodržovat zákonná a etická pravidla (např. při osobních prohlídkách osob stejného pohlaví).',
    options: [
              `Zaujmout profesionální, nediskriminační a věcný přístup; aktivně odmítat genderové předsudky, respektovat rovnost mužů a žen a důsledně dodržovat zákonná a etická pravidla (např. při osobních prohlídkách osob stejného pohlaví).`,
              `Povolit provádění důkladných osobních prohlídek vězněných žen příslušníky mužského pohlaví pro urychlení ranních prověrek početního stavu.`,
              `Uplatňovat tradiční patriarchální přístup a omezovat kariérní postup příslušnic na velitelských pozicích z důvodu fyzické náročnosti služby.`,
              `Považovat genderovou rovnost za ryze administrativní formalitu, kterou není nutné při výkonu přímé strážní a dozorčí služby respektovat.`
            ],
    correctOption: 0,
    rationale: 'Etický kodex (Čl. 4) a EVP (bod 85) vyžadují vyloučení jakékoliv diskriminace na základě pohlaví a rovnoměrné profesní zastoupení mužů i žen.',
    source: 'Studijní opora str. 9; EVP bod 85; NGŘ 28/2018 Příloha 6 Čl. 4',
      explanation: `Etický kodex (Čl. 4) a EVP (bod 85) vyžadují vyloučení jakékoliv diskriminace na základě pohlaví a rovnoměrné profesní zastoupení mužů i žen. (Právní úprava: Studijní opora str. 9; EVP bod 85; NGŘ 28/2018 Příloha 6 Čl. 4)`
},
  {
    id: 'pe_32',
    subject: 'Profesní etika',
    topic: 'Úroveň právního vědomí',
    question: 'Jak se vyvíjí a jak v praxi působí úroveň právního vědomí členů společnosti?',
    answer: 'Vyvíjí se celoživotní edukací, fungováním právního státu a vymahatelností práva; vysoká úroveň posiluje dobrovolné dodržování zákonů a důvěru ve spravedlnost, nízká úroveň vede k anomii, obcházení norem a nárůstu kriminality.',
    options: [
              `Vyvíjí se celoživotní edukací, fungováním právního státu a vymahatelností práva; vysoká úroveň posiluje dobrovolné dodržování zákonů a důvěru ve spravedlnost, nízká úroveň vede k anomii, obcházení norem a nárůstu kriminality.`,
              `Závisí výhradně na počtu policistů a dozorců v ulicích a věznicích; úroveň vzdělání a fungování institucí na ni nemá žádný vliv.`,
              `Vyvíjí se výhradně mechanickým opisováním paragrafů zákonů při absolvování kurzu základní odborné přípravy.`,
              `Je to vrozený reflex podmíněný genetickou výbavou jedince, který zůstává po celý život zcela konstantní a nelze jej výchovou změnit.`
            ],
    correctOption: 0,
    rationale: 'Právní vědomí odráží ztotožnění občanů s hodnotami právního řádu a přímo determinuje stabilitu a bezpečnost společnosti.',
    source: 'Studijní opora pro ZOP A – předmět Profesní etika, str. 2',
      explanation: `Právní vědomí odráží ztotožnění občanů s hodnotami právního řádu a přímo determinuje stabilitu a bezpečnost společnosti. (Právní úprava: Studijní opora pro ZOP A – předmět Profesní etika, str. 2)`
},
  {
    id: 'pe_33',
    subject: 'Profesní etika',
    topic: 'Meze omezení základních práv',
    question: 'V jakých případech lze omezit rovný přístup k lidským právům a základním svobodám zaručeným ústavními zákony ČR?',
    answer: 'Pouze na základě zákona a v jeho mezích, je-li to v demokratické společnosti nezbytné pro bezpečnost státu, ochranu veřejného pořádku, zdraví, mravnosti nebo pro ochranu práv a svobod druhých (Čl. 4 odst. 2 a Čl. 14, 16, 17 LZPS).',
    options: [
              `Pouze na základě zákona a v jeho mezích, je-li to v demokratické společnosti nezbytné pro bezpečnost státu, ochranu veřejného pořádku, zdraví, mravnosti nebo pro ochranu práv a svobod druhých (Čl. 4 odst. 2 a Čl. 14, 16, 17 LZPS).`,
              `Základní lidská práva a svobody nelze omezit v žádném případě a za žádných okolností, a to ani pravomocným rozsudkem o uložení nepodmíněného trestu odnětí svobody.`,
              `Na základě neformálního ústního pokynu předsedy senátu nebo ředitele věznice i bez existence výslovného zákonného zmocnění.`,
              `Kdykoli to služební funkcionář uzná za vhodné z důvodu zjednodušení organizace denního rozvrhu na ubytovně odsouzených.`
            ],
    correctOption: 0,
    rationale: 'Dle Listiny základních práv a svobod mohou být meze základních práv stanoveny pouze zákonem a nesmí být zneužity k jiným účelům.',
    source: 'Listina základních práv a svobod (č. 2/1993 Sb.) Čl. 4; Studijní opora str. 10',
      explanation: `Dle Listiny základních práv a svobod mohou být meze základních práv stanoveny pouze zákonem a nesmí být zneužity k jiným účelům. (Právní úprava: Listina základních práv a svobod (č. 2/1993 Sb.) Čl. 4; Studijní opora str. 10)`
},
  {
    id: 'pe_34',
    subject: 'Profesní etika',
    topic: 'Sídla mezinárodních orgánů LP',
    question: 'Ve kterých evropských městech sídlí nejdůležitější mezinárodní orgány chránící lidská práva vězněných osob?',
    answer: 'Štrasburk (Rada Evropy, ESLP – Evropský soud pro lidská práva, CPT – Evropský výbor pro prevenci mučení) a Ženeva (evropská pobočka Výboru OSN proti mučení).',
    options: [
              `Štrasburk (Rada Evropy, ESLP – Evropský soud pro lidská práva, CPT – Evropský výbor pro prevenci mučení) a Ženeva (evropská pobočka Výboru OSN proti mučení).`,
              `Brusel (Evropská komise a velitelství NATO) a Frankfurt nad Mohanem (Evropská centrální banka).`,
              `Haag (Mezinárodní trestní soud pro válečné zločiny) a Vídeň (Mezinárodní agentura pro atomovou energii).`,
              `Lucemburk (Soudní dvůr EU pro hospodářské spory) a Londýn (Mezinárodní námořní organizace IMO).`
            ],
    correctOption: 0,
    rationale: 'Štrasburk a Ženeva jsou hlavními evropskými centry mezinárodní soudní a inspekční ochrany lidských práv.',
    source: 'Studijní opora pro ZOP A – předmět Profesní etika, str. 5',
      explanation: `Štrasburk a Ženeva jsou hlavními evropskými centry mezinárodní soudní a inspekční ochrany lidských práv. (Právní úprava: Studijní opora pro ZOP A – předmět Profesní etika, str. 5)`
},
  {
    id: 'pe_35',
    subject: 'Profesní etika',
    topic: 'Vládní vs. nevládní instituce LP',
    question: 'Které instituce kontrolující lidská práva vězňů se opírají o vládní dohody a které jsou nevládní organizace (NGO)?',
    answer: 'Mezivládní/státní: Výbor OSN proti mučení, CPT, ESLP, Veřejný ochránce práv, Dozorový státní zástupce; Nevládní (NGO): Český helsinský výbor a Amnesty International.',
    options: [
              `Všechny mezinárodní i vnitrostátní kontrolní orgány ve vězeňství mají statut soukromých nevládních společností financovaných z grantů.`,
              `Mezivládní/státní: Amnesty International a Nadace Charty 77; Nevládní (NGO): Evropský soud pro lidská práva a Dozorový státní zástupce.`,
              `Mezivládní/státní: Výbor OSN proti mučení, CPT, ESLP, Veřejný ochránce práv, Dozorový státní zástupce; Nevládní (NGO): Český helsinský výbor a Amnesty International.`,
              `Mezivládní/státní: Český helsinský výbor a Transparency International; Nevládní (NGO): Výbor OSN proti mučení a Veřejný ochránce práv.`
            ],
    correctOption: 2,
    rationale: 'Mezivládní instituce mají kontrolní a soudní pravomoc z mezinárodních úmluv; nevládní organizace působí nezávisle na státu jako občanský dohled.',
    source: 'Studijní opora pro ZOP A – předmět Profesní etika, str. 5–6',
      explanation: `Mezivládní instituce mají kontrolní a soudní pravomoc z mezinárodních úmluv; nevládní organizace působí nezávisle na státu jako občanský dohled. (Právní úprava: Studijní opora pro ZOP A – předmět Profesní etika, str. 5–6)`
},
  {
    id: 'pe_36',
    subject: 'Profesní etika',
    topic: 'Právní síla norem ČR',
    question: 'Které z právních norem v právním řádu České republiky mají nejvyšší právní sílu?',
    answer: 'Ústavní zákony ČR (Ústava ČR č. 1/1993 Sb. a Listina základních práv a svobod č. 2/1993 Sb.) a ratifikované vyhlášené mezinárodní smlouvy o lidských právech (Čl. 10 Ústavy).',
    options: [
              `Vyhlášky Ministerstva spravedlnosti a metodické pokyny odboru výkonu vazby a trestu.`,
              `Nařízení generálního ředitele Vězeňské služby ČR a služební pokyny náměstků pro bezpečnost a kontrolu.`,
              `Vnitřní řády věznic a vazebních věznic schválené generálním ředitelstvím pro konkrétní kalendářní rok.`,
              `Ústavní zákony ČR (Ústava ČR č. 1/1993 Sb. a Listina základních práv a svobod č. 2/1993 Sb.) a ratifikované vyhlášené mezinárodní smlouvy o lidských právech (Čl. 10 Ústavy).`
            ],
    correctOption: 3,
    rationale: 'Ústavní pořádek a mezinárodní smlouvy stojí na vrcholu právní pyramidy a všechny zákony a podzákonné předpisy s nimi musí být v souladu.',
    source: 'Ústava ČR Čl. 1, Čl. 10, Čl. 112; Studijní opora str. 6',
      explanation: `Ústavní pořádek a mezinárodní smlouvy stojí na vrcholu právní pyramidy a všechny zákony a podzákonné předpisy s nimi musí být v souladu. (Právní úprava: Ústava ČR Čl. 1, Čl. 10, Čl. 112; Studijní opora str. 6)`
},
  {
    id: 'pe_37',
    subject: 'Profesní etika',
    topic: 'Povinnost vzdělávání personálu v LP',
    question: 'Ze kterých mezinárodních konvencí a doporučení vyplývá povinnost vzdělávání vězeňského personálu v oblasti péče o lidská práva vězněných osob?',
    answer: 'Z Evropských vězeňských pravidel (Rec(2006)2-rev, bod 81.4) a ze Standardních minimálních pravidel OSN (Mandelova pravidla).',
    options: [
              `Z Evropských vězeňských pravidel (Rec(2006)2-rev, bod 81.4) a ze Standardních minimálních pravidel OSN (Mandelova pravidla).`,
              `Z Chicagské úmluvy o mezinárodním civilním letectví a dohod Mezinárodní telekomunikační unie.`,
              `Z Mezinárodní úmluvy o potlačování terorismu a směrnice EU o boji proti praní špinavých peněz.`,
              `Povinnost vzdělávání personálu v lidských právech z mezinárodních dokumentů nevyplývá, je výhradně fakultativním doporučením.`
            ],
    correctOption: 0,
    rationale: 'EVP bod 81.4 explicitně ukládá, aby výcvik personálu zahrnoval vzdělávání v normách lidských práv a zacházení bez mučení a ponižování.',
    source: 'EVP bod 81.4; Studijní opora str. 3–4',
      explanation: `EVP bod 81.4 explicitně ukládá, aby výcvik personálu zahrnoval vzdělávání v normách lidských práv a zacházení bez mučení a ponižování. (Právní úprava: EVP bod 81.4; Studijní opora str. 3–4)`
},
  {
    id: 'pe_38',
    subject: 'Profesní etika',
    topic: 'Kodex profesní etiky VS ČR',
    question: 'Jaká základní doporučení a zásady obsahuje Kodex profesní etiky zaměstnance a příslušníka VS ČR (Příloha č. 6 NGŘ č. 28/2018 Sb.)?',
    answer: 'Zákonnost a rovné zacházení, respekt k lidské důstojnosti, zákaz korupce a nepřijímání darů, mlčenlivost a ochrana osobních údajů, zdvořilé a nestranné vystupování a povinnost oznámit neetické či protiprávní jednání.',
    options: [
              `Zásadu profesní solidarity vyžadující utajení jakýchkoli excesů a nezákonných zákroků kolegů před inspekčními orgány sboru.`,
              `Zákonnost a rovné zacházení, respekt k lidské důstojnosti, zákaz korupce a nepřijímání darů, mlčenlivost a ochrana osobních údajů, zdvořilé a nestranné vystupování a povinnost oznámit neetické či protiprávní jednání.`,
              `Doporučení uplatňovat přísnější sankční režim a omezení stravy vůči problémovým a kverulujícím odsouzeným.`,
              `Pravidla pro přijímání věcných a finančních darů do hodnoty 10 000 Kč od rodinných příslušníků vězněných osob za mimořádnou vstřícnost.`
            ],
    correctOption: 1,
    rationale: 'Kodex definuje žádoucí etické standardy personálu vůči veřejnosti, vězňům i spolupracovníkům a jeho porušení je porušením služební kázně.',
    source: 'Příloha č. 6 k NGŘ č. 28/2018 Sb., Čl. 1–8',
      explanation: `Kodex definuje žádoucí etické standardy personálu vůči veřejnosti, vězňům i spolupracovníkům a jeho porušení je porušením služební kázně. (Právní úprava: Příloha č. 6 k NGŘ č. 28/2018 Sb., Čl. 1–8)`
},
  {
    id: 'pe_39',
    subject: 'Profesní etika',
    topic: 'Služební zdvořilost a komunikace',
    question: 'Jaký význam pro komunikaci s vězni, kolegy i nadřízenými má výcvik podle pravidel služební zdvořilosti a pořadové přípravy ve VS ČR?',
    answer: 'Upevňuje profesionální vystupování, autoritu sboru, vzájemný respekt, jednoznačnost velení a předchází zbytečné eskalaci konfliktů a projevům neúcty.',
    options: [
              `Slouží výhradně k nácviku slavnostních přehlídek pro veřejnost a v běžném služebním styku na oddílech ubytoven se neuplatňuje.`,
              `Umožňuje demonstrovat nadřazenost personálu prostřednictvím ponižujících a vulgárních povelů vůči odsouzeným osobám.`,
              `Nahrazuje potřebu psychologické přípravy a eliminuje nutnost individuálního hodnocení rizikovosti vězněných osob.`,
              `Upevňuje profesionální vystupování, autoritu sboru, vzájemný respekt, jednoznačnost velení a předchází zbytečné eskalaci konfliktů a projevům neúcty.`
            ],
    correctOption: 3,
    rationale: 'Služební zdvořilost (NGŘ č. 38/2018 Sb.) vytváří profesionální odstup a rámec pro důstojnou a bezpečnou komunikaci.',
    source: 'Studijní opora str. 9; NGŘ č. 38/2018 Sb.',
      explanation: `Služební zdvořilost (NGŘ č. 38/2018 Sb.) vytváří profesionální odstup a rámec pro důstojnou a bezpečnou komunikaci. (Právní úprava: Studijní opora str. 9; NGŘ č. 38/2018 Sb.)`
},
  {
    id: 'pe_40',
    subject: 'Profesní etika',
    topic: 'Etika použití zbraně a imperativ Nezabiješ',
    question: 'Jaký vztah nastává mezi nejvyšším etickým cílem, mravním příkazem „Nezabiješ!“ a § 18 zákona č. 555/1992 Sb. v případě, že příslušník VS ČR použil střelnou zbraň?',
    answer: 'Zákon v § 18 legitimně prolamuje mravní zákaz při obraně života jiných lidí či odvrácení nebezpečného útoku; příslušník jedná v souladu s etickým cílem (ochrana nevinných), avšak musí šetřit život útočníka a poskytnout mu první pomoc.',
    options: [
              `Použití zbraně v bezpečnostním sboru je ryze technický úkon zbavený jakéhokoli etického rozměru a nepodléhající mravnímu hodnocení svědomí.`,
              `Použití střelné zbraně představuje vždy absolutní etické i právní selhání příslušníka, které musí vést k jeho okamžitému propuštění ze služebního poměru.`,
              `Ustanovení § 18 zákona č. 555/1992 Sb. dává příslušníkovi právo usmrtit útočníka bez nutnosti posuzovat přiměřenost a bez povinnosti poskytnout první pomoc.`,
              `Zákon v § 18 legitimně prolamuje mravní zákaz při obraně života jiných lidí či odvrácení nebezpečného útoku; příslušník jedná v souladu s etickým cílem (ochrana nevinných), avšak musí šetřit život útočníka a poskytnout mu první pomoc.`
            ],
    correctOption: 3,
    rationale: 'Příslušník chránící společnost před agresorem naplňuje svou deontologickou povinnost. Po zákroku musí být zajištěna první pomoc a případná psychologická/duchovní podpora zakročujícímu.',
    source: 'Studijní opora pro ZOP A – předmět Profesní etika, str. 7–8; § 18 a § 20 z. 555/1992 Sb.',
      explanation: `Příslušník chránící společnost před agresorem naplňuje svou deontologickou povinnost. Po zákroku musí být zajištěna první pomoc a případná psychologická/duchovní podpora zakročujícímu. (Právní úprava: Studijní opora pro ZOP A – předmět Profesní etika, str. 7–8; § 18 a § 20 z. 555/1992 Sb.)`
},
  {
    id: 'pe_41',
    subject: 'Profesní etika',
    topic: 'Extremistické projevy',
    question: 'Jak se má zachovat příslušník VS ČR, pokud se stane svědkem extremistických projevů vězněných osob, kterým nejsou přítomny další osoby?',
    answer: 'Zachovat klid a profesionální nestrannost, neprodleně vyzvat vězněné osoby k zanechání protiprávního jednání jménem zákona, událost zadokumentovat a sepsat úřední záznam / oznámení prošetřované jako kázeňský přestupek či trestný čin.',
    options: [
              `Extremistické projevy ignorovat a nepodnikat žádné kroky, pokud nedochází k přímému fyzickému napadení nebo ničení majetku věznice.`,
              `Vstoupit s vězněnými osobami do ideologické polemiky a tolerovat jejich symboliku výměnou za udržení klidu na oddělení.`,
              `Okamžitě na místě fyzicky potrestat vězněné osoby donucovacími prostředky bez předchozí výzvy a bez sepsání služebního záznamu.`,
              `Zachovat klid a profesionální nestrannost, neprodleně vyzvat vězněné osoby k zanechání protiprávního jednání jménem zákona, událost zadokumentovat a sepsat úřední záznam / oznámení prošetřované jako kázeňský přestupek či trestný čin.`
            ],
    correctOption: 3,
    rationale: 'Příslušník nesmí tolerovat porušování zákonů ani projevy nesnášenlivosti; musí jednat rozhodně, věcně a v souladu se služebními postupy.',
    source: 'Studijní opora str. 9, 15; NGŘ č. 28/2018 Příloha 6',
      explanation: `Příslušník nesmí tolerovat porušování zákonů ani projevy nesnášenlivosti; musí jednat rozhodně, věcně a v souladu se služebními postupy. (Právní úprava: Studijní opora str. 9, 15; NGŘ č. 28/2018 Příloha 6)`
},
  {
    id: 'pe_42',
    subject: 'Profesní etika',
    topic: 'Osobní prohlídky a gender',
    question: 'Jak má být genderově a bezpečnostně zajištěn standardní průběh osobních prohlídek občanů a vězněných osob?',
    answer: 'Osobní prohlídku provádí výhradně osoba stejného pohlaví; při prohlídce občana (vstupující osoby) je nezbytná přítomnost dalšího příslušníka stejného pohlaví jako svědka (celkem 2 příslušníci stejného pohlaví). Intimní prohlídky smí provádět pouze lékař.',
    options: [
              `Při prohlídce vstupujícího občana nesmí být přítomen žádný svědek z důvodu ochrany osobních údajů a utajení bezpečnostních procedur.`,
              `Prohlídku vězněných žen provádí zásadně smíšená hlídka za přítomnosti psovoda se služebním psem bez náhubku.`,
              `Osobní prohlídku může provádět příslušník libovolného pohlaví o samotě, přičemž tělesné prohlídky tělních dutin provádí dozorce směny.`,
              `Osobní prohlídku provádí výhradně osoba stejného pohlaví; při prohlídce občana (vstupující osoby) je nezbytná přítomnost dalšího příslušníka stejného pohlaví jako svědka (celkem 2 příslušníci stejného pohlaví). Intimní prohlídky smí provádět pouze lékař.`
            ],
    correctOption: 3,
    rationale: 'Dle § 11 odst. 2 z. 555/1992 Sb., EVP bod 54.5-54.7 a metodiky ZOP musí být chráněna důstojnost a vyloučeno nařčení ze zneužití pravomoci přítomností 2 osob stejného pohlaví.',
    source: 'Studijní opora str. 9; EVP body 54.5–54.7; § 11 odst. 2 z. 555/1992 Sb.',
      explanation: `Dle § 11 odst. 2 z. 555/1992 Sb., EVP bod 54.5-54.7 a metodiky ZOP musí být chráněna důstojnost a vyloučeno nařčení ze zneužití pravomoci přítomností 2 osob stejného pohlaví. (Právní úprava: Studijní opora str. 9; EVP body 54.5–54.7; § 11 odst. 2 z. 555/1992 Sb.)`
},
  {
    id: 'pe_43',
    subject: 'Profesní etika',
    topic: 'Asertivní komunikace',
    question: 'Na jakém postupu a principech je založena asertivní komunikace příslušníků VS ČR?',
    answer: 'Na zachování klidu, sebevědomí a vědomí svých zákonných kompetencí; na slušném a pevném vyžadování povinností s respektem k důstojnosti druhé osoby, věcném zdůvodnění požadavků bez agrese a pasivity a schopnosti čelit manipulaci.',
    options: [
              `Na verbální agresi, autoritativním nátlaku a okamžitém vyhrožování kázeňskými tresty při jakémkoli dotazu vězněné osoby.`,
              `Na zachování klidu, sebevědomí a vědomí svých zákonných kompetencí; na slušném a pevném vyžadování povinností s respektem k důstojnosti druhé osoby, věcném zdůvodnění požadavků bez agrese a pasivity a schopnosti čelit manipulaci.`,
              `Na používání manipulativních technik, slibování neoprávněných výhod a vytváření neformálních spojenectví s vězeňskou hierarchií.`,
              `Na pasivním ustupování požadavkům odsouzených a vyhýbání se nepříjemným konfrontacím za účelem zachování zdánlivého klidu.`
            ],
    correctOption: 1,
    rationale: 'Asertivita je klíčový profesní nástroj – příslušník neustupuje pod tlakem manipulace či zastrašování, ale jedná korektně a v mezích zákona.',
    source: 'Studijní opora pro ZOP A – předmět Profesní etika, str. 9',
      explanation: `Asertivita je klíčový profesní nástroj – příslušník neustupuje pod tlakem manipulace či zastrašování, ale jedná korektně a v mezích zákona. (Právní úprava: Studijní opora pro ZOP A – předmět Profesní etika, str. 9)`
},
  {
    id: 'pe_44',
    subject: 'Profesní etika',
    topic: 'Zákonná ochrana na strážním stanovišti',
    question: 'Jaká práva a povinnosti musí být všemi zúčastněnými respektovány, když je příslušník velen na strážní stanoviště se zbraní?',
    answer: 'Příslušník požívá zákonné ochrany a všechny osoby (včetně nadřízených) jsou povinny řídit se jeho pokyny; pokyny nadřízených nesmí být v rozporu se zákonem a nesmí odvracet pozornost strážného ani vyžadovat vydání zbraně.',
    options: [
              `Příslušník požívá zákonné ochrany a všechny osoby (včetně nadřízených) jsou povinny řídit se jeho pokyny; pokyny nadřízených nesmí být v rozporu se zákonem a nesmí odvracet pozornost strážného ani vyžadovat vydání zbraně.`,
              `Nadřízený služební funkcionář má právo zkoušet bdělost strážného simulovaným přepadením nebo pokusem o neoprávněný vstup na stanoviště.`,
              `Příslušník na strážním stanovišti nemá žádná zvláštní oprávnění a musí se podřídit pokynům odsouzených zařazených na pracovišti.`,
              `Strážný je povinen na první vyzvání odevzdat svou služební zbraň jakémukoli kontrolnímu orgánu nebo návštěvě ve věznici.`
            ],
    correctOption: 0,
    rationale: 'Stráž na stanovišti má specifické postavení – zákon chrání výkon strážní služby před neoprávněnými zásahy odkudkoli.',
    source: 'Studijní opora pro ZOP A – předmět Profesní etika, str. 9',
      explanation: `Stráž na stanovišti má specifické postavení – zákon chrání výkon strážní služby před neoprávněnými zásahy odkudkoli. (Právní úprava: Studijní opora pro ZOP A – předmět Profesní etika, str. 9)`
},
  {
    id: 'pe_45',
    subject: 'Profesní etika',
    topic: 'Dobrovolnost duchovní péče',
    question: 'Je účast na duchovní péči pro vězněné osoby povinná?',
    answer: 'Ne, účast na duchovní péči a náboženských aktivitách je zcela dobrovolná a zajišťuje se výhradně na základě svobodného přání vězněné osoby (nikdo nesmí být k víře nucen).',
    options: [
              `Účast je povinná výhradně pro prvotrestané odsouzené mladší 21 let jako součást eticko-výchovného působení sboru.`,
              `Duchovní péče je ve věznicích ČR povolena výhradně v případě, že si odsouzený hradí veškeré náklady na kaplana ze svých úspor.`,
              `Ne, účast na duchovní péči a náboženských aktivitách je zcela dobrovolná a zajišťuje se výhradně na základě svobodného přání vězněné osoby (nikdo nesmí být k víře nucen).`,
              `Ano, účast na bohoslužbách je povinnou součástí programu zacházení pro všechny odsouzené bez výjimky dle zákona o výkonu trestu.`
            ],
    correctOption: 2,
    rationale: 'Dle Čl. 15–16 Listiny a bodu 29 EVP je zaručena svoboda vyznání; vězněná osoba nesmí být k náboženským úkonům jakkoli nucena.',
    source: 'Studijní opora str. 10; EVP bod 29.3; Listina Čl. 15, 16',
      explanation: `Dle Čl. 15–16 Listiny a bodu 29 EVP je zaručena svoboda vyznání; vězněná osoba nesmí být k náboženským úkonům jakkoli nucena. (Právní úprava: Studijní opora str. 10; EVP bod 29.3; Listina Čl. 15, 16)`
},
  {
    id: 'pe_46',
    subject: 'Profesní etika',
    topic: 'Organizace duchovní péče',
    question: 'Kdo a jakou formou poskytuje vězněným osobám duchovní péči ve věznicích VS ČR?',
    answer: 'Duchovní registrovaných církví sdružení ve spolku Vězeňská duchovenská péče (VDP, z.s.) jako dobrovolníci a kaplani Vězeňské duchovní služby (VDS) jako zaměstnanci VS ČR; formou individuálních rozhovorů, bohoslužeb, besed a zájmových aktivit.',
    options: [
              `Výhradně příslušníci oddělení výkonu vazby a trestu po absolvování víkendového teologického semináře na Akademii VS ČR.`,
              `Pouze zahraniční misionářské organizace bez registrace v ČR, které získaly jednorázové povolení od dozorového státního zástupce.`,
              `Duchovní registrovaných církví sdružení ve spolku Vězeňská duchovenská péče (VDP, z.s.) jako dobrovolníci a kaplani Vězeňské duchovní služby (VDS) jako zaměstnanci VS ČR; formou individuálních rozhovorů, bohoslužeb, besed a zájmových aktivit.`,
              `Duchovní péči vykonávají výhradně odsouzení zvolení samosprávou ubytovny formou laických přednášek na celách.`
            ],
    correctOption: 2,
    rationale: 'Duchovní péče funguje na základě dohod mezi VS ČR a ČBK + ERC (trojstranná) a NSSJ (dvoustranná dohoda).',
    source: 'Studijní opora pro ZOP A – předmět Profesní etika, str. 10',
      explanation: `Duchovní péče funguje na základě dohod mezi VS ČR a ČBK + ERC (trojstranná) a NSSJ (dvoustranná dohoda). (Právní úprava: Studijní opora pro ZOP A – předmět Profesní etika, str. 10)`
},
  {
    id: 'pe_47',
    subject: 'Profesní etika',
    topic: 'Poskytování osobních údajů vězňů',
    question: 'Komu lze sdělovat osobní údaje a informace o umístění vězněných osob?',
    answer: 'Pouze orgánům činným v trestním řízení a oprávněným státním orgánům ze zákona; jiným fyzickým či právnickým osobám (věřitelé, zaměstnavatelé, příbuzní) pouze pokud osvědčí právní zájem v souladu s § 23a z. č. 555/1992 Sb. a předpisy o ochraně osobních údajů.',
    options: [
              `Všem zástupcům hromadných sdělovacích prostředků a novinářům bez omezení na základě zákona o svobodném přístupu k informacím.`,
              `Jakékoli osobě, která o informaci požádá telefonicky nebo prostřednictvím sociálních sítí, pokud uvede jméno a datum narození vězně.`,
              `Spoluvězňům a zájmovým skupinám ve věznici pro účely zajištění transparentnosti a vnitřního pořádku na oddílu.`,
              `Pouze orgánům činným v trestním řízení a oprávněným státním orgánům ze zákona; jiným fyzickým či právnickým osobám (věřitelé, zaměstnavatelé, příbuzní) pouze pokud osvědčí právní zájem v souladu s § 23a z. č. 555/1992 Sb. a předpisy o ochraně osobních údajů.`
            ],
    correctOption: 3,
    rationale: 'Neoprávněný únik osobních údajů z VIS je závažným porušením mlčenlivosti (§ 9 a § 23a z. 555/1992 Sb., Čl. 6 Etického kodexu) a nese vysoké korupční riziko.',
    source: '§ 9, § 23a zákona č. 555/1992 Sb.; NGŘ č. 28/2018 Sb.',
      explanation: `Neoprávněný únik osobních údajů z VIS je závažným porušením mlčenlivosti (§ 9 a § 23a z. 555/1992 Sb., Čl. 6 Etického kodexu) a nese vysoké korupční riziko. (Právní úprava: § 9, § 23a zákona č. 555/1992 Sb.; NGŘ č. 28/2018 Sb.)`
},
  {
    id: 'pe_48',
    subject: 'Profesní etika',
    topic: 'Střet zájmů a podjatost',
    question: 'Jak se má zachovat příslušník nebo zaměstnanec VS ČR, jestliže se při výběrovém řízení o zakázkách nebo při zacházení s vězněnými osobami setká s osobou v příbuzenském nebo přátelském vztahu?',
    answer: 'Je povinen bez zbytečného odkladu oznámit střet zájmů a možnou podjatost svému nadřízenému a nechat se vyloučit z rozhodování, hodnocení či přímého služebního dohledu nad touto osobou.',
    options: [
              `Je povinen bez zbytečného odkladu oznámit střet zájmů a možnou podjatost svému nadřízenému a nechat se vyloučit z rozhodování, hodnocení či přímého služebního dohledu nad touto osobou.`,
              `Oznámit tuto skutečnost výhradně dotčené osobě a dohodnout se s ní na utajení jejich vztahu před ostatními kolegy ve směně.`,
              `Může v řízení pokračovat a situaci nikomu nehlásit, pokud se vnitřně cítí být zcela nestranný a objektivní.`,
              `Využít svých služebních pravomocí k přednostnímu vyřízení požadavků příbuzného či známého v zájmu udržení dobrých rodinných vztahů.`
            ],
    correctOption: 0,
    rationale: 'Zamezení nepotismu a klientelismu je základním požadavkem Etického kodexu (Čl. 5 a 7) a Protikorupčního programu VS ČR.',
    source: 'NGŘ č. 28/2018 Sb. Příloha 6 Čl. 5, 7; Studijní opora str. 12, 15',
      explanation: `Zamezení nepotismu a klientelismu je základním požadavkem Etického kodexu (Čl. 5 a 7) a Protikorupčního programu VS ČR. (Právní úprava: NGŘ č. 28/2018 Sb. Příloha 6 Čl. 5, 7; Studijní opora str. 12, 15)`
},
  {
    id: 'pe_49',
    subject: 'Profesní etika',
    topic: 'Trestní sazby za korupci',
    question: 'Jaká je nejvyšší trestní sazba odnětí svobody za korupční jednání (úplatkářství) dle Trestního zákoníku?',
    answer: 'Až 12 let odnětí svobody (např. u přijetí úplatku velkého rozsahu či v úmyslu opatřit jinému prospěch velkého rozsahu dle § 331 odst. 4 TZ), spojené s trestem propadnutí majetku či zákazem činnosti.',
    options: [
              `Maximálně 2 roky odnětí svobody s možností podmíněného odložení výkonu trestu na zkušební dobu 1 roku.`,
              `Až 20 let odnětí svobody nebo výjimečný trest doživotí bez možnosti podmíněného propuštění.`,
              `Korupční jednání úředních osob se trestá výhradně peněžitým trestem do výše 50 000 Kč a zákazem vstupu do budov soudů.`,
              `Až 12 let odnětí svobody (např. u přijetí úplatku velkého rozsahu či v úmyslu opatřit jinému prospěch velkého rozsahu dle § 331 odst. 4 TZ), spojené s trestem propadnutí majetku či zákazem činnosti.`
            ],
    correctOption: 3,
    rationale: 'Dle § 331 odst. 4 TZ činí horní hranice trestní sazby za přijetí úplatku ve zvlášť závažných případech až 12 let.',
    source: 'Zákon č. 40/2009 Sb. (trestní zákoník) § 331; Studijní opora str. 12',
      explanation: `Dle § 331 odst. 4 TZ činí horní hranice trestní sazby za přijetí úplatku ve zvlášť závažných případech až 12 let. (Právní úprava: Zákon č. 40/2009 Sb. (trestní zákoník) § 331; Studijní opora str. 12)`
},
  {
    id: 'pe_50',
    subject: 'Profesní etika',
    topic: 'Důsledky korupce pro společnost',
    question: 'Na úkor koho se obohacují pachatelé korupce?',
    answer: 'Na úkor celé společnosti, státního rozpočtu, poctivých občanů a uchazečů a na úkor důvěryhodnosti a bezpečnosti Vězeňské služby ČR jako pilíře spravedlnosti.',
    options: [
              `Výhradně na úkor mezinárodních finančních spekulantů a nadnárodních korporací bez dopadu na občany ČR.`,
              `Na úkor celé společnosti, státního rozpočtu, poctivých občanů a uchazečů a na úkor důvěryhodnosti a bezpečnosti Vězeňské služby ČR jako pilíře spravedlnosti.`,
              `Pouze na úkor neúspěšných uchazečů o zaměstnání v bezpečnostních sborech, přičemž státní rozpočet není nijak krácen.`,
              `Korupce nepředstavuje obohacení na něčí úkor, ale je legitimním tržním nástrojem optimalizace procesů státní správy.`
            ],
    correctOption: 1,
    rationale: 'Korupční jednání narušuje princip rovnosti a nestrannosti, způsobuje finanční škody státu a podkopává samotné základy právního státu.',
    source: 'NGŘ č. 28/2018 Sb. Příloha 1 Preambule; Studijní opora str. 12, 15',
      explanation: `Korupční jednání narušuje princip rovnosti a nestrannosti, způsobuje finanční škody státu a podkopává samotné základy právního státu. (Právní úprava: NGŘ č. 28/2018 Sb. Příloha 1 Preambule; Studijní opora str. 12, 15)`
}
  ,
  // 46. Zásady bezúhonnosti
  {
    id: 'pe_51',
    subject: 'Profesní etika',
    topic: 'Etický kodex',
    question: 'Jaké etické a právní důsledky má ztráta osobní bezúhonnosti pro příslušníka bezpečnostního sboru?',
    answer: 'Ztráta bezúhonnosti (např. pravomocné odsouzení pro úmyslný trestný čin) je ze zákona důvodem k okamžitému propuštění ze služebního poměru. Eticky představuje fatální selhání a ztrátu důvěry veřejnosti v nestrannost a zákonnost bezpečnostního sboru.',
    options: [
              `Nemá žádné důsledky, pokud k trestnému činu nedošlo přímo ve věznici nebo ve službě.`,
              `Příslušník je výhradně upozorněn na porušení etického kodexu bez vlivu na jeho pracovní smlouvu.`,
              `Ztráta bezúhonnosti (např. pravomocné odsouzení pro úmyslný trestný čin) je ze zákona důvodem k okamžitému propuštění ze služebního poměru. Eticky představuje fatální selhání a ztrátu důvěry veřejnosti v nestrannost a zákonnost bezpečnostního sboru.`,
              `Příslušník může být výhradně dočasně převeden na jinou práci, dokud se trest nevymaže z rejstříku.`
            ],
    correctOption: 2,
    rationale: 'Zákon č. 361/2003 Sb. (o služebním poměru) stanoví bezúhonnost jako základní předpoklad pro přijetí i setrvání ve službě. Kriminalita ochránců zákona narušuje samotný smysl existence bezpečnostních sborů.',
    source: 'Zákon č. 361/2003 Sb. a Kodex profesní etiky VS ČR',
      explanation: `Zákon č. 361/2003 Sb. (o služebním poměru) stanoví bezúhonnost jako základní předpoklad pro přijetí i setrvání ve službě. Kriminalita ochránců zákona narušuje samotný smysl existence bezpečnostních sborů. (Právní úprava: Zákon č. 361/2003 Sb. a Kodex profesní etiky VS ČR)`
},
  // 47. Oznamování korupce
  {
    id: 'pe_52',
    subject: 'Profesní etika',
    topic: 'Protikorupční program',
    question: 'Co je podle Protikorupčního programu VS ČR základní povinností příslušníka, kterému je nabídnut úplatek?',
    answer: 'Úplatek jednoznačně odmítnout a celou událost bezodkladně nahlásit svým nadřízeným nebo příslušným kontrolním orgánům (GIBS, pověřený orgán). Neoznámení korupce může být samo o sobě trestným činem nebo kázeňským proviněním.',
    options: [
              `Úplatek si dočasně ponechat jako důkaz a pak ho předat poškozeným.`,
              `Přijmout peníze, ale odevzdat je do státního rozpočtu přes účtárnu věznice.`,
              `Úplatek jednoznačně odmítnout a celou událost bezodkladně nahlásit svým nadřízeným nebo příslušným kontrolním orgánům (GIBS, pověřený orgán). Neoznámení korupce může být samo o sobě trestným činem nebo kázeňským proviněním.`,
              `Úplatek odmítnout a celou věc utajit, aby se vyhnul papírování a problémům na pracovišti.`
            ],
    correctOption: 2,
    rationale: 'Oznamovací povinnost (tzv. whistleblowing) je stěžejním nástrojem boje proti korupci. Zaměstnanec, který upozorní na korupci, je chráněn před odvetnými opatřeními (šikanou na pracovišti).',
    source: 'Protikorupční program VS ČR (NGŘ č. 28/2018 Sb.)',
      explanation: `Oznamovací povinnost (tzv. whistleblowing) je stěžejním nástrojem boje proti korupci. Zaměstnanec, který upozorní na korupci, je chráněn před odvetnými opatřeními (šikanou na pracovišti). (Právní úprava: Protikorupční program VS ČR (NGŘ č. 28/2018 Sb.))`
},
  // 48. Nulová tolerance
  {
    id: 'pe_53',
    subject: 'Profesní etika',
    topic: 'Etický kodex',
    question: 'K čemu se vztahuje princip "nulové tolerance" v etickém kodexu vězeňského personálu?',
    answer: 'K jakémukoliv projevu mučení, nelidského či ponižujícího zacházení, rasismu, diskriminace a korupce. Na tyto činy neexistuje žádná omluva ani polehčující okolnost (jako je stres, vyčerpání nebo příkaz nadřízeného).',
    options: [
              `K jakémukoliv projevu mučení, nelidského či ponižujícího zacházení, rasismu, diskriminace a korupce. Na tyto činy neexistuje žádná omluva ani polehčující okolnost (jako je stres, vyčerpání nebo příkaz nadřízeného).`,
              `K užívání vulgarismů při komunikaci s kolegy.`,
              `K pozdním příchodům do služby a nedodržování přestávek na jídlo.`,
              `Ke ztrátě klíčů od kanceláří a skladů.`
            ],
    correctOption: 0,
    rationale: 'Zákaz mučení a nelidského zacházení je absolutním lidským právem (čl. 3 EÚLP), které nelze omezit ani v době války či výjimečného stavu. Kodex etiky tento zákaz plně přejímá.',
    source: 'Kodex profesní etiky a Evropská úmluva o lidských právech',
      explanation: `Zákaz mučení a nelidského zacházení je absolutním lidským právem (čl. 3 EÚLP), které nelze omezit ani v době války či výjimečného stavu. Kodex etiky tento zákaz plně přejímá. (Právní úprava: Kodex profesní etiky a Evropská úmluva o lidských právech)`
},
  // 49. Zastupování organizace na veřejnosti
  {
    id: 'pe_54',
    subject: 'Profesní etika',
    topic: 'Profesní chování',
    question: 'Jak by se měl příslušník VS ČR chovat v době mimo službu (v občanském životě a na sociálních sítích)?',
    answer: 'I mimo službu je povinen chovat se tak, aby nesnižoval vážnost a důvěryhodnost bezpečnostního sboru. Nesmí se opíjet na veřejnosti, vyvolávat konflikty, stýkat se se závadovými osobami a na sociálních sítích sdílet obsah, který podporuje extremismus, nenávist nebo odhaluje utajované skutečnosti z výkonu služby.',
    options: [
              `Mimo službu (bez uniformy) se na něj nevztahují žádná pravidla a může se chovat zcela podle vlastního uvážení.`,
              `Mimo službu nesmí vůbec používat sociální sítě ani se účastnit veřejného života v obci.`,
              `I mimo službu je povinen chovat se tak, aby nesnižoval vážnost a důvěryhodnost bezpečnostního sboru. Nesmí se opíjet na veřejnosti, vyvolávat konflikty, stýkat se se závadovými osobami a na sociálních sítích sdílet obsah, který podporuje extremismus, nenávist nebo odhaluje utajované skutečnosti z výkonu služby.`,
              `Může na sociálních sítích volně kritizovat vedení státu a soudy, protože má právo na svobodu slova.`
            ],
    correctOption: 2,
    rationale: 'Zákon o služebním poměru (§ 46) a Kodex etiky vyžadují od příslušníků zvýšený standard morálního chování 24/7. Neetické chování v soukromí (např. rasistické komentáře na Facebooku) často vede ke kárnému řízení.',
    source: '§ 46 zákona č. 361/2003 Sb. a Kodex profesní etiky VS ČR',
      explanation: `Zákon o služebním poměru (§ 46) a Kodex etiky vyžadují od příslušníků zvýšený standard morálního chování 24/7. Neetické chování v soukromí (např. rasistické komentáře na Facebooku) často vede ke kárnému řízení. (Právní úprava: § 46 zákona č. 361/2003 Sb. a Kodex profesní etiky VS ČR)`
},
  // 50. Objektivita a nestrannost
  {
    id: 'pe_55',
    subject: 'Profesní etika',
    topic: 'Základní principy',
    question: 'Co znamená požadavek "nestrannosti" při výkonu služby ve věznici?',
    answer: 'Příslušník přistupuje ke všem vězněným osobám bez předsudků, nezvýhodňuje ani nediskriminuje na základě rasy, národnosti, náboženství, pohlaví nebo majetku. Svá rozhodnutí zakládá výhradně na faktech, zákonech a vnitřních řádech.',
    options: [
              `Příslušník přistupuje ke všem vězněným osobám bez předsudků, nezvýhodňuje ani nediskriminuje na základě rasy, národnosti, náboženství, pohlaví nebo majetku. Svá rozhodnutí zakládá výhradně na faktech, zákonech a vnitřních řádech.`,
              `Příslušník musí dávat přednost těm vězňům, kteří s ním spolupracují a donášejí na ostatní.`,
              `Příslušník nesmí volit ve volbách, aby zůstal politicky neutrální.`,
              `Příslušník se nesmí bavit s vězni o ničem jiném než o práci.`
            ],
    correctOption: 0,
    rationale: 'Nestrannost a rovný přístup (zákaz diskriminace) tvoří základní pilíř spravedlivého výkonu trestu. Vězeň musí vnímat, že s ním stát jedná férově a na základě pravidel, nikoli na základě osobních sympatií dozorce.',
    source: 'Kodex profesní etiky VS ČR',
      explanation: `Nestrannost a rovný přístup (zákaz diskriminace) tvoří základní pilíř spravedlivého výkonu trestu. Vězeň musí vnímat, že s ním stát jedná férově a na základě pravidel, nikoli na základě osobních sympatií dozorce. (Právní úprava: Kodex profesní etiky VS ČR)`
},
    {
        id: 'pe_56',
        subject: 'Profesní etika',
        topic: 'Střet zájmů a přijímání darů',
        question: 'Může příslušník nebo zaměstnanec VS ČR přijmout peněžitý dar nebo pozornost od rodinného příslušníka vězněné osoby jako poděkování za lidský přístup?',
        answer: 'Ne, přijetí jakéhokoliv daru nebo výhody v souvislosti s výkonem služby je striktně zakázáno a zakládá podezření z korupčního jednání.',
        options: [
            'Ano, pokud hodnota daru nepřesáhne částku 500 Kč a je o tom sepsán neformální záznam.',
            'Ne, přijetí jakéhokoliv daru nebo výhody v souvislosti s výkonem služby je striktně zakázáno a zakládá podezření z korupčního jednání.',
            'Ano, ale pouze pokud se jedná o kávu, čokoládu nebo jiné trvanlivé potraviny.',
            'Ano, pokud k předání dojde mimo areál věznice v době osobního volna.'
        ],
        correctOption: 1,
        rationale: 'Dle zákona č. 361/2003 Sb. i Kodexu etiky VS ČR nesmí příslušník v souvislosti s výkonem služby požadovat ani přijímat dary nebo jiné výhody pro sebe ani pro jiného.',
        source: '§ 46 zákona č. 361/2003 Sb. a Etický kodex VS ČR',
        explanation: 'Přijetí daru nebo výhody v souvislosti s výkonem služby je striktně zakázáno zákonem i etickým kodexem.'
    },
    {
        id: 'pe_57',
        subject: 'Profesní etika',
        topic: 'Důstojnost a lidská práva',
        question: 'Která mezinárodní úmluva a evropská pravidla tvoří základní etický standard zacházení s vězněnými osobami v podmínkách VS ČR?',
        answer: 'Evropská úmluva o lidských právech a Evropská vězeňská pravidla Rady Evropy.',
        options: [
            'Ženevské úmluvy o válečných zajatcích výhradně pro případ válečného stavu.',
            'Evropská úmluva o lidských právech a Evropská vězeňská pravidla Rady Evropy.',
            'Mezinárodní obchodní kodex pro nápravná zařízení.',
            'Vnitřní předpisy Mezinárodní vězeňské asociace pro soukromé věznice.'
        ],
        correctOption: 1,
        rationale: 'Evropská vězeňská pravidla a Úmluva o ochraně lidských práv a základních svobod vymezují nepřekročitelný etický i právní rámec lidské důstojnosti a zákazu nelidského zacházení.',
        source: 'Evropská vězeňská pravidla (Doporučení Rec(2006)2) a EÚLP',
        explanation: 'Evropská vězeňská pravidla a EÚLP vymezují nepřekročitelný standard lidské důstojnosti a humánního zacházení ve vězeňství.'
    }
];
