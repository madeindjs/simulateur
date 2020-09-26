<template>
  <div>
      <p>
        Nous avons réalisé {{ data.length }} simulations autour de
        votre salaires. Cela donne donc des résultats pour un salaire mensuel
        net allant de <strong>{{ lowestSimulation.salaireNet }}€ / mois</strong> à
        <strong
          >{{ biggestSimulation.salaireNet }}€ / mois</strong
        >.
      </p>




    <table v-if="false" class="table">
      <tr>
        <th>Salaire mensuel <span class="text-muted">(€ / mois)</span></th>
        <th>Revenu disponible <span class="text-muted">(€ / mois)</span></th>
        <th>Aides <span class="text-muted">(€ / mois)</span></th>
        <th>Détails des aides</th>
      </tr>
      <tr v-for="(row, index) in data" :key="index">
        <td>{{ row.salaireNet }}</td>
        <td>{{ row.revenuDisponible }}</td>
        <td>
          {{ row.aides }}
        </td>
        <td>
          <ul class="mb-0 list-unstyled">
            <li v-for="(aide, indexAide) in row.aidesList" :key="indexAide">
              <a :href="aide.link" :title="aide.description">{{ aide.label }}</a
              >: {{ aide.montant }} €
            </li>
          </ul>
        </td>
      </tr>
    </table>
  </div>
</template>
<script>
export default {
  name: "SimulationSummary",
  props: {
    data: Array,
  },
  computed: {
      lowestSimulation() {
          if (this.data.length === 0) {
              return null;
          }
          return this.data[0]
      },
      biggestSimulation() {
          if (this.data.length === 0) {
              return null;
          }
          return this.data[this.data.length - 1]
      }
  }
};
</script>