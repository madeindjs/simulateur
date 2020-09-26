<template>
  <div id="homepage">
    <section class="my-5 text-center">
      <div class="wordslider mb-4">
        <p>Est-ce que ça vaut le coup de</p>
        <textra :data="words" :timer="3" filter="flip" :infinite="true" />
      </div>
      <SimulationChart :data="chartdata"></SimulationChart>
    </section>
    <section class="text-center lead my-3">
      <h1 class="d-none">
        Evaluez votre pouvoir d'achat si vos revenus changent.
      </h1>

      <div class="btn-group">
        <a class="btn btn-primary btn-lg" v-on:click="newSituation()">{{
          ctaLabel
        }}</a>
        <a
          class="btn btn-secondary btn-lg"
          v-on:click="next()"
          v-if="hasExistingSituation"
          >Reprendre la simulation</a
        >
      </div>
    </section>
    <hr class="my-5" />
    <section class="lead">
      <p>
        $PROJECT_NAME va effectuer des <strong>simulations</strong> en faisant
        évoluer vos revenus et ainsi calculer vos aides.
      </p>
    </section>
    <hr class="my-5" />
    <section class="my-5">
      <h2>Comment ça fonctionne ?</h2>
      <ol class="lead">
        <li>Vous remplissez le formulaire</li>
        <li>
          Nous effectuons plusieurs simulations auprès du
          <a href="https://www.data.gouv.fr/fr/organizations/openfisca/"
            >moteur de calcul des impôts</a
          >
          proposé par l'état
        </li>
        <li>Nous construisons un rapport personalisé</li>
      </ol>
    </section>
    <hr class="my-5" />
    <section class="my-5">
      <h2>Question / réponses</h2>

      <p class="lead">Comment être sûr que le calcul est correct ?</p>
      <p>Cette application s'appuie sur le travail de</p>
      <ul>
        <li>
          <a href="https://fr.openfisca.org/legislation">Openfisca</a>, un
          moteur de calcul libre et ouvert utilisé par des chercheurs en
          économie et d’autres services publics.
        </li>
        <li>
          <a href="https://mes-aides.ord">mes-aides.org</a>, une ancienne
          <a
            href="un moteur de calcul libre et ouvert utilisé par des chercheurs en économie et d’autres services publics."
          >
            startup d’État de l’Incubateur de services numériques
          </a>
        </li>
      </ul>
      <p class="lead">Quelles sont les aides prisent en compte ?</p>
      <p>
        Ce simulateur s'appuie sur
        <router-link to="/toutes">
          {{ prestationsNationalesCount }} aides nationales et
          {{ partenairesLocauxCount }} aides locales. </router-link
        >. La liste est en constante évolution gràce au projet
        <a href="https://mes-aides.ord">mes-aides.org</a>. Vous pouvez
        d'ailleurs
        <a href="https://mes-aides.org/ameliorer">contribuer au projet</a>.
      </p>
      <p class="lead">Qu'en est'il de la sécurité des données ?</p>
      <p>
        Notre formulaie ne requiert aucune information personnelle permettant de
        relier votre situation à votre iddentité.
      </p>
      <p>Aucun tracker n'est présent sur le site. Pas même Google Analytics.</p>
      <p>
        Notre formulaie ne requiert aucune information personnelle permettant de
        relier votre situation à votre iddentité. Ainsi, aucun nom, prénom aĝe
        ne vous est demandé.
      </p>
      <p>
        Le code de cette application est aussi ouvert et
        <a href="https://github.com/madeindjs/simulateur"
          >consultable sur Github</a
        >. Le code est sous
        <a href="https://www.gnu.org/licenses/agpl-3.0.html">license libre</a>
        ce qui signifie que vous pouvez l'éditer, le modifier et même le
        redistribuer.
      </p>
      <p class="lead">Combien ça coute ?</p>
      <p>TODO</p>
    </section>
  </div>
</template>

<script>
import Institution from "../lib/Institution";
import _ from "lodash";
import SimulationChart from "@/components/SimulationChart";

const labels = [
  900,
  1000,
  1100,
  1200,
  1300,
  1400,
  1500,
  1600,
  1700,
  1800,
  1900,
  2000,
];

const chartdataSample = {
  labels,
  datasets: [
    {
      label: "Revenu disponible",
      backgroundColor: "green",
      data: [777, 824, 871, 918, 957, 996, 1034, 1073, 1112, 1150, 1197, 1246],
    },
    {
      label: "aides",
      backgroundColor: "orange",
      data: [332, 274, 251, 236, 206, 166, 126, 86, 46, 0, 0, 0],
    },
  ],
  barPercentage: 1,
};

export default {
  name: "home",
  components: {
    SimulationChart,
  },
  data: () => {
    let value = {
      words: [
        "faire du freelance à côté.",
        "faire 10 heures supplémentaire.",
        "donner des cours de piano.",
        "me mettre à mis-temps.",
      ],
      chartdata: chartdataSample,
    };
    const types = ["prestationsNationales", "partenairesLocaux"];
    types.forEach(function (type) {
      let providersWithoutPrivatePrestations = _.mapValues(
        Institution[type],
        function (provider) {
          provider = _.assign({}, provider);
          provider.prestations = _.reduce(
            provider.prestations,
            function (prestations, prestation, name) {
              if (!prestation.private) {
                prestations[name] = prestation;
              }

              return prestations;
            },
            {}
          );
          return provider;
        }
      );

      value[type] = _.filter(providersWithoutPrivatePrestations, function (
        provider
      ) {
        return _.size(provider.prestations);
      });
      value[type + "Count"] = Object.keys(value[type]).reduce(function (
        total,
        provider
      ) {
        return total + _.size(value[type][provider].prestations);
      },
      0);
    });

    return value;
  },
  computed: {
    hasExistingSituation: function () {
      return this.$store.getters.passSanityCheck;
    },
    ctaLabel: function () {
      return this.hasExistingSituation
        ? "Commencer une nouvelle simulation"
        : "Évaluer mes droits";
    },
    ctaSize: function () {
      return this.hasExistingSituation ? "large" : "xlarge";
    },
  },
  methods: {
    changeDataset: function () {
      const chartdata = { ...chartdataSample };

      for (let i = 0; i < chartdata.datasets.length; i++) {
        const offset = Math.random() * 300 - 150;
        chartdata.datasets[i].data = chartdata.datasets[i].data
          .map((d) => d + offset)
          .map((d) => (d > 0 ? d : 0));
      }

      this.chartdata = chartdata;
    },
    getRandomInt() {
      return Math.floor(Math.random() * (50 - 5 + 1)) + 5;
    },
    newSituation: function () {
      this.$store.dispatch("clear", this.$route.query.external_id);
      this.next();
    },
    next: function () {
      this.$push();
    },
  },
  mounted() {
    setInterval(this.changeDataset, 3750);
  },
};
</script>

<style lang="scss">
@import "../../node_modules/bootswatch/dist/litera/_variables.scss";

.wordslider {
  font-size: 24px;
  font-weight: 800;
}
.wordslider p {
  margin-bottom: 1rem;
}
.wordslider p,
.wordslider .textra {
  font-size: 1.5em;
}

.textra {
  color: $orange;
}
.qa {
  margin-bottom: 2rem;
}

.qa__q {
  color: $gray-600;
  border-left: 0.5rem solid $gray-600;
  padding-left: 0.5rem;
  font-style: italic;
}
</style>
