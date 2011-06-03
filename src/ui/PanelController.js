/**
 * PanelController
 *
 * @author      Ondřej Macoszek <ondra.macoszek@gmail.com>
 * @copyright   (c) 2010 Ondřej Macoszek
 */

function PanelController()
{
    /**
     * ------------------------------------------------------------------------
     *  Properties
     * ------------------------------------------------------------------------
     */

     // constants
     var DASHBOARD = 'dashboard';
     var EXERCISE_ALL = 'exerciseAll';
     var EXERCISE_PROBLEMATIC = 'exerciseProblematic';
     var MANAGE = 'manage';

     // components
     var storage = chrome.extension.getBackgroundPage().storage;
     var panelController = this;
     var messages = new MessageController();
     this.dashboardController = null;
     this.exerciseController = null;
     this.manageController = null;

     // shortcuts for important elements
     var panels = $('.panel');
     var panelDashboard = $('.panel.dashboard');
     var panelExercise = $('.panel.exercise');
     var panelManage = $('.panel.manage');

    /**
     * ------------------------------------------------------------------------
     *  Storage getter/setter
     * ------------------------------------------------------------------------
     */

     this.isStateDashboard = function()
     {
         return this.getState() == DASHBOARD;
     }

     this.isStateExercise = function()
     {
         return (this.getState() == EXERCISE_ALL) || (this.getState() == EXERCISE_PROBLEMATIC);
     }

     this.isStateExerciseAll = function()
     {
         return this.getState() == EXERCISE_ALL;
     }

     this.isStateExerciseProblematic = function()
     {
         return this.getState() == EXERCISE_PROBLEMATIC;
     }

     this.isStateManage = function()
     {
         return this.getState() == MANAGE;
     }

     this.getState = function()
     {
         return storage.getItem('panelState');
     }

     this.setState = function(state)
     {
         storage.setItem('panelState', state);
     }

    /**
     * ------------------------------------------------------------------------
     *  Core methods
     * ------------------------------------------------------------------------
     */
    
     this.activateManage = function()
     {
         this.setState(MANAGE);
         panels.hide();
         panelManage.show();
     }

     this.activateExerciseAll = function()
     {
         this.setState(EXERCISE_ALL);
         panels.hide();
         panelExercise.show();
     }

     this.activateExerciseProblematic = function()
     {
         this.setState(EXERCISE_PROBLEMATIC);
         panels.hide();
         panelExercise.show();
     }

     this.activateDashboard = function()
     {
         this.setState(DASHBOARD);
         panels.hide();
         panelDashboard.show();
     }
     
     this.loadStoredState = function()
     {
         var panelState = this.getState();
         switch(panelState) {
             case MANAGE:
                this.manageController.actionManage();
                break;
             case EXERCISE_ALL:
                this.exerciseController.actionExerciseAll();
                break;
             case EXERCISE_PROBLEMATIC:
                this.exerciseController.actionExerciseProblematic();
                break;
             case DASHBOARD:
             default:
                this.dashboardController.actionDashboard();
         }
     }

    /**
     * ------------------------------------------------------------------------
     *  Constructor
     * ------------------------------------------------------------------------
     */

     // empty

}
