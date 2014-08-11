'use strict';

angular.module('ddsApp').controller('FormInfosComplementairesIndividusCtrl', function($scope, $state, SituationService) {
    var situation = $scope.situation = SituationService.restoreLocal();

    function initPaysNaissance(individu) {
      individu.choicePaysNaissance = 'france';
      individu.paysNaissance = 'France';
    }

    initPaysNaissance(situation.demandeur);
    situation.demandeur.civilite = 'h';
    if (situation.conjoint) {
        situation.conjoint.civilite = 'f';
        initPaysNaissance(situation.conjoint);
    }

    $scope.individus = situation.enfants.concat(situation.personnesACharge);
    $scope.individus.forEach(function(individu) {
        individu.civilite = 'h';
        initPaysNaissance(individu);
    });

    $scope.choicePaysNaissance = function(individu) {
        if ('autre' === individu.choicePaysNaissance) {
            individu.paysNaissance = '';
            individu.villeNaissance = null;
            individu.departementNaissance = null;
        } else {
            individu.paysNaissance = 'France';
        }
    };

    $scope.submit = function() {
        $state.go('form_infos_complementaires_address_contact');
    };
});
