<template>
  <div class="container">
    <p v-show="accessStatus.fetching">
      <i class="fa fa-spinner fa-spin" aria-hidden="true"></i>
      Récupération de la situation en cours…
    </p>
    <p v-show="resultatStatus.updating">
      <i class="fa fa-spinner fa-spin" aria-hidden="true"></i> Calcul en cours
      de vos droits…
    </p>

    <div class="alert alert-warning" v-if="hasWarning">
      <div>
        <h2>
          <i class="fa fa-warning" aria-hidden="true"></i> Aucun résultat
          disponible
        </h2>
        <h3>
          La simulation à laquelle vous souhaitez accéder n‘est pas accessible.
        </h3>
        <p>
          Pour commencer votre simulation, rendez-vous sur la
          <router-link to="home">page d'accueil</router-link>.
        </p>
      </div>
    </div>

    <div id="error" class="alert alert-danger" v-if="hasError" role="alert">
      <p>
        <i class="fa fa-warning" aria-hidden="true"></i> Une erreur est
        survenue. Pour ne pas perdre les données que vous avez déclarées, vous
        pouvez garder cet onglet ouvert, puis actualiser la page une fois que le
        problème sera résolu.
      </p>

      <p>Informations techniques :</p>
      <pre v-html="error"></pre>
    </div>

    <div v-if="chartData">
      <p class="alert alert-success" v-if="complete === true">
        Votre simulation est désormais complète.
      </p>
      <p class="alert alert-info" v-if="complete === false">
        Nous sommes en train d'effectuer vos simulations. Les graphique vont se
        recharger automatiquement. Veuillez patienter quelques secondes.
      </p>
      <p>
        Le graphique ci-dessous montre votre revenu disponible et les aides pour
        chaque salaire mensuel net.
      </p>
      <SimulationChart :data="chartData"></SimulationChart>
      <hr />
      <p>
        Le graphique ci dessous montre la différence mensuelle nette de de votre
        revenu disponible et de vos aides par rapport au précédent salaire.
      </p>
      <SimulationDiffChart :data="tableData"></SimulationDiffChart>

      <h2>Résumé de votre simulation</h2>
      <SimulationSummary :data="tableData"></SimulationSummary>
      <div
        class="text-warning print-hidden"
        v-if="!ressourcesYearMinusTwoCaptured"
      >
        <h2 v-if="droits && !droits.length">
          Votre simulation n'a pas permis de découvrir de nouveaux droits.
        </h2>
        <p>
          <i class="fa fa-warning" aria-hidden="true"></i>

          Nous avons supposé que vos ressources pour l’année
          {{ $store.state.dates.fiscalYear.label }} étaient les mêmes qu’entre
          {{ $store.state.dates.twelveMonthsAgo.label }} et
          {{ $store.state.dates.oneMonthAgo.label }}.

          <router-link
            class="button-outline warning text-center"
            to="ressources/fiscales"
          >
            Déclarez vos ressources
            {{ $store.state.dates.fiscalYear.label }}
          </router-link>
        </p>
      </div>
      <h2 class="mt-5">Détails de votre simulation</h2>

      <p>
        Ci-dessous un tableau récapitulatifs des données utilisées dans le
        graphiques. Le détails des aides vous détail le calcul et comment
        obtenir l'aide.
      </p>

      <SimulationTable :data="tableData"></SimulationTable>
    </div>
  </div>
</template>

<script>
import _ from "lodash";
import SimulationTable from "@/components/SimulationTable";
import SimulationChart from "@/components/SimulationChart";
import SimulationDiffChart from "@/components/SimulationDiffChart";
import SimulationSummary from "@/components/SimulationSummary";
import axios from "axios";

