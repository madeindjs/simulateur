<template>
  <table class="table">
    <tr>
      <th>Salaire mensuel<br/><span class="text-muted">(€ / mois)</span></th>
      <th>Revenu disponible<br/><span class="text-muted">(€ / mois)</span></th>
      <th>Aides<br/><span class="text-muted">(€ / mois)</span></th>
      <th>Somme<br/><span class="text-muted">(€ / mois)</span></th>
      <th>Détails des aides</th>
    </tr>
    <tr v-for="(row, index) in data" :key="index">
      <td>{{ row.salaireNet }}</td>
      <td>{{ row.revenuDisponible }}</td>
      <td>
        {{ row.aides }}
      </td>
      <td>{{ row.revenuDisponible + row.aides }}</td>
      <td>
        <ul class="mb-0 list-unstyled">
          <li v-for="(aide, indexAide) in row.aidesList" :key="indexAide">
            <a :href="aide.link" :title="aide.description" target="bl">{{ aide.label }}</a
            >: {{ aide.montant }} €
          </li>
        </ul>
      </td>
    </tr>
  </table>
</template>
<script>
export default {
  name: "SimulationTable",
  props: {
    data: Array,
  },
};
</script>
