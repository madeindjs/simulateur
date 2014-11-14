'use strict';

angular.module('ddsApp').controller('RecapSituationCtrl', function($scope, $state, $filter, nationalites, ressourceTypes, logementTypes, locationTypes, SituationService, IndividuService) {
    var situation = $scope.situation;

    var buildRecapLogement = function() {
        var logementLabel = _.find(logementTypes, { id: situation.logement.type }).label;
        logementLabel = $filter('uppercaseFirst')(logementLabel);
        $scope.recapLogement = '<b>' + logementLabel + '</b>';
        if ('locataire' === situation.logement.type) {
            $scope.recapLogement += ' d’un logement <b>';
            $scope.recapLogement += _.find(locationTypes, { id: situation.logement.locationType }).label;
            $scope.recapLogement += '</b>';
            $scope.loyerLabel = 'Loyer';
        } else {
            $scope.loyerLabel = 'Mensualité d’emprunt';
        }
    };

    if (situation.logement) {
        buildRecapLogement();
    }

    $scope.$on('buildRecapLogement', function() {
        buildRecapLogement();
    });

    var buildRecapPatrimoine = function() {
        $scope.patrimoine = [];
        [
            {
                id: 'valeurLocativeImmoNonLoue',
                label: 'Valeur locative immobilier non loué'
            },
            {
                id: 'valeurLocativeTerrainNonLoue',
                label: 'Valeur locative terrains non loués'
            },
            {
                id: 'epargneSurLivret',
                label: 'Epargne sur livret'
            },
            {
                id: 'epargneSansRevenus',
                label: 'Epargne sans revenus'
            }
        ].forEach(function(field) {
            if (situation.patrimoine[field.id]) {
                $scope.patrimoine.push({label: field.label, montant: situation.patrimoine[field.id]});
            }
        });

        $scope.revenusDuPatrimoine = [];
        [
            {
                id: 'revenusDuCapital',
                label: 'Revenus du capital'
            },
            {
                id: 'revenusLocatifs',
                label: 'Revenus locatifs'
            }
        ].forEach(function(field) {
            var revenus = situation.patrimoine[field.id];
            if (revenus.length) {
                var value = {label: field.label, values: []};
                $scope.revenusDuPatrimoine.push(value);
                for (var i = 0; i < 3; i++) {
                    var ressource = revenus[i];
                    value.values.push({periode: moment(ressource.periode, 'YYYY-MM').format('MMMM YYYY'), montant: ressource.montant});
                }
                var montants = _.pluck(revenus, 'montant');
                var montantAnnuel = _.reduce(montants, function(sum, montant) {
                    return sum + montant;
                });
                value.values.push({periode: 'Année glissante', montant: montantAnnuel});
            }
        });
    };

    if (situation.patrimoine) {
        buildRecapPatrimoine();
    }

    $scope.$on('buildRecapPatrimoine', function() {
        buildRecapPatrimoine();
    });

    $scope.months = SituationService.getMonths();

    $scope.lastMonth = moment().subtract('months', 1).startOf('month').format('MMMM YYYY');
    $scope.lastYear = moment().subtract('years', 1).format('MMMM YYYY');
    $scope.yearMoinsUn = moment().subtract('years', 1).format('YYYY');

    var fillIndividuRessources = function(individu) {
        var monthsIndexes = {};

        monthsIndexes[$scope.months[0].id] = 0;
        monthsIndexes[$scope.months[1].id] = 1;
        monthsIndexes[$scope.months[2].id] = 2;

        individu.ressources.forEach(function(ressource) {
            var ressourceSection = $scope.tempRessources[ressource.type];
            if (!ressourceSection) {
                ressourceSection = $scope.tempRessources[ressource.type] = {
                    total: [0, 0, 0],
                    byIndividu: [],
                    totalAnnuel: 0
                };
            }

            var individuRessource = _.find($scope.tempRessources[ressource.type].byIndividu, { label: IndividuService.label(individu) });
            if (!individuRessource) {
                individuRessource = {
                    label: IndividuService.label(individu),
                    values: []
                };
                $scope.tempRessources[ressource.type].byIndividu.push(individuRessource);
            }

            if (!ressource.periode) {
                individuRessource.montantAnnuel = ressource.montant;
                $scope.tempRessources[ressource.type].totalAnnuel += ressource.montant;
            } else {
                var monthIndex = monthsIndexes[ressource.periode];
                individuRessource.values[monthIndex] = ressource.montant;
                $scope.tempRessources[ressource.type].total[monthIndex] += ressource.montant;
            }
            $scope.globalAmount += ressource.montant;
        });
    };

    var buildRecapRessources = function() {
        $scope.tempRessources = {};
        $scope.hasRessources = false;
        $scope.hasRessourcesTns = false;
        $scope.hasRessourcesNonTns = false;
        $scope.globalAmount = 0;

        $scope.isSituationMonoIndividu = 1 === situation.individus.length;
        situation.individus.map(fillIndividuRessources);

        if ($scope.globalAmount > 0) {
            $scope.hasRessources = true;
        }

        $scope.ressourcesMicroFiscal = [];
        $scope.ressourcesAutresTns = [];
        $scope.ressourcesNonTns = [];
        ressourceTypes.forEach(function(ressourceType) {
            if ($scope.tempRessources[ressourceType.id]) {
                $scope.ressourcesNonTns.push({
                    type: ressourceType,
                    total: $scope.tempRessources[ressourceType.id].total,
                    totalAnnuel: $scope.tempRessources[ressourceType.id].totalAnnuel
                });
            }
        });

        var ressourcesMicroFiscal = {
            type: _.find(ressourceTypes, {id: 'caMicroEntreprise'}),
            totalAnnuel: 0,
            byIndividu: []
        };
        var ressourcesAutresTns = {
            type: _.find(ressourceTypes, {id: 'autresRevenusTns'}),
            totalAnnuel: 0,
            byIndividu: []
        };
        situation.individus.map(function(individu) {
            if (individu.caMicroEntreprise) {
                ressourcesMicroFiscal.totalAnnuel += individu.caMicroEntreprise;
                ressourcesMicroFiscal.byIndividu.push({
                    label: IndividuService.label(individu),
                    montantAnnuel: individu.caMicroEntreprise
                });
            }
            if (individu.autresRevenusTns) {
                ressourcesAutresTns.totalAnnuel  += individu.autresRevenusTns;
                ressourcesAutresTns.byIndividu.push({
                    label: IndividuService.label(individu),
                    montantAnnuel: individu.autresRevenusTns
                });
            }
        });

        if (ressourcesMicroFiscal.totalAnnuel) {
            $scope.ressourcesMicroFiscal.push(ressourcesMicroFiscal);
        }

        if (ressourcesAutresTns.totalAnnuel) {
            $scope.ressourcesAutresTns.push(ressourcesAutresTns);
        }
    };

    $scope.ressourcesCaptured = situation.individus.length > 0 && !!situation.individus[0].ressources;
    if ($scope.ressourcesCaptured) {
        buildRecapRessources();
    }

    $scope.$on('buildRecapRessources', function() {
        buildRecapRessources();
    });
});