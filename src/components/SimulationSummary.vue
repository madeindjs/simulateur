<template>
  <div>
    <p>
      Nous avons réalisé {{ data.length }} simulations autour de votre salaires.
      Cela donne donc des résultats pour un salaire mensuel net allant de
      <strong>{{ lowestSimulation.salaireNet }}€ / mois</strong> à
      <strong>{{ biggestSimulation.salaireNet }}€ / mois</strong>.
    </p>

    <p v-if="firstSimulationWithoutAides">
      A partir de
      <strong>{{ firstSimulationWithoutAides.salaireNet }}€ / mois</strong>,
      vous ne touchez plus aucune aides.
    </p>

    <div v-if="looseSteps.length > 0">
      <p>
        Les paliers suivants ne sont pas intéressants puisqu'il feront baisser
        votre niveau de vie :
      </p>
      <ul>
        <li v-for="(step, index) in looseSteps" :key="index">
          {{ step.previous.salaireNet }} à {{ step.next.salaireNet }} € / mois: "perte" de <strong>{{computeLoose(step)}} € /mois</strong>
        </li>
      </ul>
    </div>

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
          <span v-if="row.aidesList.length == 0" class="text-muted">aucune</span>
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
  methods: {
    computeLoose({previous, next}) {
      const previousSum = previous.revenuDisponible + previous.aides;
      const nextSum = next.revenuDisponible + next.aides;

      return previousSum - nextSum;
    }
  },
  computed: {
    lowestSimulation() {
      if (this.data.length === 0) {
        return null;
      }
      return this.data[0];
    },
    biggestSimulation() {
      if (this.data.length === 0) {
        return null;
      }
      return this.data[this.data.length - 1];
    },
    firstSimulationWithoutAides() {
      for (const simulation of this.data) {
        if (!simulation.aides) {
          return simulation;
        }
      }

      return null;
    },
    /**
     * Array of simulation who
     */
    looseSteps() {
      let previousSum = 0;
      let previousSimulation = null;
      let steps = [];

      for (const simulation of this.data) {
        const currentSum = simulation.aides + simulation.revenuDisponible;

        if (currentSum < previousSum) {
          simulation.loose = previousSum - currentSum;
          steps.push({ next: simulation, previous: previousSimulation });
        }
        previousSum = currentSum;
        previousSimulation = simulation;
      }
      return steps;
    },
  },
};
</script>
