(function() {
    var container,
        asyncDataSource,
        VirtualList = kendo.ui.VirtualList,
        CONTAINER_HEIGHT = 200;

    function scroll(element, height) {
        element.scrollTop(height);
        element.trigger("scroll");
    }

    function generateData(parameters) {
        var items = [];
        for (var i = parameters.skip, len = parameters.skip + parameters.take; i < len; i++) {
            items.push({
                text: " Item " + i
            });
        }
        
        return items;
    }

    module("VirtualList: ", {
        setup: function() {
            container = $("<div id='container' style='height: " + CONTAINER_HEIGHT + "px;'></div>").appendTo(QUnit.fixture);

            asyncDataSource = new kendo.data.DataSource({
                transport: {
                    read: function(options) {
                        setTimeout(function() {
                            options.success({ data: generateData(options.data), total: 100 });
                        }, 0);
                    }
                },
                serverPaging: true,
                pageSize: 40,
                schema: {
                    data: "data",
                    total: "total"
                }
            });
        },

        teardown: function() {
            if (container.data("kendoVirtualList")) {
                container.data("kendoVirtualList").destroy();
            }

            QUnit.fixture.empty();
        }
    });

    //rendering

    test("creates list wrapper", 1, function() {
        var virtualList = new VirtualList(container, {
            dataSource: asyncDataSource
        });

        equal(virtualList.element.find(".k-wrapper").length, 1);
    });

    asyncTest("creates height container", 1, function() {
        var virtualList = new VirtualList(container, {
            dataSource: asyncDataSource
        });
        
        setTimeout(function() {
            start();
            equal(virtualList.element.find(".k-height-container").length, 1);
        }, 100);
    });

    asyncTest("sets the height of the heightContainer", 1, function() {
        var virtualList = new VirtualList(container, {
            dataSource: asyncDataSource
        });
        
        setTimeout(function() {
            start();
            equal(virtualList.element.find(".k-height-container").height(), 4000); //dataSource.total() * itemHeight
        }, 100);
    });

    asyncTest("initially builds the listScreens", 1, function() {
        var virtualList = new VirtualList(container, {
            listScreens: 6,
            itemHeight: 20,
            dataSource: asyncDataSource
        });

        setTimeout(function() {
            start();
            var items = virtualList.element.find(".k-wrapper").children();
            equal(items.length, (CONTAINER_HEIGHT/20)*6);
        }, 100);
    });

    asyncTest("adds .k-virtual-item class to the item placeholders", 1, function() {
        var virtualList = new VirtualList(container, {
            dataSource: asyncDataSource
        });

        setTimeout(function() {
            start();
            var items = virtualList.items();
            ok(items.hasClass("k-virtual-item"));
        }, 100);
    });

    //dataBinding

    asyncTest("reads the dataSource (autoBind: true by default)", 1, function() {
        asyncDataSource.one("change", function() {
            start();
            ok(true);
        });

        var virtualList = new VirtualList(container, {
            dataSource: asyncDataSource
        });
    });

    //asyncTest("switches the range when threshold is passed", 2, function() {
    //    var virtualList = new VirtualList(container, {
    //        dataSource: asyncDataSource,
    //        listScreens: 4,
    //        itemHeight: 20,
    //        threshold: 1
    //    });

    //    setTimeout(function() {
    //        asyncDataSource.one("change", function() {
    //            start();
    //            equal(asyncDataSource._ranges.length, 2);
    //            equal(asyncDataSource._ranges[1].start, 40);
    //        });
    //        scroll(container, 3 * CONTAINER_HEIGHT + 10);
    //    }, 150);
    //});

    //templates
    
    test("initializes the default templates", function() {
        var virtualList = new VirtualList(container, {
            dataSource: asyncDataSource
        });

        ok(virtualList.templates);

        for (key in virtualList.templates) {
            equal(typeof virtualList.templates[key], "function");
        }
    });

    asyncTest("uses the item template to render items", function() {
        var virtualList = new VirtualList(container, {
            dataSource: asyncDataSource,
            template: "<span class='foo'>#:text#</span>"
        });

        setTimeout(function() {
            start();
            var items = virtualList.items();

            ok(items.find(".foo").length > 0);
            items.each(function(idx, element) {
                equal(element.innerText, "Item " + idx);
            });
        }, 100);
    });

    asyncTest("wraps the item template in div.k-virtual-item", function() {
        var virtualList = new VirtualList(container, {
            dataSource: asyncDataSource,
            template: "<span class='foo'>#:text#</span>"
        });

        setTimeout(function() {
            start();

            var items = virtualList.element.find(".foo");
            items.each(function(idx, element) {
                ok(items.eq(idx).parent().is(".k-virtual-item"));
            });
        }, 100);
    });

    asyncTest("accepts function as item template", function() {
        var myTemplate = function(data) {
            return "<span class='foo'>" + data.text + "</span>";
        };

        var virtualList = new VirtualList(container, {
            dataSource: asyncDataSource,
            template: myTemplate
        });

        setTimeout(function() {
            start();
            var items = virtualList.items();

            ok(items.find(".foo").length > 0);
            items.each(function(idx, element) {
                equal(element.innerText, "Item " + idx);
            });
        }, 100);
    });

    test("displays a loading animation until the dataSource's data is fetched", 1, function() {
        var virtualList = new VirtualList(container, {
            dataSource: asyncDataSource
        });

        ok(virtualList.element.find(".k-loading-mask").length);
    });

    asyncTest("hides the loading animation when dataSource's data is fetched", 2, function() {
        var virtualList = new VirtualList(container, {
            dataSource: asyncDataSource
        });

        asyncDataSource.one("change", function() {
            start();
            equal(virtualList.element.find(".k-loading-mask").length, 0);
        });

        ok(virtualList.element.find(".k-loading-mask").length);
    });

    asyncTest("displays placeholder template when list is scrolled to a not available range", 1, function() {
        var virtualList = new VirtualList(container, {
            dataSource: asyncDataSource,
            placeholderTemplate: "<span class='foo'>foo...</span>",
            itemHeight: 20
        });

        setTimeout(function() {
            start();
            scroll(container, 3 * CONTAINER_HEIGHT + 60);
            equal(container.find(".k-wrapper").children().first().html(), '<span class="foo">foo...</span>');
        }, 100)
    });

    asyncTest("accepts function as placeholderTemplate", 1, function() {
        var virtualList = new VirtualList(container, {
            dataSource: asyncDataSource,
            placeholderTemplate: function() {
                return "<span class='foo'>foo...</span>";  
            },
            itemHeight: 20
        });

        setTimeout(function() {
            start();
            scroll(container, 3 * CONTAINER_HEIGHT + 60);
            equal(container.find(".k-wrapper").children().first().html(), '<span class="foo">foo...</span>');
        }, 100)
    });

    //scrolling
    
    asyncTest("loads new items when list is scrolled", function() {
        var virtualList = new VirtualList(container, {
            dataSource: asyncDataSource,
            template: "#:text#",
            placeholderTemplate: "loading data...",
            listScreens: 4,
            itemHeight: 20
        });


        setTimeout(function() {
            start();

            scroll(container, 3 * CONTAINER_HEIGHT); //scroll the list 3 screens down
            var lastScreenItems = $(virtualList.items().slice(-10));

            lastScreenItems.each(function(idx, element) {
                equal(element.innerText, "loading data...");
            });
        }, 100);
    });


    asyncTest("shifts the position of item placeholders", function() {
        var virtualList = new VirtualList(container, {
            dataSource: asyncDataSource,
            template: "#:text#",
            placeholderTemplate: "loading data...",
            listScreens: 4,
            itemHeight: 20
        });

        setTimeout(function() {
            start();
            scroll(container, 3 * CONTAINER_HEIGHT); //scroll the list 1 screens
            var lastScreenItems = virtualList.items().slice(-10);

            lastScreenItems.each(function(idx, element) {
                equal($(element).position().top, (4 * CONTAINER_HEIGHT) + (idx * 20));
            });
        }, 100);
    });

    asyncTest("starts dataSource request to fetch the next range when threshold is passed", function() {
        var virtualList = new VirtualList(container, {
            dataSource: asyncDataSource,
            template: "#:text#",
            placeholderTemplate: "loading data...",
            listScreens: 4,
            itemHeight: 20
        });

        setTimeout(function() {
            asyncDataSource.one("requestStart", function(e) {
                start();
                ok(true, "request started");
            });

            //threshold is 800 * 0.5 = 400, at 400 + 1 * itemHeight dataSource should request the new range
            scroll(container, 2 * CONTAINER_HEIGHT + 20); //scroll the list 1 screens
        }, 100);
    });

    asyncTest("does not shift the position of item placeholders until threshold is passed", function() {
        var virtualList = new VirtualList(container, {
            dataSource: asyncDataSource,
            template: "#:text#",
            placeholderTemplate: "loading data...",
            listScreens: 4,
            itemHeight: 20
        });

        setTimeout(function() {
            start();
            //total placeholders height is 200/20 * 4 = 800
            //threshold is 800 * 0.5 = 400, at 400 + 1 * itemHeight placeholders should re-position
            scroll(container, 2 * CONTAINER_HEIGHT);
            var items = virtualList.items();

            items.each(function(idx, element) {
                equal($(element).position().top, idx * 20);
            });
        }, 100);
    });

    asyncTest("user is able to jump to the bottom of the list", function() {
        var virtualList = new VirtualList(container, {
            dataSource: asyncDataSource,
            template: "#:text#",
            placeholderTemplate: "loading data...",
            listScreens: 4,
            itemHeight: 20
        });

        setTimeout(function() {
            //total height is dataSource.total * itemHeight
            //max scrollTop is total height - CONTAINER_HEIGHT
            scroll(container, 100 * 20 - CONTAINER_HEIGHT);

            setTimeout(function() {
                start();
                var items = virtualList.items();
                var data = asyncDataSource.data();

                items.each(function(idx, element) {
                    equal(items.eq(idx).text(), data[idx].text);
                });
            }, 300);
        }, 100);
    });

    //utilities

    asyncTest("calculates the item count", 1, function() {
        var virtualList = new VirtualList(container, {
            listScreens: 6,
            itemHeight: 20,
            dataSource: asyncDataSource
        });
        
        setTimeout(function() {
            start();
            equal(virtualList.itemCount, 60);
        }, 150);
    });

    test("gets the container height", 1, function() {
        var virtualList = new VirtualList(container, {
            dataSource: asyncDataSource
        });

        equal(virtualList.screenHeight, 200);
    });

    test("calculates buffer sizes in pixels", 2, function() {
        var virtualList = new VirtualList(container, {
            dataSource: asyncDataSource
        });

        var bufferSizes = virtualList._bufferSizes();

        equal(bufferSizes.down, 200, "down");
        equal(bufferSizes.up, 400, "up");
    });

    //misc

    test("does not create elements with height larger than 250000px", 4, function() {
        //testing with 100011 items
        dataSource = new kendo.data.DataSource({
            transport: {
                read: function(options) {
                    options.success({ data: generateData(options.data), total: 100011 });
                }
            },
            serverPaging: true,
            pageSize: 10,
            schema: {
                data: "data",
                total: "total"
            }
        });

        var virtualList = new VirtualList(container, {
            dataSource: dataSource
        });
        
        //height is dataSource.total() * itemHeight
        equal(virtualList.element.find(".k-height-container").height(), 100011 * 40);

        heightPadChildren = virtualList.element.find(".k-height-container").children();

        //heightPad container is expanded by elements with max height of 250000
        //dataSource.total() * itemHeight / MaxHeightElement + 1 ("1" is added because the total height is not devided by 250000)
        equal(heightPadChildren.length, Math.floor(100011 * 40 / 250000) + 1);

        equal(heightPadChildren.first().height(), 250000);
        equal(heightPadChildren.last().height(), 40 * 11);
    });

})();
