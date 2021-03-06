'use strict';

angular.module('arachne.controllers')

/**
 * Handles the layout for viewing available catalogs.
 *
 * @author: Sebastian Cuy, Oliver Bensch, Thomas Kleinke
 */
    .controller('CatalogsController',['$scope', '$uibModal', 'authService', 'Entity', 'Catalog', 'CatalogEntry', '$http', 'arachneSettings', 'message',
        function ($scope, $uibModal, authService, Entity, Catalog, CatalogEntry, $http, arachneSettings, message) {

            $scope.refreshCatalogs = function(){
                $scope.loading++;
                Catalog.query({}, function(result) {
                    $scope.loading--;
                    $scope.catalogs = result;
                });
            };

            $scope.createCatalog = function() {

                var catalogBuffer = { author: $scope.user.username };

                if ($scope.user.firstname && $scope.user.lastname) {
                    catalogBuffer.author = $scope.user.firstname + " " + $scope.user.lastname;
                }

                var editCatalogModal = $uibModal.open({
                    templateUrl: 'app/catalog/edit-catalog.html',
                    controller: 'EditCatalogController',
                    resolve: { catalog: function() { return catalogBuffer }, edit: false }
                });
                
                editCatalogModal.close = function(newCatalog) {

                    newCatalog.public = false;
                    Catalog.save({}, newCatalog, function(result) {
                        $scope.catalogs.push(result);
                        $scope.activeCatalog = result;
                        editCatalogModal.dismiss();
                    }, function() {
                        message.addMessageForCode('default');
                    });
                };

            };

            $scope.user = authService.getUser();
            if ($scope.user === undefined) {
                return false;
            }

            $scope.catalogs = [];
            $scope.entryMap = {};

            $http.get(arachneSettings.dataserviceUri + '/userinfo/' + $scope.user.username).success(function(user) {
                $scope.user = user;
            });

            $scope.loading = 0;

            $scope.refreshCatalogs();

        }
    ]);