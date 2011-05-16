/**
 * ========================================================================
 *  Entities
 * ========================================================================
 */

/**
 * Word
 *
 * @author      Ondřej Macoszek <ondra.macoszek@gmail.com>
 * @copyright   (c) 2010 Ondřej Macoszek
 */
function Word(a, b, c)
{
    /**
     * ------------------------------------------------------------------------
     *  Properties
     * ------------------------------------------------------------------------
     */

    var original = "";
    var translation = "";
    var isProblematic = false;


    /**
     * ------------------------------------------------------------------------
     *  Getters and setters
     * ------------------------------------------------------------------------
     */

    this.getOriginal = function()
    {
        return original;
    };
    this.setOriginal = function(_original)
    {
        original = _original;
    };

    this.getTranslation = function()
    {
        return translation;
    };
    this.setTranslation = function(_translation)
    {
        translation = _translation;
    };

    this.isProblematic = function()
    {
        return isProblematic;
    };
    this.setIsProblematic = function(_isProblematic)
    {
        isProblematic = _isProblematic ? true : false;
    };

    /**
     * ------------------------------------------------------------------------
     *  Other
     * ------------------------------------------------------------------------
     */
   
    this.equals = function(word)
    {
        if(
            word instanceof Word
            && (original == word.getOriginal())
            && (translation == word.getTranslation())
            && (isProblematic == word.isProblematic())
        ) {
                return true;
        } else {
                return false;
        }
    }

    this.copy = function(word)
    {
        if(word instanceof Word) {
            original = word.getOriginal();
            translation = word.getTranslation();
            isProblematic = word.isProblematic();
        }
    }

    this.toDebugString = function()
    {
        return "Word["+original+", "+translation+", "+isProblematic+"]";
    }

    this.toJSON = function()
    {
        return {
            "original" : original,
            "translation" : translation,
            "isProblematic" : isProblematic
        }
    }

    this.fromJSON = function(data)
    {
        original = data.original;
        translation = data.translation;
        isProblematic = data.isProblematic;
    }

    /**
     * ------------------------------------------------------------------------
     *  Constructor
     * ------------------------------------------------------------------------
     */

    if(typeof(a) == 'string') {
        original = a ? a : "";
        translation = b ? b : "";
        isProblematic = c ? true : false;
    } else if( (typeof(a) == 'object') ) {
        this.fromJSON(a);
    } 

}


/**
 * ========================================================================
 *  DAO controllers
 * ========================================================================
 */

/**
 * WordDAO
 *
 * @author      Ondřej Macoszek <ondra.macoszek@gmail.com>
 * @copyright   (c) 2010 Ondřej Macoszek
 */

function WordDAO()
{
    /**
     * ------------------------------------------------------------------------
     *  Properties
     * ------------------------------------------------------------------------
     */

    var words = null;
    var storage = chrome.extension.getBackgroundPage().storage;

    /**
     * ------------------------------------------------------------------------
     *  Storage operations
     * ------------------------------------------------------------------------
     */

    this.refresh = function()
    {
        // get words in JSON format stored in background page context
        words = storage.getItem('words');
        words = words != null ? words : [];

        // convert JSON to Word objects 
        for(i = 0; i < words.length; i++) {
            words[i] = new Word(words[i]);
        }
    }

    this.persist = function()
    {
        // send words as array of objects into background page context
        // will be converted into JSON automatically
        storage.setItem('words', words);
    }

    /**
     * ------------------------------------------------------------------------
     *  Administrative operations
     * ------------------------------------------------------------------------
     */

    this.exists = function(word)
    {
        for(i = 0; i < words.length; i++) {
            if(words[i].equals(word)) {
                return true;
            }
        }
        return false;
    }

    this.add = function(word)
    {
        //if(!this.exists(word) && word instanceof Word) {
        if(word instanceof Word) {
            // make copy of given word
            var tmpWord = new Word();
            tmpWord.copy(word);
            
            // store new word
            words.push(tmpWord);
            this.persist();
        } 
    }

    this.edit = function(id, word)
    {
        if(words[id] && word instanceof Word) {
            // copy word data into word object on given id
            words[id].copy(word);

            // store edited word
            this.persist();
        }
    }

    this.remove = function(id)
    {
        // cut out the object on given id
        words.splice(id, 1);

        // store edited word
        this.persist();
    }

    this.removeAll = function()
    {
        // remove all
        words = [];

        // store cleared list
        this.persist();
    }


    this.removeAllButProblematic = function()
    {
        words = this.findProblematicWords();

        // store only problematic words
        this.persist();
    }

    this.findById = function(id)
    {
        if(words[id]) {
            return words[id]; // exporting private property, thus read-only usage
        } else {
            return null;
        }
    }

    this.findProblematicWords = function()
    {
        var problematicWords = [];
        for(i = 0; i < words.length; i++) {
            if(words[i].isProblematic()) {
                problematicWords.push(words[i]);
            }
        }
        return problematicWords;
    }

    this.findProblematicIndexes = function()
    {
        var problematicIndexes = [];
        for(i = 0; i < words.length; i++) {
            if(words[i].isProblematic()) {
                problematicIndexes.push(i);
            }
        }
        return problematicIndexes;
    }

    this.findAll = function()
    {
        return words; // exporting private property, thus read-only usage
    }

    this.getProblematicCount = function()
    {
        var problematicCount = 0;
        for(i = 0; i < words.length; i++) {
            if(words[i].isProblematic()) problematicCount++;
        }
        return problematicCount;
    }

    this.getTotalCount = function()
    {
        return words.length;
    }


    /**
     * ------------------------------------------------------------------------
     *  Constructor
     * ------------------------------------------------------------------------
     */
    
    this.refresh();
    
}

/**
 * ========================================================================
 *  Helpers
 * ========================================================================
 */

/**
 * isArray implementation
 * http://www.hunlock.com/blogs/Mastering_Javascript_Arrays
 */
function isArray(testObject)
{
    return testObject
        && !(testObject.propertyIsEnumerable('length'))
        && typeof testObject === 'object'
        && typeof testObject.length === 'number';
}

/**
 * Array shuffle implementation
 * http://www.hunlock.com/blogs/Mastering_Javascript_Arrays
 */
function shuffleArray(data)
{
    for(var rnd, tmp, i = data.length; i;
        rnd = parseInt(Math.random()*i), tmp = data[--i],
        data[i] = data[rnd], data[rnd] = tmp);
};