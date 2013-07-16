/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

/* Simple extension that opens images for preview instead of showing the error modal. */
define(function (require, exports, module) {
    "use strict";
    
    /* Sadly enough, this is the only line of code utilizing 
     * Brackets' architecture in the right way. */
    var Strings = brackets.getModule("strings");

    /* Since there is no way of extending Editor internally, 
     * hacking and slashing into the UI with dirty jQuery code 
     * is our only hope. */
    $('#project-files-container').on("click contextmenu", function(event) {
        
        var $target = $(event.target).closest("a");
        
        if ( $target.hasClass("jstree-clicked") && $target.text().match(/^.*\.(png|jpe?g|bmp|gif)$/) ) {

            var filename  = $target.text();
            var filepath  = $target.closest("li").data("entry").fullPath;
            
            /* Instead of suppressing the error modal we will patiently wait 
             * for it to appear and then we mutate its contents to substitute the 
             * error for our beautiful image file. JS villains alright. */
            
            MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
            
            var observer = new MutationObserver(function(mutations, observer) {
                
                for ( var i=0; i<mutations.length; ++i ) {
                    for ( var j=0; j<mutations[i].addedNodes.length; ++j ) {
                        
                        /* Checking if the modal appeared during the changes observed */
                        if ( $(mutations[i].addedNodes[j]).hasClass('error-dialog') ) {
                            
                            var dialog = $(mutations[i].addedNodes[j]);
                            
                            dialog.find('h1').text(filename);
                            dialog.find('.modal-body').html('<img src="file://'+filepath+'" style="max-width: 100%; max-height: 300px; border-radius: 5px; margin: 20px auto 0; display: block;" />');
                            dialog.find('img').on("load", function() {
                                $(this).after('<p style="text-align: center; margin: 10px 0 15px; font-size: 120%;">' + this.naturalWidth + ' x ' + this.naturalHeight + ' ' + Strings.UNIT_PIXELS +'</p>'); 
                            });
                            
                            observer.disconnect();
                            
                        }
                    }
                }
                
            });
            
            observer.observe($('body').get(0), {
                childList: true
            });
            
        }
    });

});
