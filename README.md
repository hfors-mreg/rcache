rcache: observable and active RESTful cacher for jQuery
=======================================================

[link to repo]
[link to docs]
[link to issues]

Description
-----------

__rcache is an active cache__: It ads a layer between the application and the jQuery
ajax interface, enabling you to reuse stored resources without consulting
the server.

__rcache is an observable cache__: The application can register callbacks that will
fire when a resources is beeing updated or removed.

__rcache is a RESTful cache__: It supports the standard HTTP methods (GET, PUT, POST, DELETE).


### jQuery version ###
rcache has been tested with jQuery 1.7.1 using QUnit unit test in _/test_


### Tested browsers ###
Firefox x.x, Chrome x.x


### License ###
Copyright (c) 2012 Hannes Forsgård
GPL...


Motivation for rcache
---------------------
* Updating resources in the background.
* Opening multiple versions of one resource.


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

Examples
--------

        //När skapas tabben?? redan här?
        var tab = createTab();
        tab.setContent('laddar');

        $.rcache.item('url').onWrite(function(data, etag, modified, jqXHR){
            tab.setIsOutdated(); //ska visa ett ! bredvid * (för ej sparad, om den finns)
            askUser('vill du uppdatera tab?', function(){
                var content = template.render(data);
                tab.setContent(content);
                tab.setAltered = false;
                tab.setIsOutdated = false;
            });
        }).get();

