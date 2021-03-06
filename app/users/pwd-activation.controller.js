'use strict';

angular.module('arachne.controllers')

/**
 * Set new password.
 *
 * @author: Daniel M. de Oliveira
 */
    .controller('PwdActivationController',
        ['$scope', '$stateParams', '$filter', '$location', 'PasswordActivation', 'message',
            function ($scope, $stateParams, $filter, $location, PasswordActivation, message) {

                /**
                 * Copy the user so that the shown passwords
                 * of user object in $scope do not get modified
                 *
                 * @param user
                 */
                var copyUser = function (user) {

                    var newUser = JSON.parse(JSON.stringify(user));

                    if (user.password)
                        newUser.password = $filter('md5')(user.password);
                    if (user.passwordConfirm)
                        newUser.passwordConfirm = $filter('md5')(user.passwordConfirm);

                    return newUser;
                };

                var handleActivationSuccess = function () {

                    message.dontClearOnNextLocationChange();
                    message.addMessageForCode('ui.passwordactivation.success', 'success');
                    $location.path("/");
                };

                var handleActivationError = function (data) {
                    console.log(data);
                    message.addMessageForCode('default', 'danger');
                };

                $scope.submit = function () {
                    PasswordActivation.save({token: $stateParams.token},
                        copyUser($scope.user),
                        handleActivationSuccess,
                        handleActivationError
                    );
                }
            }]);
