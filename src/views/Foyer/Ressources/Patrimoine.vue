<template>
  <form @submit.prevent="next">
    <h2>
      <i class="fa fa-home" aria-hidden="true"></i>
      Immobilier
    </h2>

    <YesNoQuestion class="form-group" v-model="hasTerrainsNonLoues">
      Avez-vous des terrains <b>non loués</b> ?
    </YesNoQuestion>

    <div class="form-group" v-if="hasTerrainsNonLoues">
      <label>
        Valeur <b>patrimoniale</b> totale de vos terrains <b>non loués</b>
        <input type="number" v-select-on-click v-model.number="demandeur.valeur_terrains_non_loues[periodKey]" />
      </label>

      <label>
        Valeur <b>locative</b> totale de vos terrains <b>non loués</b>
        <input type="number" v-select-on-click v-model.number="demandeur.valeur_locative_terrains_non_loues[periodKey]" />
      </label>
      <p>
        Pour la trouver, consultez votre avis d'imposition de taxe d'habitation ou de taxe foncière.
      </p>
    </div>

    <YesNoQuestion class="form-group" v-model="hasBatisNonLoues">
      Avez-vous des appartements/immeubles <b>non loués</b> ?
      <template v-slot:help>
        Sauf résidence principale et bâtiments de l'exploitation agricole.
      </template>
    </YesNoQuestion>

    <div class="form-group" v-if="hasBatisNonLoues">
      <label>
        Valeur <b>patrimoniale</b> de vos appartements/immeubles <b>non loués</b>
        <input type="number" v-select-on-click v-model.number="demandeur.valeur_immo_non_loue[periodKey]" />
      </label>

      <label>
        Valeur <b>locative</b> totale de vos appartements/immeubles <b>non loués</b>
        <input type="number" v-select-on-click v-model.number="demandeur.valeur_locative_immo_non_loue[periodKey]" />
      </label>
      <p>
        Pour la trouver, consultez votre avis d'imposition de taxe d'habitation ou de taxe foncière.
      </p>
    </div>

    <label v-if="hasBiensLoues" class="form-group">Valeur <b>patrimoniale</b> de vos bien <b> loués</b>
      <input type="number" v-select-on-click v-model.number="demandeur.valeur_patrimoine_loue[periodKey]" />
    </label>

    <h2>
      <i class="fa fa-money" aria-hidden="true"></i>
      Épargne
    </h2>

    <label>
      Livret A <span class="help-block">Aussi appelé Livret bleu.</span>
      <input type="number" v-select-on-click v-model.number="demandeur.livret_a[periodKey]" />
    </label>

    <label>
      Total des autres produits d'épargne produisant des revenus <b>non imposables</b>
      <input type="number" v-select-on-click v-model.number="demandeur.epargne_revenus_non_imposables[periodKey]" />
      <span>
        Assurance vie,
        <abbr title="Compte d'épargne-logement">CEL</abbr>,
        <abbr title="Livret de développement durable">LDD</abbr>,
        <abbr title="Livret d'épargne populaire">LEP</abbr>,
        Livret jeune,
        <abbr title="Plan d'épargne en actions">PEA</abbr>,
        plan d'épargne d'entreprise,
        <abbr title="Plan d'épargne logement">PEL</abbr>,
        <abbr title="Plan d'épargne populaire">PEP</abbr>.
      </span>
    </label>

    <label>
      Total de l'épargne produisant des revenus <b>imposables</b>
      <input type="number" v-select-on-click v-model.number="demandeur.epargne_revenus_imposables[periodKey]" />
      <span>
        Actions,
        comptes à terme,
        <abbr title="Fonds communs de placement">FCP</abbr>,
        obligations,
        parts sociales,
        <abbr title="Société d'Investissement à CApital Variable">SICAV</abbr>,
        etc.
      </span>
    </label>

    <div class="text-right mt-5 pt-2 border-top">
      <button type="submit" class="btn btn-lg btn-primary">Valider</button>
    </div>
  </form>
</template>

<script>
import _ from 'lodash'
import { patrimoineTypes } from '@/constants/resources'
import YesNoQuestion from '@/components/YesNoQuestion'

export default {
  name: 'ressources-patrimoine',
  components: {
    YesNoQuestion,
  },
  data: function() {
    const situation = this.$store.state.situation
    let periodKey = 'month:2012-01:120'
    let demandeur = Object.assign({}, situation.demandeur)
    let individus = this.$store.getters.peopleParentsFirst

    let patrimoineProperties = _.map(patrimoineTypes, 'id')
    patrimoineProperties.forEach(function(patrimoinePropertyName) {
        demandeur[patrimoinePropertyName] = Object.assign({}, demandeur[patrimoinePropertyName])
        demandeur[patrimoinePropertyName][periodKey] = demandeur[patrimoinePropertyName][periodKey] || 0
    })

    let mapping = {
        hasTerrainsNonLoues: {
            sources: ['valeur_terrains_non_loues', 'valeur_locative_terrains_non_loues'],
        },
        hasBatisNonLoues: {
            sources: ['valeur_immo_non_loue', 'valeur_locative_immo_non_loue'],
        },
    }

    let locals = {
        hasBiensLoues: _.some(individus, individu => individu.revenus_locatifs),
        hasEpargneAuxRevenusImposables: _.some(individus, individu => individu.revenus_capital),
    }

    let localKeys = Object.keys(mapping)
    localKeys.forEach(function(keyName) {
        locals[keyName] = false
        mapping[keyName].sources.forEach(function(attributeName) {
            locals[keyName] = Boolean(locals[keyName] || demandeur[attributeName][periodKey])
        })
    })

    return {
      demandeur,
      hasTerrainsNonLoues: true,
      ...locals,
      periodKey,
    }
  },
  methods: {
    next: function() {
      this.$store.dispatch('updateIndividu', this.demandeur)

      this.$push()
    },
  }
}
</script>
