'use strict';

angular.module('ddsApp').controller('FoyerRecapRessourcesCtrl', function($scope, SituationService) {
    $scope.months = SituationService.getMonths();

    $scope.initRessources = function() {
        $scope.tempRessources = {};
        $scope.hasRessources = false;
        $scope.globalAmount = 0;
        $scope.fillIndividuRessources($scope.situation.demandeur, 'Vous');
        if ($scope.situation.conjoint) {
            $scope.fillIndividuRessources($scope.situation.conjoint, 'Votre conjoint');
        }
        $scope.situation.enfants.map($scope.fillIndividuRessources);
        $scope.situation.personnesACharge.map($scope.fillIndividuRessources);

        if ($scope.globalAmount > 0) {
            $scope.hasRessources = true;
        }

        $scope.ressources = [];
        SituationService.revenusSections.forEach(function(section) {
            section.subsections.forEach(function(subsection) {
                if ($scope.tempRessources[subsection.name]) {
                    $scope.ressources.push({
                        type: subsection.label,
                        category: section.name,
                        total: $scope.tempRessources[subsection.name].total,
                        byIndividu: $scope.tempRessources[subsection.name].byIndividu
                    });
                }
            });
        });
    };

    $scope.fillIndividuRessources = function(individu, label) {
        if (!label) {
            label = individu.firstName;
        }

        _.forEach(individu.ressources, function(ressource, subsectionName) {
            if (!$scope.tempRessources[subsectionName]) {
                $scope.tempRessources[subsectionName] = {
                    total: [0, 0, 0],
                    byIndividu: []
                };
            }
            var ressources = _.values(ressource);
            $scope.tempRessources[subsectionName].byIndividu.push({
                name: label,
                ressources: ressources
            });
            _.forEach(ressources, function(amount, i) {
                $scope.tempRessources[subsectionName].total[i] += amount;
                $scope.globalAmount += amount;
            });
        });
    };

    if ($scope.situation.revenusCaptured) {
        $scope.initRessources();
    }

    $scope.$on('ressourcesCaptured', $scope.initRessources);
});