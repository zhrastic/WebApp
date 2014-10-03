/*
 * Durandal TreeView 1.0.0 by Goran Vukoja
 */
define(['durandal/app', 'knockout', 'jquery'], function (app, ko, $) {




    //
    //DefaultValues
    //
    var defaults = {
        nodes: [],
        loadOnDemand: false,
        multiSelect: false
    };

    var noop = function () { };


    function Node(treeview, text, data, children, disabled) {
        var self = this;
        self.treeview = treeview;

        self.parent = null;

        self.text = text;//Tekst node-a
        self.data = data;
        self.isLoading = ko.observable(false);
        self.loaded = false;//Flag da li je Node uèitan - bitno kod "loadOnDemand" opcije TreeView-a
        self.disabled = ko.observable(disabled !== undefined ? disabled : false);//Da li je node disable-an

        if (!children) children = [];
        self.nodes = ko.observableArray(children);//Djeca Node-a




        //***********************************************************************
        //Expand node-a----------------------------------------------------------
        //***********************************************************************
        var _expanded = ko.observable(false);
        self.expanded = ko.computed({
            read: function () {
                return _expanded();
            },
            write: function (value) {
                if (self.loaded) {//Ako je Node uèitan
                    _expanded(value);
                }
                else if (value) {//Ako Node nije uèitan, a treeview nam je vratio "true" (ako je èitav treeview definiran)
                    var result = self.treeview.checkExpand(self);
                    if (result === true) {
                        self.loaded = true;
                        _expanded(true);
                    }
                    else if (result && result.then) {
                        self.isLoading(true);
                        setTimeout(function () {//Postavljamo expanded false u timeout-u jer ne možemo u obradi
                            _expanded(false);
                            result.then(function (children) {//Promise - Lazy load child nodova
                                self.isLoading(false);
                                self.loaded = true;
                                _expanded(true);
                                self.children = children;
                                if (children) {
                                    self.nodes(self.treeview.generateNodes(children));
                                    for (var i = 0; i < self.nodes().length; i++) {
                                        self.nodes()[i].parent = self;
                                    }
                                }
                            });

                        }, 1);

                    }
                }
            },
            owner: self
        });

        self.expandMe = function () {
            if (self.expanded()) {
                self.expanded(false);
                return;
            }
            self.expanded(true);
        };

        self.forceExpand = function () {
            self.expanded(true);
        };
        self.forceCollapse = function () {
            self.expanded(false);
        };

        self.getFullPathName = function() {
            if (self.parent == null) {
                return self.text;
            } 
            return self.parent.getFullPathName() + "/" + self.text;
        };
    }

    function TreeView(config) {
        var self = this;

        config.treeView = self; //referenca na objekt nazad u konfig fajl

        self.identifierProperty = config.identifierProperty ? config.identifierProperty : null;
        self.textProperty = config.textProperty ? config.textProperty : null;
        self.childrenProperty = config.childrenProperty ? config.childrenProperty : null;
        self.disabledProperty = config.disabledProperty ? config.disabledProperty : null;

        self.multiSelect = config.multiSelect !== undefined ? config.multiSelect : defaults.multiSelect;
        self.loadOnDemand = config.loadOnDemand !== undefined ? config.loadOnDemand : defaults.loadOnDemand;
        self.loadFunction = config.loadFunction;

        self.data = config.data;
        self.selectedData = config.selectedData;
        self.nodes = ko.observableArray([]);
        self.onSelectionChange = config.onSelectionChange ? config.onSelectionChange : noop;

        //Templates
        self.nodeCotainerTemplate = null;//Template za renderiranje èitave Node strukture: Tekst + children
        self.nodeHeaderTemplate = null;//Template za renderiranje header-a noda

        //***********************************************************************
        //Generating nodes-------------------------------------------------------
        //***********************************************************************
        if (ko.isObservable(self.data)) {
            self.data.subscribe(function (changes) {
                if (!self.multiSelect && self.selectedNodes().length > 1) {
                    for (var i = 0; i < changes.length; i++) {
                        var change = changes[i];
                        if (change.status == "added") {
                            self.nodes.push(self.generateNode(change.value));
                        }
                    }
                }
            }, null, 'arrayChange');
        }

        self.generateNodes = function (nodesData) {
            if (!nodesData) return null;
            var nodes = [];
            var arr = ko.isObservable(nodesData) ? nodesData() : nodesData;
            for (var i = 0; i < arr.length; i++) {
                var dataEntity = arr[i];
                nodes.push(self.generateNode(dataEntity));
            }
            return nodes;
        };

        self.generateNode = function (data) {
            var childNodes = null;
            if (self.childrenProperty) {
                childNodes = self.generateNodes(data[self.childrenProperty]);
            }

            var node = new Node(self,
								data[self.textProperty],
								data,
								childNodes,
								self.disabledProperty ? data[self.disabledProperty] : false
								);
            
            if (childNodes != null) {
                for (var i = 0; i < childNodes.length; i++) {
                    childNodes[i].parent = node;
                }
                node.loaded = true;
            }
            

            return node;
        };

        self.addChildNodeFromData = function(parentNode, childData) {
            var newNode = self.generateNode(childData);
            newNode.parent = parentNode;
            if (self.childrenProperty) {
                parentNode.data[self.childrenProperty].push(childData);
            }
            parentNode.nodes.push(newNode);
        };

        //***********************************************************************
        //Expanding nodes-------------------------------------------------------
        //***********************************************************************
        self.checkExpand = function (node) {
            if (!self.loadOnDemand) {
                return true;
            }
            else {
                return self.loadFunction(node.data, node);
            }
        };

        //***********************************************************************
        //Selection node-a-------------------------------------------------------
        //***********************************************************************
        self.select = function (node) {
            var index = self.selectedNodes().indexOf(node);
            if (index == -1) {
                self.selectedNodes.push(node);
                self.onSelectionChange(node, "added");
            } else {
                self.selectedNodes.remove(node);
                self.onSelectionChange(node, "removed");
            }

        };

        self.isSelected = function (node) {
            return self.selectedNodes().indexOf(node) > -1;
        };

        self.selectedNodes = ko.observableArray();

        self.selectedNodes.subscribe(function (changes) {
            if (!self.multiSelect && self.selectedNodes().length > 1) {
                for (var i = 0; i < changes.length; i++) {
                    var change = changes[i];
                    if (change.status == "added") {
                        setTimeout(function () {
                            self.selectedNodes([change.value]);
                        }, 1);
                        break;
                    }
                }
            }
        }, null, 'arrayChange');


        //***********************************************************************
        //CSS--------------------------------------------------------------------
        //***********************************************************************
        self.slide = function (elements) {
            setTimeout(function () {
                $(elements[1]).toggleClass("slidedown");
            }, 10);
        };

        //***********************************************************************
        //Template---------------------------------------------------------------
        //***********************************************************************
        self.model = null;
        self.binding = function (child, parent, settings) {
            self.nodeCotainerTemplate = $($(child).find('[data-part="node-container-template"]')[0]).html();
            self.nodeHeaderTemplate = $($(child).find('[data-part="node-header-template"]')[0]).html();
            var treeViewHolder = $(child).find(".css-treeview");
            if (treeViewHolder.length > 0) {
                var ctx = ko.contextFor(treeViewHolder[0]);
                self.model = ctx.$root;
            }
        };


        //***********************************************************************
        //Manipulacija---------------------------------------------------------------
        //***********************************************************************
        self.expandAll = function () {
            if (self.nodes()) {
                for (var i = 0 ; i < self.nodes().length; i++) {
                    var nodeItem = self.nodes()[i];
                    expandNode(nodeItem);
                }
            }
        };
        
        self.collapseAll = function () {
            if (self.nodes()) {
                for (var i = 0 ; i < self.nodes().length; i++) {
                    var nodeItem = self.nodes()[i];
                    collapseNode(nodeItem);
                }
            }
        };

        self.refresh = function() {
            self.nodes(self.generateNodes(self.data));
        };

        self.findAndExpand = function(dataPropertyName, dataPropertyValue) {
            var findedNode = null;
            var list = self.nodesToList();
            for (var i = 0; i < list.length; i++) {
                var nodeItem = list[i];
                var nodeData = nodeItem.data;
                if (nodeData[dataPropertyName] && nodeData[dataPropertyName] == dataPropertyValue) {
                    self.collapseAll();
                    self.selectedNodes.push(nodeItem);
                    expandNodeToRoot(nodeItem);
                    findedNode = nodeItem;
                }
            }
            return findedNode;
        };

        self.nodesToList = function() {
            var list = [];

            if (self.nodes()) {
                for (var i = 0 ; i < self.nodes().length; i++) {
                    var nodeItem = self.nodes()[i];
                    childToList(nodeItem, list);
                }
            }

            return list;
        };

        //***********************************************************************
        //Na kraju pozovi generiranje nodova-------------------------------------
        //***********************************************************************
        self.nodes(self.generateNodes(self.data));

        
        self.compositionComplete = function (view, parent) {

        };


        //***********************************************************************
        //Privtne funkcije-------------------------------------
        //***********************************************************************

        var expandNodeToRoot = function(node) {
            node.forceExpand();
            if (node.parent != null) {
                expandNodeToRoot(node.parent);
            }
        };

        

        var expandNode = function (nodeItem) {
            nodeItem.forceExpand();
            if (nodeItem.nodes().length > 0) {
                for (var i = 0; i < nodeItem.nodes().length; i++) {
                    var childItem = nodeItem.nodes()[i];
                    expandNode(childItem);
                }
            }
        };

        var collapseNode = function (nodeItem) {
            nodeItem.forceCollapse();
            if (nodeItem.nodes().length > 0) {
                for (var i = 0; i < nodeItem.nodes().length; i++) {
                    var childItem = nodeItem.nodes()[i];
                    collapseNode(childItem);
                }
            }
        };

        var childToList = function (nodeItem, list) {
            list.push(nodeItem);
            if (nodeItem.nodes().length > 0) {
                for (var i = 0; i < nodeItem.nodes().length; i++) {
                    var childItem = nodeItem.nodes()[i];
                    if (nodeItem.nodes().length > 0) {
                        childToList(childItem, list);
                    }
                }
            }
        };

    }


    return function TreeViewWidget() {
        var self = this;

        self.activate = function (config) {
            //I do this because of the funky things that happen when constructing the grid
            //before you have the observable's you are actually using
            //$.extend(self, new TreeView(config));
            if (!self.initialised) {
                TreeView.call(self, config);
            }
        };
    };
});