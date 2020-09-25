<template>
  <section>
    <h3>{{ ressource.meta.label }}</h3>
    <div class="form-group">
      <label>Type d'activité</label>
      <select
        class="form-control"
        v-model="ressource.extra.tns_autres_revenus_type_activite"
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
      <label>Bénéfice sur le dernier exercice clos</label>
      <input
        type="number"
        class="form-control"
        v-select-on-click
        v-model="ressource.amounts[$store.state.dates.lastYear.id]"
      />
    </div>
  </section>
</template>

<script>
export default {
  name: "RessourceProfessionLiberale",
  props: {
    ressource: Object,
  },
};
</script>

<style scoped lang="css">
</style>
