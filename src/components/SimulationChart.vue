<template>
  <bar-chart :chart-data="data" :options="chartOptions"></bar-chart>
</template>
<script>
import BarChart from "./Charts/Bar";

export default {
  name: "Simulationchart",
  props: {
    data: Object,
  },
  components: {
    BarChart,
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
