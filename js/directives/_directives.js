'use strict';

angular.module('arachne.directives', [])

    .directive('arEntityTitle', function() {
        return {
            scope: { entity: '=' },
            templateUrl: 'partials/directives/ar-entity-title.html'
        }
    })

    .directive('arSearchNav', function() {
        return {
            templateUrl: 'partials/directives/ar-search-nav.html'
        }
    })

    .directive('arImg', ['arachneSettings', '$http', function(arachneSettings, $http) {
        return {
            scope: {
                imgId: '@',
                imgWidth: '@',
                imgHeight: '@'
            },
            restrict: 'A',
            link: function(scope, element, attrs) {

                scope.loadImg = function() {
                    var img = element[0];
                    if (scope.imgId) {
                        var img = element[0];
                        var imgUri = arachneSettings.dataserviceUri + "/image/";
                        if (scope.imgWidth) {
                            imgUri += "width/" + scope.imgId + "?width=" + scope.imgWidth;
                        } else {
                            imgUri += "height/" + scope.imgId + "?height=" + scope.imgHeight;
                        }
                        $http.get(imgUri, { responseType: 'arraybuffer' })
                            .success(function(data) {
                                var blob = new Blob([data], {type: 'image/jpeg'});
                                img.src = window.URL.createObjectURL(blob);
                            }).error(function(result) {
                                img.src = 'img/imagePlaceholder.png';
                                if (scope.imgWidth) img.width = scope.imgWidth;
                                if (scope.imgHeight) img.height = scope.imgHeight;
                            }
                        );
                    } else {
                        img.src = 'img/imagePlaceholder.png';
                        if (scope.imgWidth) img.width = scope.imgWidth;
                        if (scope.imgHeight) img.height = scope.imgHeight;
                    }
                };

                if (element[0].tagName == 'IMG') {
                    scope.loadImg();
                } else {
                    console.log("Warning: ar-img directive used on a non img element!");
                }

                scope.$watch('imgId', function() {
                    scope.loadImg();
                })

            }
        }
    }])

    .directive('arImageslider', [function(){
        return {
            scope: { entity: '=', currentQuery: '=' },
            templateUrl: 'partials/directives/ar-imageslider.html',
            link: function(scope, element, attrs) {

                var thumbRow = angular.element(angular.element(element.children()[0]).children()[0]).children()[2];
                var sliderRow = angular.element(element.children()[0]).children()[0];

                scope.currentImgNo = 0;
                scope.offset = 0;
                scope.max = 50;

                scope.pageThumbsLeft = function() {
                    var rowRect = sliderRow.getBoundingClientRect();
                    var offset = scope.offset - rowRect.width;
                    if (offset > 0) {
                        scope.offset = offset;
                    } else {
                        scope.offset = 0;
                    }
                };

                scope.pageThumbsRight = function() {
                    var rowRect = sliderRow.getBoundingClientRect();
                    var offset = scope.offset + rowRect.width;
                    scope.max = thumbRow.getBoundingClientRect().width - rowRect.width;
                    if (offset < scope.max) {
                        scope.offset = offset;
                    } else {
                        scope.offset = scope.max;
                    }
                };

                scope.setImage = function(imgNo) {
                    scope.currentImgNo = imgNo;
                    var rowRect = sliderRow.getBoundingClientRect();
                    var thumbEl = angular.element(thumbRow).find('img')[imgNo];
                    var thumbRect = thumbEl.getBoundingClientRect();
                    var relOffset = thumbRect.left - rowRect.left;
                    if (relOffset < 0) {
                        scope.offset += relOffset;
                    } else if (relOffset + thumbRect.width > rowRect.width) {
                        scope.offset += relOffset + thumbRect.width - rowRect.width;
                    }
                };

            }
        }
    }])

    .directive('arImagegrid', ['arachneSettings', '$http', '$sce', '$window', function(arachneSettings, $http, $sce, $window) {
        return {
            scope: {
                cells: '=',
                columns: '@',
                margin: '@',
                hideTitle: '@',
                complete: '=?'
            },
            templateUrl: 'partials/directives/ar-imagegrid.html',

            link: function(scope, element, attrs) {

                scope.loadImage = function(cell) {
                    cell.img = new Image();
                    cell.img.addEventListener("load", function() {
                        // custom event handlers need to be wrapped in $apply
                        scope.$apply(function() {
                            cell.complete = true;
                            scope.resizeRow(cell.row);
                        });
                    });
                    cell.img.addEventListener("error", function() {
                        scope.$apply(function() {
                            cell.complete = true;
                            cell.img = scope.placeholder;
                            scope.resizeRow(cell.row);
                        });
                    });
                    $http.get(cell.imgUri, { responseType: 'blob' })
                        .success(function(data) {
                            var blob = new Blob([data], {type: 'image/jpeg'});
                            cell.img.src = window.URL.createObjectURL(blob);
                        }).error(function(response) {
                            cell.img.src = scope.placeholder.src;
                        });
                };

                scope.resizeRow = function(row) {

                    // only resize if every cell in the row is complete
                    for (var i=0; i < row.length; i++) {
                        if(!row[i].complete) return;
                    }

                    var imagesWidth = 0;
                    var maxHeight = 0;

                    for (var i=0; i < row.length; i++) {
                        imagesWidth += row[i].img.naturalWidth;
                    }

                    var columns = scope.columns;
                    var totalWidth = element[0].clientWidth - 1;
                    totalWidth -= columns * scope.margin * 2;
                    // fill rows with fewer columns
                    if (row.length < columns) {
                        imagesWidth += (columns - row.length) * (totalWidth / columns)
                    }
                    var scalingFactor = totalWidth / imagesWidth;

                    for (var i=0; i < row.length; i++) {
                        row[i].width = row[i].img.naturalWidth * scalingFactor;
                        if (scalingFactor > 1) {
                            row[i].imgWidth = row[i].img.naturalWidth;
                        } else {
                            row[i].imgWidth = row[i].width;
                        }
                        var height;
                        if (scalingFactor > 1) {
                            height = row[i].img.naturalHeight;
                        } else {
                            height = row[i].img.naturalHeight * scalingFactor;
                        }
                        if (height > maxHeight) maxHeight = height;
                    }

                    for (var i=0; i < row.length; i++) {
                        row[i].height = maxHeight;
                    }

                    row.complete = true;
                    for (var i = 0; i < scope.grid.length; i++) {
                        if (!scope.grid[i].complete) {
                            scope.complete = false;
                            break;
                        } else {
                            scope.complete = true;
                        }
                    }

                };

                angular.element($window).bind('resize', function() {
                    scope.$apply(function() {
                        scope.complete = false;
                        for (var i = 0; i < scope.grid.length; i++) {
                            var row = scope.grid[i];
                            row.complete = false;
                            scope.resizeRow(row);
                        }
                    });
                });

            },

            controller: ['$scope', function($scope) {

                $scope.placeholder = new Image();
                $scope.placeholder.src = 'img/imagePlaceholder.png';
                $scope.complete = false;

                $scope.$watch('cells', function(newCells, oldCells) {

                    if (typeof newCells == 'undefined' || !newCells) return;

                    var columns = $scope.columns;
                    var rows = Math.ceil($scope.cells.length / columns);
                    $scope.grid = new Array(rows);
                    for (var i = 0; i < rows; i++) {
                        $scope.grid[i] = new Array(columns);
                        for (var k = 0; k < columns; k++) {
                            if (i*columns+k >= $scope.cells.length) break;
                            var index = i * columns + k;
                            var cell = $scope.cells[index];
                            $scope.grid[i][k] = cell;
                            cell.row = $scope.grid[i];
                            $scope.grid[i].complete = false;
                            if (typeof cell.imgUri == 'undefined') {
                                cell.imgUri = $scope.placeholder.src;
                            }
                            $scope.loadImage(cell);
                        }
                    }

                });

            }]
        }
    }])

    .directive('arImagegridCell', ['$sce', function($sce) {
        return {
            scope: {
                href: '@', img: '=', cellTitle: '@', cellSubtitle: '@', cellLabel: '@', imgUri: '@',
                cellWidth: '@', imgWidth: '@', cellHeight: '@', cellMargin: '@', hideTitle: '@'
            },
            templateUrl: 'partials/directives/ar-imagegrid-cell.html'
        }
    }])

    .directive('arFacetBrowser', ['Entity', '$location', function(Entity, $location) {
        return {

            scope: { query: '=', facetName: '@', contextSize: '=' },
            templateUrl: 'partials/directives/ar-facet-browser.html',

            link: function(scope, element, attrs) {

                scope.entities = [];
                scope.facetValues = [];
                scope.facetQueries = [];

                Entity.query(scope.query.toFlatObject(), function(data) {
                    scope.contextSize = data.size;
                    if (data.facets) {
                        for (var i = 0; i < data.facets.length; i++) {
                            if (scope.facetName == data.facets[i].name) {
                                scope.facetValues = data.facets[i].values;
                                for (var k = 0; k < scope.facetValues.length; k++) {
                                    scope.facetQueries[k] = scope.query.addFacet(scope.facetName, scope.facetValues[k].value);
                                    // ugly exception for sorting book pages when showing contexts of a book
                                    if (scope.facetValues[k].value == 'Buchseiten' && scope.query.q.lastIndexOf('connectedEntities', 0) === 0) {
                                        scope.facetQueries[k] = scope.facetQueries[k].setParam('sort','subtitle');
                                    }
                                }
                            }
                        }
                    }
                });

                scope.loadEntities = function(facetValueNo) {
                    var facetQuery = scope.facetQueries[facetValueNo];
                    facetQuery.limit = 100;
                    Entity.query(facetQuery.toFlatObject(), function(data) {
                        scope.entities[facetValueNo] = data.entities;
                    });
                };

            }

        }
    }])

    .directive('arActiveFacets', function() {
        return {
            scope: {
                route: '@',
                currentQuery: '='
            },
            templateUrl: 'partials/directives/ar-active-facets.html',
            link: function(scope) {
                scope.facets = scope.currentQuery.facets || [];
            }
        }
    })

    .directive('zoomifyimg', ['arachneSettings', '$http', function(arachneSettings, $http) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs)
            {
                /*
                 * L.TileLayer.Zoomify display Zoomify tiles with Leaflet
                 */
                L.TileLayer.Zoomify = L.TileLayer.extend({

                    options: {
                        continuousWorld: true,
                        tolerance: 0.8
                    },

                    initialize: function (entityId, options) {
                        options = L.setOptions(this, options);
                        this._entityId = entityId;

                        var imageSize = L.point(options.width, options.height),
                            tileSize = options.tileSize;

                        this._imageSize = [imageSize];
                        this._gridSize = [this._getGridSize(imageSize)];

                        while (parseInt(imageSize.x) > tileSize || parseInt(imageSize.y) > tileSize) {
                            imageSize = imageSize.divideBy(2).floor();
                            this._imageSize.push(imageSize);
                            this._gridSize.push(this._getGridSize(imageSize));
                        }

                        this._imageSize.reverse();
                        this._gridSize.reverse();

                        this.options.maxZoom = this._gridSize.length - 1;
                        var southWest = map.unproject([0, options.height], this.options.maxZoom);
                        var northEast = map.unproject([options.width, 0], this.options.maxZoom);
                        map.setMaxBounds(new L.LatLngBounds(southWest, northEast));

                    },

                    onAdd: function (map) {
                        L.TileLayer.prototype.onAdd.call(this, map);
                        var mapSize = map.getSize(),
                            zoom = this._getBestFitZoom(mapSize),
                            imageSize = this._imageSize[zoom],
                            center = map.options.crs.pointToLatLng(L.point(imageSize.x/2, imageSize.y/2), zoom);

                        map.setView(center, zoom, true);
                    },

                    _getGridSize: function (imageSize) {
                        var tileSize = this.options.tileSize;
                        return L.point(Math.ceil(imageSize.x / tileSize), Math.ceil(imageSize.y / tileSize));
                    },

                    _getBestFitZoom: function (mapSize) {
                        var tolerance = this.options.tolerance,
                            zoom = this._imageSize.length - 1,
                            imageSize, zoom;

                        while (zoom) {
                            imageSize = this._imageSize[zoom];
                            if (imageSize.x * tolerance < mapSize.x && imageSize.y * tolerance < mapSize.y) {
                                return zoom;
                            }
                            zoom--;
                        }

                        return zoom;
                    },

                    _tileShouldBeLoaded: function (tilePoint) {
                        var gridSize = this._gridSize[this._map.getZoom()];
                        return (tilePoint.x >= 0 && tilePoint.x < gridSize.x && tilePoint.y >= 0 && tilePoint.y < gridSize.y);
                    },

                    _addTile: function (tilePoint, container) {
                        var tilePos = this._getTilePos(tilePoint),
                            tile = this._getTile(),
                            zoom = this._map.getZoom(),
                            imageSize = this._imageSize[zoom],
                            gridSize = this._gridSize[zoom],
                            tileSize = this.options.tileSize;

                        if (tilePoint.x === gridSize.x - 1) {
                            tile.style.width = imageSize.x - (tileSize * (gridSize.x - 1)) + 'px';
                        }

                        if (tilePoint.y === gridSize.y - 1) {
                            tile.style.height = imageSize.y - (tileSize * (gridSize.y - 1)) + 'px';
                        }

                        L.DomUtil.setPosition(tile, tilePos, L.Browser.chrome || L.Browser.android23);

                        this._tiles[tilePoint.x + ':' + tilePoint.y] = tile;
                        this._loadTile(tile, tilePoint);

                        if (tile.parentNode !== this._tileContainer) {
                            container.appendChild(tile);
                        }
                    },

                    // override to use XHR instead of regular image loading
                    _loadTile: function (tile, tilePoint) {
                        tile._layer  = this;
                        tile.onload  = this._tileOnLoad;
                        tile.onerror = this._tileOnError;

                        this._adjustTilePoint(tilePoint);
                        var imgUri = this.getTileUrl(tilePoint);
                        $http.get(imgUri, { responseType: 'arraybuffer' })
                            .success(function(data) {
                                var blob = new Blob([data], {type: 'image/jpeg'});
                                tile.src = window.URL.createObjectURL(blob);
                            }
                        );

                        this.fire('tileloadstart', {
                            tile: tile,
                            url: tile.src
                        });
                    },

                    getTileUrl: function (tilePoint) {
                        return arachneSettings.dataserviceUri + '/image/zoomify/' + this._entityId + '/' + this._map.getZoom() + '-' + tilePoint.x + '-' + tilePoint.y + '.jpg';
                    },

                    _getTileGroup: function (tilePoint) {
                        var zoom = this._map.getZoom(),
                            num = 0,
                            gridSize;

                        for (var z = 0; z < zoom; z++) {
                            gridSize = this._gridSize[z];
                            num += gridSize.x * gridSize.y;
                        }

                        num += tilePoint.y * this._gridSize[zoom].x + tilePoint.x;
                        return Math.floor(num / 256);
                    }

                });

                L.tileLayer.zoomify = function (entityId, options) {
                    return new L.TileLayer.Zoomify(entityId, options);
                };
                var map = L.map(element[0]).setView([0,0], 0);
                L.tileLayer.zoomify(attrs.entityid, {
                    width: scope.imageProperties.width,
                    height: scope.imageProperties.height,
                    tileSize : scope.imageProperties.tilesize,
                    tolerance: 0.8
                }).addTo(map);

            }
        };
    }])
    .directive('autofillfix', ['$timeout', function ($timeout) {
        return {
            link: function(scope, elem, attrs) {
                // Fixes Chrome bug: https://groups.google.com/forum/#!topic/angular/6NlucSskQjY
                elem.prop('method', 'POST');

                // Fix autofill issues where Angular doesn't know about autofilled inputs
                if(attrs.ngSubmit) {
                    $timeout(function() {

                        elem.unbind('submit').bind('submit', function (e) {
                            e.preventDefault();
                            var arr = elem.find('input');
                            if (arr.length > 0) {
                                arr.triggerHandler('input').triggerHandler('change').triggerHandler('keydown');
                                scope.$apply(attrs.ngSubmit);
                            }
                        });
                    }, 0);
                }
            }
        };
    }]
)
    .directive('focusMe', function ($timeout) {
        return {
            link: function (scope, element, attrs, model) {
                $timeout(function () {
                    element[0].focus();
                });
            }
        };
    })
    .directive('convertToBool', function() {
        return {
            require: 'ngModel',
            link: function(scope, element, attrs, ngModel) {
                ngModel.$parsers.push(function(val) {
                    return val === 'true';
                });
                ngModel.$formatters.push(function(val) {
                    return '' + val;
                });
            }
        };
    })
    .directive('hideFooter', ['$rootScope', function($rootScope) {
        return {
            restrict: 'A',
            controller: function() {
                $rootScope.hideFooter = true;
            }
        }
    }]);

