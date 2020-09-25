<template>
  <section>
    <h3>{{ ressource.meta.label }}</h3>
    <div class="form-group">
      <label>Type d'activité</label>
      <select
        v-model="ressource.extra.tns_auto_entrepreneur_type_activite"
        class="form-group"
      >
        <option value="achat_revente">
          Achat/revente ou fourniture de logement
        </option>
        <option value="bic">Autre activité relevant des BIC</option>
        <option value="bnc">
          Activité libérale et/ou intellectuelle (BNC)
        </option>
      </select>
    </div>

    <div class="form-group">
      <label>
        Chiffre d’affaires {{ $store.state.dates.lastYear.label }}
      </label>
      <input
        type="number"
        class="form-group"
        v-select-on-click
        v-model="ressource.amounts[$store.state.dates.lastYear.id]"
      />
    </div>

    <div class="form-group">
      <label>
        Chiffre d'affaires pour
        {{ $store.state.dates.thisMonth.label | capitalize }}
      </label>
      <input
        type="number"
        class="form-group"
        v-select-on-click
        v-model="ressource.amounts[$store.state.dates.thisMonth.id]"
      />
    </div>
    <div class="form-group">
      <label
        v-for="month in $store.state.dates.last3Months"
        v-bind:key="month.id"
      >
        Chiffre d'affaires pour {{ month.label | capitalize }}
      </label>
      <input
        type="number"
        class="form-group"
        v-select-on-click
        v-model="ressource.amounts[month.id]"
      />
    </div>
  </section>
</template>

<script>
export default {
  name: "RessourceAutoEntreprise",
  props: {
    ressource: Object,
  },
};
</script>

<style scoped lang="css">
</style>
