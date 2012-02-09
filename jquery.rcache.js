/**
 * Copyright (c) 2012 Hannes Forsgård
 *
 * <p>This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.</p>
 * 
 * <p>This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.</p>
 * 
 * <p>You should have received a copy of the GNU General Public License
 * along with this program.  If not, see &lt;http://www.gnu.org/licenses/&gt;.</p>
 *
 * @fileOverview rcache: observable and active RESTful cacher for jQuery
 * @version 1.0.1
 * @requires jQuery
 * @author Hannes Forsgård <hannes.forsgard@gmail.com>
 */


/**
 * See (http://jquery.com/).
 * @name $
 * @class 
 * See the jQuery Library  (http://jquery.com/) for full details.  This just
 * documents the function and classes that are added to jQuery by this plug-in.
 */


(function($){

    /**
     * @desc Active and observable ajax cache for jQuery REST applications. Uses
     * jQuery.ajax when interacting with the server.
     * <p>A note on keys: Cache keys are case sensitive urls. Take care to use
     * consistent urls, even query parameters and hashes count.</p>
     * @author Hannes Forsgård
     * @class
     */
    $.rcache = new function(){


        /* Settings */


        /**
         * @desc rcache settings. See setup() for altering settings.
         * @var {dict} settings
         */
        this.settings = {
            'update-on-read': true
        };


        /**
         * @desc Set rcache settings. The following settings are available:
         * <dl>
         *     <dt>update-on-read</dt>
         *     <dd>Boolean. Send conditional get requests in the
         *     background on cache reads? Deafaults to true.</dd>
         * </dl>
         * @param {dict} settings
         * @returns {$.rcache} Return rcache instance for chaining purposes
         */
        this.setup = function(settings){
            $.extend(this.settings, settings);
            return this;
        }

        
        /* Basic functionality */        
        

        /**
         * @desc The internal cache store
         * @var {dict} cache
         */
        this.cache = {};


        /**
         * @desc Get number of items in cache
         * @returns {int}
         */
        this.count = function(){
            var count = 0;
            $.each(this.cache, function() { 
                count++;
            });
            return count;
        }


        /**
         * @desc Returns TRUE if cache includes item, FALSE otherwise
         * @param {string} key
         * @returns {bool}
         */
        this.has = function(key){
            return key in this.cache;
        }


        /**
         * @desc Get item for cache key. If item does not exist
         * an empty item is created.
         * @param {string} key
         * @returns {Item}
         */
        this.item = function(key){
            if ( !this.has(key) ) {
                this.cache[key] = new Item(key);
            }
            return this.cache[key];
        }


        /**
         * @desc Clear cache
         * @returns {$.rcache} Return rcache instance for chaining purposes
         */
       this.clear = function(){
            this.cache = {};
            return this;
        }


        /* AJAX */


        /**
         * @desc Update all items in cache where autoUpdate == true, using
         * conditional GET requests
         * @param {dict} options Additional jQuery.ajax options
         * @returns {$.rcache} Return rcache instance for chaining purposes
         */
        this.updateAll = function(options){
            $.each(this.cache, function(key, item) { 
                if ( item.autoUpdate ) {
                    item.update(options);
                }
            });
            return this;
        }


        /**
         * @desc Settings used when creating ajax objects
         * @var {dict} ajaxOpts
         */
        this.ajaxOpts = {
            //Default settings goes here ...
            cache: false
        }; 


        /**
         * @desc Set default ajax optins. By default rcache requests are created
         * with the 'cache' option set to false.
         * @param {dict} options
         * @returns {$.rcache} Return rcache instance for chaining purposes
         */
        this.ajaxSetup = function(options){
            $.extend(this.ajaxOpts, options);
            return this;
        }


        /**
         * @desc Internal method to create and fire a jqXHR.
         * @param {dict} options
         * @returns {jqXHR}
         */
        this.getJqXHR = function(options){
            var settings = {};
            $.extend(settings, this.ajaxOpts, options);
            return $.ajax(settings);
        }

    }



    /**
     * @desc Each item in cache is represented by an Item object
     * @param {string} url Url of created item
     * @class
     * @name Item
     */
    function Item(url){

        /**
         * @desc Item url
         * @name Item.url
         * @type string
         */
        this.url = url;


        /**
         * @desc Resource item data
         * @name Item.data
         * @type mixed
         */
        this.data = false;

 
        /**
         * @desc Request object that fetched resource
         * @name Item.jqXHR
         * @type jqXHR
         */
        this.jqXHR = false;

        
        /**
         * @desc If true this item will be updated on updateAll calls.
         * @name Item.autoUpdate
         * @type bool
         */
        this.autoUpdate = false;


        /**
         * @desc Callback functions for write events
         * @name Item.writeCallbacks
         * @type array
         */
        this.writeCallbacks = [];
        

        /**
         * @desc Callback functions for remove events
         * @name Item.removeCallbacks
         * @type array
         */
        this.removeCallbacks = [];


        /**
         * @desc Inspect if item contains data
         * @name Item.hasData
         * @function
         * @returns {bool}
         */
        this.hasData = function(){
            return !!this.data;
        }


        /**
         * @desc Get ETag response header
         * @name Item.etag
         * @function
         * @return {string}
         */
        this.etag = function(){
            if ( !this.jqXHR ) return '';
            var etag = this.jqXHR.getResponseHeader('ETag');
            return ( etag ) ? etag : '';
        }


        /**
         * @desc Get Last-Modified response header
         * @name Item.modified
         * @function
         * @return {string}
         */
        this.modified = function(){
            if ( !this.jqXHR ) return '';
            var modified = this.jqXHR.getResponseHeader('Last-Modified');
            return ( modified ) ? modified : '';
        }


        /**
         * @desc Bind function to write event. Callbacks consume four parameters:
         * the response body, Etag header (if present), Last-Modofied header
         * (if present) and the jqXHR object.
         * @name Item.onWrite
         * @function
         * @param {func} func
         * @returns {Item} This item, for chaining purposes
         */
        this.onWrite = function(func){
            this.writeCallbacks.push(func);
            return this;
        }


        /**
         * @desc Bind function to remove event. Callbacks consume four parameters:
         * the response body, Etag header (if present), Last-Modofied header
         * (if present) and the jqXHR object.
         * @name Item.onRemove
         * @function
         * @param {func} func
         * @returns {Item} This item, for chaining purposes
         */
        this.onRemove = function(func){
            this.removeCallbacks.push(func);
            return this;
        }


        /**
         * @desc Fire a write event. Does not send requests or affect cache content.
         * @name Item.triggerWrite
         * @function
         * @returns {Item} This item, for chaining purposes
         */
        this.triggerWrite = function(){
            var item = this;
            $.each(this.writeCallbacks, function(index, func){
                func(item.data, item.etag(), item.modified(), item.jqXHR);
            });
            return this;
        }


        /**
         * @desc Fire a remove event. Does not send requests or affect cache content.
         * @name Item.triggerRemove
         * @function
         * @returns {Item} This item, for chaining purposes
         */
        this.triggerRemove = function(){
            var item = this;
            $.each(this.removeCallbacks, function(index, func){
                func(item.data, item.etag(), item.modified(), item.jqXHR);
            });
            return this;
        }


        /**
         * @desc Write new content to item. Triggers write event. Sets
         * autoUpdate to true, enabling this item to be updated on updateAll
         * @name Item.write
         * @function
         * @param {mixed} data
         * @param {jqXHR} jqXHR
         * @returns {Item} This item, for chaining purposes
         */
        this.write = function(data, jqXHR){
            this.data = data;
            this.jqXHR = jqXHR;
            this.autoUpdate = true;
            this.triggerWrite();
            return this;
        }


        /**
         * @desc Remove item from cache
         * @name Item.remove
         * @function
         * @returns {void}
         */
        this.remove = function(){
            this.triggerRemove();
            delete $.rcache.cache[this.url];
        }


        /* AJAX */


        /**
         * @desc If item is not in cache a http GET request is sent. If item is
         * already in cache the previous jqXHR object is returned.
         * @name Item.get
         * @function
         * @param {dict} options Additional jQuery.ajax options
         * @returns {jqXHR}
         */
        this.get = function(options){
            if ( this.hasData() && this.jqXHR ) {
                
                //Perform update in the background
                if ( $.rcache.settings['update-on-read'] ) {
                    this.update(options);
                }
                
                //Return jqXHR of item already in cache
                return this.jqXHR;
            } else {
                //Create new ajax request
                return this.forceGet(options);
            }
        }


        /**
         * @desc Perform a conditional http GET request. If resource have
         * been updated changes are written to the cache.
         * @name Item.update
         * @function
         * @param {dict} options Additional jQuery.ajax options
         * @returns {jqXHR}
         */
        this.update = function(options){
            var opts = {
                type: 'GET',
                url: this.url,
                headers: {
                    'If-None-Match': this.etag(),
                    'If-Modified-Since': this.modified(),
                }
            };

            $.each(opts.headers, function(index, value){
                if ( !value ) delete opts.headers[index];
            });

            $.extend(true, opts, options);

            var jqXHR = $.rcache.getJqXHR(opts);
            var item = this;

            jqXHR.done(function(body, status, jqXHR){
                //Write to item on success
                //304 == Not Modified
                if ( jqXHR.status == 200 ) {
                    item.write(body, jqXHR);
                }
            });

            jqXHR.fail(function(jqXHR){
                //Remove item on response 404
                if ( jqXHR.status == 404 ) {
                    item.remove();
                }
            });

            return jqXHR;
        }


        /**
         * @desc Force a http GET request, even if item is in cache
         * @name Item.forceGet
         * @function
         * @param {dict} options Additional jQuery.ajax options
         * @returns {jqXHR}
         */
        this.forceGet = function(options){
            if ( !options ) options = {};

            var opts = {
                type: 'GET',
                url: this.url,
                headers: {
                    'If-None-Match': '',
                    'If-Modified': '',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            };

            $.extend(true, opts, options);

            var jqXHR = $.rcache.getJqXHR(opts);
            var item = this;

            jqXHR.done(function(body, status, jqXHR){
                //Write to item on success
                item.write(body, jqXHR);
            });

            return jqXHR;
        }


        /**
         * @desc Delete item using http DELETE and remove from cache
         * @name Item.del
         * @function
         * @param {dict} options Additional jQuery.ajax options
         * @returns {jqXHR}
         */
        this.del = function(options){
            if ( !options ) options = {};

            var opts = {
                type: 'DELETE',
                url: this.url,
                headers: {
                    'If-Match': this.etag(),
                    'If-Unmodified-Since': this.modified(),
                }
            };

            $.each(opts.headers, function(index, value){
                if ( !value ) delete opts.headers[index];
            });

            $.extend(true, opts, options);
     
            var jqXHR = $.rcache.getJqXHR(opts);
            var item = this;

            jqXHR.done(function(body, status, jqXHR){
                //Remove from cache on success
                item.remove();
            });
            return jqXHR;
        }


        /**
         * @desc Send item using http PUT. If the server returns status code 200
         * (OK) and a response body the returned resource is written to cache.
         * @name Item.put
         * @function
         * @param {mixed} data
         * @param {dict} options Additional jQuery.ajax options
         * @returns {jqXHR}
         */
        this.put = function(data, options){
            if ( !options ) options = {};

            var opts = {
                type: 'PUT',
                url: this.url,
                data: data,
                headers: {
                    'If-Match': this.etag(),
                    'If-Unmodified-Since': this.modified(),
                }
            };

            $.each(opts.headers, function(index, value){
                if ( !value ) delete opts.headers[index];
            });

            $.extend(true, opts, options);

            var jqXHR = $.rcache.getJqXHR(opts);
            var item = this;

            jqXHR.done(function(body, status, jqXHR){
                //write to cache if these requirements are met
                if ( jqXHR.status == 200 && body ) {
                    item.write(body, jqXHR);
                }
            });

            return jqXHR;
        }


        /**
         * @desc Send http POST request. If the server returns status code 200
         * (OK) or 201 (created), a response body and a Content-Location header
         * the resource is written to cache. Else if the server returns a
         * Location header a GET request for that url is triggered.
         * @name Item.post
         * @function
         * @param {mixed} data
         * @param {dict} options Additional jQuery.ajax options
         * @returns {jqXHR}
         */
        this.post = function(data, options){
            if ( !options ) options = {};

            var opts = {
                type: 'POST',
                url: this.url,
                data: data
            };

            $.extend(true, opts, options);
     
            var jqXHR = $.rcache.getJqXHR(opts);

            jqXHR.done(function(body, status, jqXHR){
                var contentLocation = jqXHR.getResponseHeader('Content-Location');
                var location = jqXHR.getResponseHeader('Location');

                //write to cache if these requirements are met
                if (
                    (jqXHR.status == 200 || jqXHR.status == 201)
                    && body
                    && contentLocation
                ) {
                    $.rcache.item(contentLocation).write(body, jqXHR);
                
                //else get a fresh copy
                } else if ( location ) {
                    $.rcache.item(location).forceGet();
                }
            });
            
            return jqXHR;
        }

    }

})(jQuery);
