'use strict';

angular.module('arachne.widgets.map')

/**
 * @author: Sebastian Cuy
 * @author: Jan G. Wieners
 */
    .directive('con10tMapOverlays', ['mapService', function (mapService) {
        return {
            restrict: 'A',
            scope: {
                overlays: '=?',
                baselayers: '='
            },
            // menu elements may appear in the transcluded html
            transclude: true,
            templateUrl: 'app/map/con10t-map-overlays.html',
            link: function (scope) {

                mapService.setOverlays(scope.overlays);
                mapService.activateOverlays(cq.getArrayParam('overlays')); // TODO this is undefined
            }
        };
    }]);