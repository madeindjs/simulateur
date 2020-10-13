<template>
  <bar-chart :chart-data="chartData" :options="chartOptions"></bar-chart>
</template>
<script>
import BarChart from "./Charts/Bar";

export default {
  name: "Simulationchart",
  props: {
    data: Array,
  },
  components: {
    BarChart,
  },
  computed: {
    chartData() {
      const labels = [];
      const diffDataset = {
        label: "difference",
        backgroundColor: "green",
        data: [],
      };

      let previousSum = null;

      for (const summary of this.data) {
        const actualSum = summary.revenuDisponible + summary.aides;

        if (previousSum !== null) {
          diffDataset.data.push(actualSum - previousSum);
          labels.push(summary.salaireNet);
        }

        previousSum = actualSum;
      }

      return {
        labels,
        datasets: [diffDataset],
      };
    },
  },
  data: function () {
    return {
      chartOptions: {
        // height: '400px',
        // position: 'relative',
        // responsive: false,
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            {
              stacked: true,
            },
          ],
          yAxes: [
            {
              stacked: true,
            },
          ],
        },
      },
    };
  },
};
</script>
