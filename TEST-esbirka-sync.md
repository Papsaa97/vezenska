# Zkušební soubor — ověření automatické synchronizace

Tenhle soubor je **dočasný** a nemá v `main` co dělat. Existuje jen proto, aby
pull request, který založí workflow `sync-esbirka.yml`, měl neprázdný rozdíl
a bylo z něj na první pohled poznat, že jde o zkoušku, ne o skutečnou novelu.

Co se ověřuje: že workflow po nalezení změny doběhne až k založení pull requestu,
tedy že repozitář má povolené *Allow GitHub Actions to create and approve pull
requests*. Běh bez nalezené změny to neověří, protože se ke kroku vůbec nedostane.

Jak byla zkouška připravena: v `public/data/esbirka/sb-1992-555.json` bylo znění
vráceno na č. 24 (účinné od 1. 8. 2025). Synchronizace ho má stáhnout znovu,
rozpoznat rozdíl a otevřít pull request.

Po ověření se tenhle soubor i zkušební větev mažou.
