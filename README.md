Výuka slovíček (rozšíření pro Chrome)
=====================================

## Vize

**Okamžitě dostupné procvičování slovíček přímo v prohlížeči.**

![Dashboard](https://github.com/peruginni/Vyuka-Slovicek-Chrome-Extension/raw/master/docs/screenshot-dashboard.png)
![Exercise](https://github.com/peruginni/Vyuka-Slovicek-Chrome-Extension/raw/master/docs/screenshot-exercise.png)
![Edit](https://github.com/peruginni/Vyuka-Slovicek-Chrome-Extension/raw/master/docs/screenshot-edit.png)


### Podrobnější popis 

Rozšíření umožňuje jednoduché procvičování slovní zásoby v prohlížeči. 

Během procvičování lze označit problémová slova a ty pak procvičovat samostatně. 

Uživatel může přidávat nová slova a upravovat či mazat stávající. 

Rozšíření si pamatuje stav, takže je možné se kdykoli vrátit k naposledy procvičovaným slovíčkům.

## Návrh a implementace

* [core.js](https://github.com/peruginni/Vyuka-Slovicek-Chrome-Extension/blob/master/src/ui/core.js)
  * Třída Word nese veškeré informace o jednom určitém slovíčku v systému. Třída má vlastního správce WordDAO, který zajišťuje persistenci slovíček a jejich vyhledávání (všechny, problematické..).
  * Helpers - promíchání pole
* controllers
   * [DashboardController.js](https://github.com/peruginni/Vyuka-Slovicek-Chrome-Extension/blob/master/src/ui/DashboardController.js) - obsahuje akce reagující na události tlačítek na uvítací stránce (dashboard)
   * [ManageController.js](https://github.com/peruginni/Vyuka-Slovicek-Chrome-Extension/blob/master/src/ui/ManageController.js) - zajišťuje akce pro správu slovíček (přidávání, editace, mazání, listování seznamu)
   * [ExerciseController.js](https://github.com/peruginni/Vyuka-Slovicek-Chrome-Extension/blob/master/src/ui/ExerciseController.js) - odpovídá na akce během procvičování slovíček (označení slova problematického slova, posun na další slovo, zobrazení odpovědi...)
   * [MessageController.js](https://github.com/peruginni/Vyuka-Slovicek-Chrome-Extension/blob/master/src/ui/MessageController.js) - zpracovává a prezentuje zaslané zprávy (upozornění, chyby)
   * [PanelController.js](https://github.com/peruginni/Vyuka-Slovicek-Chrome-Extension/blob/master/src/ui/PanelController.js) - reprezentuje rozcestník, přes který se mění cobrazované pohledy a obrazovky.
* další
   * [background.html](https://github.com/peruginni/Vyuka-Slovicek-Chrome-Extension/blob/master/src/ui/background.html) - obsahuje metody pro nižší úroveň persistence (ukládání přímo do localStorage objektu)