export default {
  name: "resultat",
  data: function () {
    return {
      openfiscaTracerURL: false,
      openfiscaAxeURL: false,
      showExpertLinks: false,
      showPrivate: false,
      chartData: null,
      tableData: null,
      complete: true,
    };
  },
  components: {
    SimulationTable,
    SimulationChart,
    SimulationDiffChart,
    SimulationSummary,
  },
  computed: {
    droits: function () {
      return this.resultats && this.resultats.droitsEligibles;
    },
    droitsInjectes: function () {
      return (this.resultats && this.resultats.droitsInjectes) || [];
    },
    droitsNonEligibles: function () {
      return (
        (this.droitsNonEligiblesShow &&
          this.resultats &&
          this.resultats.droitsNonEligibles) ||
        []
      );
    },
    droitsNonEligiblesShown: function () {
      return this.droitsNonEligibles.filter(
        (i) => i.id === "css_participation_forfaitaire"
      );
    },
    droitsNonEligiblesShow: function () {
      return this.$store.state.ameliNoticationDone;
    },
    resultatsId: function () {
      return (this.resultats && this.resultats._id) || "???";
    },
    accessStatus: function () {
      return this.$store.state.access;
    },
    resultatStatus: function () {
      return this.$store.state.calculs;
    },
    resultats: function () {
      return this.$store.state.calculs.resultats;
    },
    ressourcesYearMinusTwoCaptured: function () {
      return this.$store.getters.ressourcesYearMinusTwoCaptured;
    },
    situation: function () {
      return this.$store.state.situation;
    },
    shouldPatrimoineBeCaptured: function () {
      if (!this.droits) {
        return;
      }

      return (
        _.some(this.droits, "isBaseRessourcesPatrimoine") &&
        this.$store.getters.hasPatrimoine === undefined
      );
    },
    hasWarning: function () {
      return this.accessStatus.forbidden;
    },
    hasError: function () {
      return this.resultatStatus.error;
    },
    shouldDisplayResults: function () {
      return Boolean(this.chartData);
    },
    error: function () {
      let value = this.resultatStatus.error && this.resultatStatus.exception;
      return _.isString(value) || value instanceof Error
        ? value
        : JSON.stringify(value, null, 2);
    },
    userAgent: function () {
      return window.navigator.userAgent;
    },
  },
  methods: {
    goToFeedback: function (event) {
      this.$ScrollService.go(event, document.getElementById("feedback"));
    },
    isEmpty: function (array) {
      return !array || array.length === 0;
    },
    isNotEmpty: function (array) {
      return array && array.length !== 0;
    },
    toggleLinks: function () {
      if (!this.openfiscaTracerURL) {
        this.$store.getters
          .fetchRepresentation("openfisca_tracer")
          .then((representation) => {
            this.openfiscaTracerURL = representation.destination.url;
          });

        this.$store.getters
          .fetchRepresentation("openfisca_axe")
          .then((representation) => {
            this.openfiscaAxeURL = representation.destination.url;
          });
      }
      this.showExpertLinks = !this.showExpertLinks;
    },
    togglePrivate: function () {
      this.showPrivate = !this.showPrivate;
      this.$store.dispatch("compute", this.showPrivate);
    },
    fillData: function () {
      axios
        .get(
          `api/situations/${this.$store.state.situation._id}/get-simulations-data`
        )
        .then((response) => {
          this.chartData = response.data.chartData;
          this.tableData = response.data.tableData;
          this.complete = response.data.complete;

          if (!response.data.complete) {
            setTimeout(() => this.fillData(), 3000);
          }
        });
    },
  },
  mounted: function () {
    if (this.$route.query && this.$route.query.situationId) {
      if (this.$store.state.situation._id !== this.$route.query.situationId) {
        this.$store
          .dispatch("fetch", this.$route.query.situationId)
          .then(() => this.fillData());
      } else if (!this.$store.getters.hasResults) {
        this.fillData();
      } // Else nothing to do
    } else if (!this.$store.getters.passSanityCheck) {
      return this.$store.dispatch("redirection", (route) =>
        this.$router.push(route)
      );
    } else {
      if (this.$store.state.calculs.dirty) {
        this.$store.dispatch("save").then(() => {
          if (this.$store.state.access.forbidden) {
            return;
          }
          this.fillData();
          // return this.$store.dispatch("fetchGraphique");
        });
        // } else if (!this.$store.getters.hasResults) {
        // this.$store.dispatch("fetchGraphique");
      } else {
        this.fillData();
      }
    }
  },
};
</script>
