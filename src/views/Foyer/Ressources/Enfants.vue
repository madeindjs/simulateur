<template>
  <form @submit.prevent="next">
    <YesNoQuestion class="form-group" v-model="enfant.hasRessources" v-for="enfant in enfants" v-bind:key="enfant.id">
        {{ enfant.firstName | capitalize }} a-t-il·elle perçu des ressources <strong>depuis {{ $store.state.dates.twelveMonthsAgo.label }}</strong> ?
    </YesNoQuestion>
    <div class="text-right mt-5 pt-2 border-top">
      <button type="submit" class="btn btn-lg btn-primary">Valider</button>
    </div>
  </form>
</template>

<script>
import Ressource from '@/lib/Ressource'
import YesNoQuestion from '@/components/YesNoQuestion'

export default {
  name: 'ressources-types',
  components: {
    YesNoQuestion,
  },
  data: function() {
    let enfants = this.$store.state.situation.enfants.map(e => Object.assign({}, e))

    enfants.forEach(e => e.hasRessources = e.hasRessources || false)
    return {
      enfants,
    }
  },
  methods: {
    next: function() {
      this.enfants.forEach(enfant => {
        if (! enfant.hasRessources) {
            let ressourceTypes = Ressource.getIndividuRessourceTypes(enfant)
            Object.keys(ressourceTypes).forEach(t => ressourceTypes[t] = false)
            Ressource.setIndividuRessourceTypes(enfant, ressourceTypes, this.$store.state.dates)
        }
        this.$store.dispatch('updateIndividu', enfant)
      })
      this.$push(this.$store.state.situation)
    }
  }
}
</script>
