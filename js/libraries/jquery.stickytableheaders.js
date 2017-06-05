/*! Copyright (c) 2011 by Jonas Mosbech - https://github.com/jmosbech/StickyTableHeaders
    MIT license info: https://github.com/jmosbech/StickyTableHeaders/blob/master/license.txt */

/*
 * Source: http://jsfiddle.net/LqZ2T/15/
 * Updated by: Mohammad M. AlBanna
 * Website: MBanna.info
 * For: www.JungleScout.com
*/

;(function ($, window, undefined) {
    'use strict';

    var pluginName = 'stickyTableHeaders';
    var id = 0;
    var defaults = {
            fixedOffset: 0,
            container: null
        };

    /* 
     * This was taken from stackoverflow:
     * http://stackoverflow.com/questions/7501761/div-scrollbar-width
     */
    function getScrollbarWidth() 
    {
        var div = $('<div style="width:50px;height:50px;overflow:hidden;position:absolute;top:-200px;left:-200px;"><div style="height:100px;"></div></div>'); 
        $('body').append(div); 
        var w1 = $('div', div).innerWidth(); 
        div.css('overflow-y', 'auto'); 
        var w2 = $('div', div).innerWidth(); 
        $(div).remove(); 
        return (w1 - w2);
    }


    function Plugin (el, options) {
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;
        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;
        base.id = id++;

        // Listen for destroyed, call teardown
        base.$el.bind('destroyed',
            $.proxy(base.teardown, base));

        /* Need to use element to get offset if container is window.
         * Otherwise use container's offset for calculations.
         */
        base.getContainerOffset = function(){
            var c_offset = base.$container[0].getBoundingClientRect();
            var e_offset = base.$el[0].getBoundingClientRect();
            return c_offset === null ? {'top': 0, 'left': e_offset.left} : c_offset;
        };

        base.init = function () {
            base.setOptions(options);
            /* We need to know how much to scroll to activate and deactivate the
             * sticky header. I originally tried to calculate this using .position
             * on the child element. This works fine so long as the parent element
             * has its position set to something other than "static". Please
             * see this stackoverflow thread for why:
             *  http://stackoverflow.com/questions/2842432/jquery-position-isnt-returning-offset-relative-to-parent
             *
             * So to get this to work everywhere, I grab the difference from
             * the top of the child element and the top of the parent element
             * when the page loads. This should tell us how much we need to
             * scroll to activate the sticky header.
             *
             * Also - the offset function does not seem to take any table
             * captions into consideration. So we check for a table caption
             * and add this in to the amount we need to scroll for an
             * activation.
             *
             * This part has been changed by Mohammad M. AlBanna
             * Website: www.MBanna.info
             * For: www.JungleScout.com
             */

            var startTopOffset = base.getContainerOffset().top - Math.abs(base.$el[0].getBoundingClientRect().top);
            var caption = base.$el.find('caption');
            if (caption.length){
                startTopOffset += caption.height();
            }
            base.scrollAmountToActivate = startTopOffset;
            base.scrollAmountToDeactivate = base.scrollAmountToActivate + base.$el.height();

            /* See notes in updateWidth for why we need this*/
            base.parentClientWidth = base.$container.width() - getScrollbarWidth();

            // Keep track of state
            base.isCloneVisible = false;
            base.leftOffset = null;
            base.topOffset = null;

            base.$el.each(function () {
                var $this = $(this);

                // remove padding on <table> to fix issue #7
                $this.css('padding', 0);

                $this.wrap('<div class="divTableWithFloatingHeader"></div>');
                $this.find("thead.tableFloatingHeader").remove();

                base.$originalHeader = $('thead:first', this);
                base.$clonedHeader = base.$originalHeader.clone();

                base.$clonedHeader.addClass('tableFloatingHeader');
                base.$clonedHeader.css({
                    'position': 'fixed',
                    'top': 0,
                    'z-index': 1, // #18: opacity bug
                    'display': 'none'
                });

                base.$originalHeader.addClass('tableFloatingHeaderOriginal');
                base.$originalHeader.after(base.$clonedHeader);

                // enabling support for jquery.tablesorter plugin
                // forward clicks on clone to original
                $('th', base.$clonedHeader).click(function (e) {
                    var index = $('th', base.$clonedHeader).index(this);
                    $('th', base.$originalHeader).eq(index).click();
                });
                $this.bind('sortEnd', base.updateWidth);
            });

            base.updateWidth();
            base.toggleHeaders();
            base.bind();
            
        };

        base.setOptions = function (options) {
            base.options = $.extend({}, defaults, options);
            base.$window = $(window);
            base.$clonedHeader = null;
            base.$originalHeader = null;
            base.$container = base.options.container != null ? $(base.options.container) : base.$window;
        };

        base.toggleHeaders = function () {
            base.$el.each(function () {
                var $this = $(this);
 
                var newTopOffset = isNaN(base.options.fixedOffset) ?
                    base.options.fixedOffset.height() : base.options.fixedOffset;
                var offset = base.getContainerOffset();
                var scrollTop = base.$container.scrollTop() + newTopOffset;
                var scrollLeft = base.$container.scrollLeft();
                if ((scrollTop > base.scrollAmountToActivate) && (scrollTop < base.scrollAmountToDeactivate)) {
                    var newLeft = offset.left - scrollLeft;
                    if (base.isCloneVisible && (newLeft === base.leftOffset) && (newTopOffset === base.topOffset)) {
                        return;
                    }

                    base.$clonedHeader.css({
                        'top': newTopOffset + offset.top,
                        'margin-top': 0,
                        'left' : newLeft,
                        'display': 'block'
                    });
                    base.updateWidth();

                    base.$originalHeader.css('visibility', 'hidden');
                    base.isCloneVisible = true;
                    base.leftOffset = newLeft;
                    base.topOffset = newTopOffset;
                }
                else if (base.isCloneVisible) {
                    base.$clonedHeader.css('display', 'none');
                    base.$originalHeader.css('visibility', 'visible');
                    base.isCloneVisible = false;
                }
            });
        };

        base.updateWidth = function () {
            // Copy cell widths and classes from original header
            $('th', base.$clonedHeader).each(function (index) {
                var $this = $(this);
                var $origCell = $('th', base.$originalHeader).eq(index);
                this.className = $origCell.attr('class') || '';
                $this.css('width', $origCell.width());
            });

            // Copy row width from whole table
            base.$clonedHeader.css('width', base.$originalHeader.width());

            // One last thing - if our table is inside of another
            // scrolled div, the width of our parent div could
            // be less than that of the cloned header.
            // This would cause the cloned div to display outside
            // of our parent's viewport and would appear "on top of"
            // any scrollbars on our parent. Need to clip.
            if(base.$clonedHeader.width() > base.parentClientWidth || base.$clonedHeader.width() < base.parentClientWidth)
            {
                var scrollLeft = base.$container.scrollLeft();
                var clipLeft = scrollLeft;
                var clipRight =  base.$container.width() + scrollLeft;
                base.$clonedHeader.css({
                    'clip': 'rect(0px, ' + clipRight + 'px, ' 
                                       + base.$clonedHeader.height() + 'px,' 
                                       + clipLeft + 'px)'
                    });
            } 
        };

        base.destroy = function (){
            base.$el.unbind('destroyed', base.teardown);
            base.teardown();
        };

        base.teardown = function(){
            $.removeData(base.el, 'plugin_' + pluginName);
            if(typeof base != "undefined"){
                base.unbind();
                base.$clonedHeader.remove();
                base.$originalHeader.removeClass('tableFloatingHeaderOriginal');
                base.$originalHeader.css('visibility', 'visible');
                base.$el.remove("thead.tableFloatingHeader");
                base.el = null;
                base.$el = null;
            }
        };

        base.bind = function(){
            base.$container.on('scroll.' + pluginName + base.id,base.toggleHeaders);
            base.$container.on('resize.' + pluginName + base.id,base.toggleHeaders);
            base.$container.on('resize.' + pluginName + base.id,base.updateWidth);
        };

        base.unbind = function(){
            base.$container.off('scroll.' + pluginName + base.id,base.toggleHeaders);
            base.$container.off('resize.' + pluginName + base.id,base.toggleHeaders);
            base.$container.off('resize.' + pluginName + base.id,base.updateWidth);
        };

        base.updateOptions = function (options) {
            base.unbind();
            base.bind();
            base.updateWidth();
            base.toggleHeaders();
        };

        // Run initializer
        base.init();
    }

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            var instance = $.data(this, 'plugin_' + pluginName);
            if (instance) {
                if (typeof options === 'string') {
                    instance[options].apply(instance);
                } else {
                    instance.updateOptions(options);
                }
            } else if(typeof instance == "undefined" && options !== 'destroy') {
                $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
            }
        });
    };

})(jQuery, window);
