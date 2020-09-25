<template>
  <section>
    <h3>{{ ressource.meta.label }}</h3>
    <div class="form-group">
      <label>Type d'activité</label>
      <select
        v-model="ressource.extra.tns_micro_entreprise_type_activite"
        class="form-control"
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
      <label
        >Chiffre d’affaires {{ $store.state.dates.lastYear.label }}</label
      >
      <input
        class="form-control"
        type="number"
        v-select-on-click
        v-model="ressource.amounts[$store.state.dates.lastYear.id]"
      />
    </div>
  </section>
</template>

<script>
export default {
  name: "RessourceMicroEntreprise",
  props: {
    ressource: Object,
  },
};
</script>

<style scoped lang="css">
</style>
