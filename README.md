rcache: observable and active RESTful cacher for jQuery
=======================================================

[https://github.com/itbrig/rcache](https://github.com/itbrig/rcache)

Report issues: [https://github.com/itbrig/rcache/issues](https://github.com/itbrig/rcache/issues)

Description
-----------

* _rcache is an active cache_. It adds a layer between the application and the
jQuery ajax interface, enabling you to reuse stored resources without consulting
the server.

* _rcache is observable_. The application can register callbacks that will
fire when a resources is beeing updated or removed.

* _rcache supports RESTful applications_. It handles the standard HTTP methods
GET, PUT, POST and DELETE.


### jQuery version ###
rcache has been tested with jQuery 1.7.1 using QUnit unit test in _/test_


### Tested browsers ###
Firefox 10, Chrome 16


### License ###
Copyright (c) 2012 Hannes Forsgård
Licensed under the WTFPL (http://sam.zoy.org/wtfpl/)


Conditional requests
--------------------
rcache transparently supports conditional requests. If the server sends _ETag_
or _Last-Modified_ headers these are automatically returned as
_If-Unmodified-Since_ and _If-Match_ headers for PUT and DELETE requests and as
_If-Modified-Since_ and _If-None-Match_ headers for GET requests.


When not to use rcache
----------------------
rcache is not a general purpose caching proxy. As such it does not honor 
_no-store_, _no-cache_, _must-revalidate_ or _vary_ headers. This kind of
caching should not be implemented in clients, but rather through a forward
proxy.


API
---

Some short usage examples. Checkout package and open the documentation for
better coverage.

### Access items ###

    var jqXHR = $.rcache.item('/url/to/item').get();
    jqXHR.done(function(){
        //Do something when data is ready
        //even if data is read from cache
    });

### RESTful applications ###
    
    //Update an item using PUT
    $.rcache.item('/url/to/item').put({data});

    //Create a new item using POST
    var jqXHR = $.rcache.item('/creator/resource').post({data});
    jqXHR.done(function(){
        //A new item will be created in cache if response includes
        //a Content-Location or Location header.
    });
    
    //Delete an item using DELETE
    $.rcache.item('/item/to/remove').del();
    
### Observe cache changes ###

    $.rcache.item('/url/to/item').onWrite(function(data, etag, modified, jqXHR){
        //Fired when cache item is updated (by a get, put, post or write action)
        //Params: reponse data, etag and last-modified headers, jqXHR object
    });

    $.rcache.item('/url/to/item').onRemove(function(data, etag, modified, jqXHR){
        //Fired when cache item is removed (by a del or remove action)
        //Params: reponse data, etag and last-modified headers, jqXHR object
    });

### Update items in cache ###

    //Send a conditional get request
    //if the server responds with fresh data a write event is fired
    $.rcache.item('/url/to/item').update();
    
    //Send an unconditional get request, write event will always be fired
    $.rcache.item('/url/to/item').forceGet();

    //Call .update() on all items with autoUpdate = true
    $.rcache.updateAll();

