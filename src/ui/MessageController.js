/**
 * MessageController
 *
 * @author      Ondřej Macoszek <ondra.macoszek@gmail.com>
 * @copyright   (c) 2010 Ondřej Macoszek
 */

function MessageController()
{
    var messages = $('.messages');

    this.add = function(type, content, timer)
    {
        var message = $('<p>'+content+'</p>');
        message.addClass(type);
        message.prependTo(messages);
        if(timer) {
            message.animate({opacity: 1.0}, timer);
            message.fadeOut('slow', function(){
                $(this).remove();
            });
        }
    }

    this.notice = function(content, timer)
    {
        this.add('notice', content, timer);
    }

    this.error = function(content, timer)
    {
        this.add('error', content, timer);
    }

    this.clearAll = function()
    {
         messages.empty();
    }

    this.clear = this.clearAll;
}