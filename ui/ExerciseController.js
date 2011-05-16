/**
 * ExerciseController
 *
 * @author      Ondřej Macoszek <ondra.macoszek@gmail.com>
 * @copyright   (c) 2010 Ondřej Macoszek
 */

function ExerciseController(_panelController, _wordDAO)
{
    /**
     * ------------------------------------------------------------------------
     *  Properties
     * ------------------------------------------------------------------------
     */

     // constants
     var NEXT_WORD = 'nextWord';
     var ANSWER = 'answer'
     var RESTART = 'restart'

     // components
     var wordDAO = _wordDAO ? _wordDAO : new WordDAO();
     var storage = chrome.extension.getBackgroundPage().storage;
     var exerciseController = this;
     var panelController = _panelController ? _panelController : new PanelController();
     var messages = new MessageController();

     // shortcuts for important elements
     var panelExercise = $('.panel.exercise');


    /**
     * ------------------------------------------------------------------------
     *  Actions
     * ------------------------------------------------------------------------
     */

     this.actionExerciseAll = function()
     {
         if(wordDAO.getTotalCount() == 0) {
             messages.clearAll();
             messages.notice(
                '<a href="#" class="actionManage">P\u0159idejte pár slov</a> '
                + 'a můžete začít procvičovat'
             );
             return;
         }
         
         panelExercise.find('.head h2').text('CVI\u010cENÍ VŠECH SLOV');

         // call common exercise method
         this.actionExercise();
     }

     this.actionExerciseProblematic = function()
     {
         if(wordDAO.getProblematicCount() == 0) {
             messages.clearAll();
             messages.notice('Zde m\u016fžete cvičit samotná problémová slova. '
              + 'Stačí během <a href="#" class="actionExerciseAll">procvičování</a> '
              + 'označit slova která vám dělají problém.');
             return;
         }

         panelExercise.find('.head h2').text('CVI\u010cENÍ PROBLÉMOVÝCH');

         // call common exercise method with problematicOnly flag
         this.actionExercise(problematicOnly = true);
     }

     this.actionExercise = function(problematicOnly)
     {
         // init word list
         var wordList = this.getExerciseWordList();

         // if previous state
         var isAll = panelController.isStateExerciseAll();
         var isProblematic = panelController.isStateExerciseProblematic();
         if( (!isAll && !isProblematic) // is has other states
             || (isAll && problematicOnly) 
             || (isProblematic && !problematicOnly)
            ) {
             wordList = null;
         }

         // activate panel
         if(problematicOnly)
            panelController.activateExerciseProblematic();
         else
            panelController.activateExerciseAll();

         // prepare list of words to exercise if list is empty
         if(!wordList || wordList.length == 0) {
             wordList = new Array();
             var words = wordDAO.findAll();
             for(var i = 0; i < words.length; i++) {
                 if(problematicOnly && !words[i].isProblematic()) continue;
                 wordList.push(i);
             }
         }

         // shuffle list
         shuffleArray(wordList);

         // save prepared list
         this.setExerciseWordList(wordList);

         // quiz next (first) word
         this.actionExerciseNextWord();

         // show tips
         messages.clearAll();
         messages.notice('Tip: Pou\u017eijte mezerník místo zeleného tlačítka', 10000);
     }

     this.actionExerciseSubmitQuiz = function()
     {
         if(panelController.isStateExercise()) {
             switch(this.getExerciseSubmitAction()) {
                 case NEXT_WORD:
                     this.actionExerciseNextWord();
                     break;
                 case ANSWER:
                     this.actionExerciseAnswer();
                     break;
                 case RESTART:
                 default:
                     this.actionExerciseRestart();
             }
         }
     }

     this.actionExerciseRestart = function()
     {
         panelExercise.find('.word').text('');
         
         if(panelController.isStateExerciseProblematic()) {
             this.actionExerciseProblematic();
         } else {
             this.actionExerciseAll();
         }
     }

     this.actionExerciseNextWord = function()
     {
         // load stored word list
         var wordList = this.getExerciseWordList();
         
         // stop if list is empty
         if(!wordList.length) {
             this.setExerciseSubmitAction(RESTART);

             var msg = 'Výborn\u011b! Všechno procvičeno.';
             if(wordDAO.getProblematicCount()) {
                 if(panelController.isStateExerciseProblematic()) {
                    msg += ' <a href="#" class="actionExerciseProblematic">Procvi\u010dit znova &rarr;</a>';
                 } else {
                    msg += ' <a href="#" class="actionExerciseProblematic">Procvi\u010dit problémová slova &rarr;</a>';
                 }
             } else {
                 msg += ' <a href="#" class="actionExerciseAll">Procvi\u010dit znova &rarr;</a>';
             }
                 
             messages.notice(msg);
             return;
         }

         // get next word id
         var wordId = wordList.shift();
         this.setExerciseWordList(wordList);

         // get entity of next word
         var word = wordDAO.findById(wordId);

         // if no enity fetched
         if(!word) {
             this.actionExerciseNextWord();
             return;
         }

         // change submit action to show answer for currently displayed word
         this.setExerciseSubmitAction(ANSWER);

         // fill html template
         panelExercise.find('.id').val(wordId);
         panelExercise.find('.foreign .word').text(word.getOriginal());
         panelExercise.find('.native .word').text('');
         panelExercise.find('.isProblematic input').attr('checked',
             word.isProblematic()
             ? 'checked' : ''
         );

         var total = wordDAO.getTotalCount();
         var problematic = wordDAO.getProblematicCount();
         panelExercise.find('.remains').text(
             panelController.isStateExerciseAll()
             ? ((total-(wordList.length))+'/'+total)
             : ((problematic-(wordList.length))+'/'+problematic)
         );
     }

     this.actionExerciseAnswer = function()
     {
         var wordId = panelExercise.find('.id').val();

         // get entity of next word
         var word = wordDAO.findById(wordId);

         // if no enity fetched
         if(!word) return;

         // change submit action to show next word
         this.setExerciseSubmitAction(NEXT_WORD);

         // fill word translation
         panelExercise.find('.native .word').text(word.getTranslation());
     }

     this.actionExerciseIsProblematic = function()
     {
         var wordId = panelExercise.find('.id').val();
         var isProblematic = panelExercise.find('.isProblematic input').is(':checked');

         // get entity of next word
         var word = wordDAO.findById(wordId);

         // if no enity fetched
         if(!word) return;

         // set to opposite value
         word.setIsProblematic(
             isProblematic ? true : false
         );

         // save changed word
         wordDAO.edit(wordId, word);

         messages.clearAll();
         messages.notice(
            isProblematic
            ? 'Za\u0159azeno mezi <a href="#" class="actionExerciseProblematic">problémová slova</a>'
            : 'Odebráno z problémových slov'
         , 5000);
     }

     this.actionExerciseClearSession = function()
     {
          this.setExerciseWordList(null);
     }

    /**
     * ------------------------------------------------------------------------
     *  Other
     * ------------------------------------------------------------------------
     */

     this.getExerciseWordList = function()
     {
         return storage.getItem('exerciseWordList');
     }

     this.setExerciseWordList = function(wordList)
     {
         storage.setItem('exerciseWordList', wordList);
     }

     this.getExerciseSubmitAction = function()
     {
         return storage.getItem('exerciseSubmitAction');
     }

     this.setExerciseSubmitAction = function(action)
     {
         var submitButton = panelExercise.find('.actionExerciseSubmitQuiz');
         switch(action) {
             case NEXT_WORD:
                 submitButton.text('Dal\u0161í slovo');
                 break;
             case ANSWER:
                 submitButton.text('Odpov\u011bď');
                 break;
             case RESTART:
                 submitButton.text('Zopakovat!');
                 break;
         }
         storage.setItem('exerciseSubmitAction', action);
     }


    /**
     * ------------------------------------------------------------------------
     *  Constructor
     * ------------------------------------------------------------------------
     */

     // bind to panel constructor
     panelController.exerciseController = this;

    /**
     * Routing actions
     */
    
     $('.actionExerciseAll').live('click', function(){
         exerciseController.actionExerciseAll(this); return false;
     });
     $('.actionExerciseProblematic').live('click', function(){
         exerciseController.actionExerciseProblematic(this); return false;
     });
     $('.actionExerciseRestart').live('click', function(){
         exerciseController.actionExerciseRestart(this); return false;
     });
     $('.actionExerciseAnswer').live('click', function(){
         exerciseController.actionExerciseAnswer(this); return false;
     });
     $('.actionExerciseNextWord').live('click', function(){
         exerciseController.actionExerciseNextWord(this); return false;
     });
     $('.actionExerciseIsProblematic').live('change', function(){
         exerciseController.actionExerciseIsProblematic(this); return false;
     });
     $('.actionExerciseSubmitQuiz, .exercise .native').live('click', function(){
         exerciseController.actionExerciseSubmitQuiz(this); return false;
     });
     $(document).keyup(function(event){
         switch(event.keyCode) {
             case 37: // arrow left
             case 38: // arrow up
             case 39: // arrow right
             case 40: // arrow down
             case 32: // spacebar
             case 13: // return
                exerciseController.actionExerciseSubmitQuiz();
         }
     });

}