/**
 * ManageController
 *
 * @author      Ondřej Macoszek <ondra.macoszek@gmail.com>
 * @copyright   (c) 2010 Ondřej Macoszek
 */

function ManageController(_panelController, _wordDAO)
{
    /**
     * ------------------------------------------------------------------------
     *  Properties
     * ------------------------------------------------------------------------
     */

     // components
     var wordDAO = _wordDAO ? _wordDAO : new WordDAO();
     var manageController = this;
     var panelController = _panelController ? _panelController : new PanelController();
     var messages = new MessageController();

     // shortcuts for important elements
     var panelManage = $('.panel.manage');

     // html snippets
     var manageItemControls = '<ul class="controls">'
           + '<li class="edit actionManageEdit">edit</li>'
           + '<li class="remove actionManageRemove">remove</li>'
           + '</ul>';
     var manageItemWords = '<em class="foreign"></em>'
           + '<span class="separator">&rarr;</span>'
           + '<em class="native"></em>'
           + '<input type="hidden" class="index" value="">';
     var manageItemEditForm = '<form>'
           + '<input type="text" class="foreign" value="">'
           + '<span class="separator">&rarr;</span>'
           + '<input type="text" class="native" value="">'
           + '<input type="hidden" class="index" value="">'
           + '<input type="submit" value="OK" class="actionManageEditSubmit">'
           + '</form>';

    /**
     * ------------------------------------------------------------------------
     *  Actions
     * ------------------------------------------------------------------------
     */

     this.actionManage = function()
     {
         this.actionManageReloadWordList();
         messages.clearAll();

         // activate panel
         panelController.activateManage();
     }

     this.actionManageReloadWordList = function()
     {
         var wordList = panelManage.find('.wordList');
         var words = wordDAO.findAll();
         wordList.empty();
         for(i = 0; i < words.length; i++) {
             // build word item
             var wordItem = $('<li>'+manageItemWords+manageItemControls+'</li>');
             wordItem.find('.foreign').html(words[i].getOriginal());
             wordItem.find('.native').html(words[i].getTranslation());
             wordItem.find('.index').val(i);
             if(words[i].isProblematic()) {
                 wordItem.addClass('problematic');
             }
             // add word item to list
             wordList.prepend(wordItem);
         }

         messages.clearAll();
     }

     this.actionManageAdd = function(context)
     {
         var form = $(context).parent();
         var inputForeign = form.find('.foreign input');
         var inputNative = form.find('.native input');

         // stop if both native and foreign are empty
         if( (inputForeign.val() == '' || inputNative.val() == '')
            || (inputForeign.val() == inputForeign.prev().text())
            || (inputNative.val() == inputNative.prev().text()) ) {
             messages.clearAll();
             messages.error('Vypl\u0148te slovo v cizím jazyce a jeho překlad', 10000);
             return;
         }

         // save new word
         var word = new Word();
         word.setOriginal(inputForeign.val());
         word.setTranslation(inputNative.val());
         wordDAO.add(word);

         // clear form and set there focus
         inputNative.val('');
         inputForeign.val('').focus();

         this.actionManageReloadWordList(context);
     }

     this.actionManageEdit = function(context)
     {
         var wordItem = $(context).parents('li');
         wordItem.addClass('edit');

         // fetch word data
         var editedWordId = wordItem.find('.index').val();
         var word = wordDAO.findById(editedWordId);

         // exit if word does not exist
         if(!word) return;

         // clear previous content of item
         wordItem.empty();

         // insert form into item
         wordItem.html(manageItemEditForm);
         wordItem.find('.foreign').val(word.getOriginal());
         wordItem.find('.native').val(word.getTranslation());
         wordItem.find('.index').val(editedWordId);
     }

     this.actionManageEditSubmit = function(context)
     {
         var form = $(context).parent();
         var formForeign = form.find('.foreign');
         var formNative = form.find('.native');
         var editedWordId = form.find('.index').val();

         var word = new Word();
         word.setOriginal(formForeign.val());
         word.setTranslation(formNative.val());
         wordDAO.edit(editedWordId, word);

         this.actionManageReloadWordList(context);
     }

     this.actionManageRemove = function(context)
     {
         var removedWordId = $(context).parents('li').find('.index').val();
         wordDAO.remove(removedWordId);
         this.actionManageReloadWordList(context);
     }

     this.actionManageRemoveAllButProblematic = function(context)
     {
         wordDAO.removeAllButProblematic();
         this.actionManageReloadWordList(context);
     }


    /**
     * ------------------------------------------------------------------------
     *  Constructor
     * ------------------------------------------------------------------------
     */

    // bind to panel constructor
     panelController.manageController = this;

    /**
     * Routing actions
     */

     $('.actionManage').live('click', function(){
         manageController.actionManage(this); return false;
     });
     $('.actionManageAdd').live('click', function(){
         manageController.actionManageAdd(this); return false;
     });
     $('form:has(.actionManageAdd)').submit(function(){
         manageController.actionManageAdd(this); return false;
     });
     $('.actionManageEdit').live('click',function(){
         manageController.actionManageEdit(this); return false;
     });
     $('.actionManageEditSubmit').live('click',function(){
         manageController.actionManageEditSubmit(this); return false;
     });
     $('form:has(.actionManageEditSubmit)').live('submit',function(){
         manageController.actionManageEditSubmit(this); return false;
     });
     $('.actionManageEditCancel').live('click',function(){
         manageController.actionManageEditCancel(this); return false;
     });
     $('.actionManageRemove').live('click',function(){
         manageController.actionManageRemove(this); return false;
     });
     $('.actionManageRemoveAllButProblematic').live('click', function(){
         manageController.actionManageRemoveAllButProblematic(this);
         return false;
     });

     /**
      * Form for creating new words
      */
     var manageAddWordFormInputEvents = {
        blur : function() {
            var input = $(this);
            if(!input.val()) input.val(input.prev().text());
        },
        focus : function(){
            var input = $(this);
            if(input.val() == input.prev().text()) {
                input.val('');
            }
        }
     }
     panelManage
     .find('.add .foreign input')
     .bind(manageAddWordFormInputEvents).trigger('blur');
     panelManage
     .find('.add .native input')
     .bind(manageAddWordFormInputEvents).trigger('blur');


     
}
