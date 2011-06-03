/**
 * DashboardController
 *
 * @author      Ondřej Macoszek <ondra.macoszek@gmail.com>
 * @copyright   (c) 2010 Ondřej Macoszek
 */

function DashboardController(_panelController, _wordDAO)
{
    /**
     * ------------------------------------------------------------------------
     *  Properties
     * ------------------------------------------------------------------------
     */

     // components
     var wordDAO = _wordDAO ? _wordDAO : new WordDAO();
     var storage = chrome.extension.getBackgroundPage().storage;
     var dashboardController = this;
     var panelController = _panelController ? _panelController : new PanelController();
     var messages = new MessageController();

     // shortcuts for important elements
     var panelDashboard = $('.panel.dashboard');

    /**
     * ------------------------------------------------------------------------
     *  Actions
     * ------------------------------------------------------------------------
     */
 
     this.actionDashboard = function()
     {
         var total = wordDAO.getTotalCount();
         var problematic = wordDAO.getProblematicCount();
         var totalString, problematicString;

         if(total > 4) totalString = 'Cvi\u010dit všech <em>'+total+'</em> slov';
         else if (total > 1) totalString = 'Cvi\u010dit všechna <em>'+total+'</em> slova';
         else if (total == 1) totalString = 'Cvi\u010dit <em>'+total+'</em> slovo';
         else totalString = 'Celkem <em>'+total+'</em> slov';
         panelDashboard.find('.actionExerciseAll').html(totalString);

         if(problematic > 4) problematicString = 'Cvi\u010dit <em>'+problematic+'</em> problémových';
         else if (problematic > 1) problematicString = 'Cvi\u010dit <em>'+problematic+'</em> problémová';
         else if (problematic == 1) problematicString = 'Cvi\u010dit <em>'+problematic+'</em> problémové';
         else problematicString = '<em>0</em> problémových';
         panelDashboard.find('.actionExerciseProblematic').html(problematicString);

         messages.clearAll();

         // activate panel
         panelController.activateDashboard();
     }

    /**
     * ------------------------------------------------------------------------
     *  Constructor
     * ------------------------------------------------------------------------
     */

     // bind to panel constructor
     panelController.dashboardController = this;

    /**
     * Routing actions
     */

     // dashboard actions
     $('.actionDashboard').live('click', function(){
         dashboardController.actionDashboard(this); return false;
     });


}
