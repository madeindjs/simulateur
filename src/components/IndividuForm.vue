<template>
  <form @submit.prevent="submit">
    <h1 v-if="!withoutTitle">{{title | capitalize}}</h1>
    <div class="form-group">
      <label for="date-de-naissance">Date de naissance</label>
      <InputDate id="date-de-naissance" v-model="individu.date_naissance" />
      <p
        class="text-warning"
        v-if="$v.individu.date_naissance.$dirty && $v.individu.date_naissance.$error"
      >Ce champ est obligatoire.</p>
    </div>

    <p class="text-warning" v-if="isDemandeurMineur">
      Les aides simulées ne peuvent normalement être attribuées qu'à des personnes majeures.
      Pour bénéficier d'aides, vous devrez démontrer aux organismes qui les distribuent que vous n'avez plus de liens avec vos parents ou tuteurs.
      Si ce n'est pas le cas, faites plutôt la simulation du point de vue d'un de vos parents ou tuteurs.
    </p>

    <div class="form-group" v-if="captureFirstName">
      <label>Prénom</label>
      <input type="text" v-model="individu.firstName" class="form-control" />
      <small
        class="form-text text-muted"
      >il servira uniquement à vous faciliter la saisie par la suite</small>
      <p class="invalid-feedback" v-if="$v.individu.firstName.$error">Ce champ est obligatoire.</p>
    </div>

    <NationalityChoice class="form-group" v-model="individu.nationalite" />

    <div class="form-check d-block" v-if="captureOutOfFranceQuestions">
      <label>
        <input type="checkbox" v-model="satisfyResidentialDurationPrerequisite" />
        Résidant en France plus de 9 mois par an
      </label>
      <p
        class="alert alert-warning"
        v-if="$v.satisfyResidentialDurationPrerequisite.$error"
      >Vous devez remplir cette condition pour être éligible aux aides sociales calculées par ce simulateur.</p>
    </div>

    <div
      class="form-group"
      v-if="captureOutOfFranceQuestions && satisfyResidentialDurationPrerequisite"
    >
      <label>
        <input type="checkbox" v-model="satisfyResidentialPermitPrerequisite[getZone()]" />
        <span v-html="residentialPermitLabel[getZone()]"></span>
        <p
          class="alert alert-warning"
          v-if="$v.satisfyResidentialPermitPrerequisite[getZone()].$error"
        >Vous devez remplir cette condition pour être éligible aux aides sociales calculées par ce simulateur.</p>
      </label>
    </div>

    <div class="form-group" v-if="individu.role == 'conjoint'">
      <label>Votre relation</label>
      <select v-model="individu.statut_marital" class="form-control">
        <option
          v-for="situationFamiliale in situationsFamiliales"
          v-bind:value="situationFamiliale.value"
          v-bind:key="situationFamiliale.value"
        >{{situationFamiliale.label}}</option>
      </select>
    </div>

    <fieldset class="form-group">
      <legend>
        <span v-if="individu.role == 'demandeur'">Vous êtes</span>
        <span v-if="individu.role == 'conjoint'">Votre conjoint·e est</span>
        <span v-if="individu.role == 'enfant'">Il ou elle est</span>
        <span>(plusieurs choix possibles)</span>
      </legend>
      <div class="form-check">
        <label v-if="captureGardeAlternee" class="d-block">
          <input type="checkbox" v-model="individu.garde_alternee" />
          En garde alternée
        </label>
        <label v-for="statut in specificSituations" v-bind:key="statut.id" class="d-block">
          <input type="checkbox" v-model="individu[statut.id]" />
          {{ statut.label }}
        </label>
        <label class="d-block">
          <input type="checkbox" v-model="no_specific_situation" />
          <i>{{ individu.role == 'demandeur' ? 'Je ne suis dans' : 'Il ou elle n\'est dans' }} aucune de ces situations</i>
        </label>
      </div>
    </fieldset>

    <ASSQuestions class="form-group" v-bind:individu="individu" v-if="captureEligibiliteAss" />

    <fieldset class="form-group" v-if="captureTauxIncapacite">
      <legend>
        {{ individu.role == 'demandeur' ? 'Votre' : 'Son' }} taux d'incapacité
        <span>
          évalué par
          <a
            target="_blank"
            rel="noopener"
            href="http://informations.handicap.fr/carte-france-mdph.php"
          >
            votre
            <abbr title="Maison départementale des personnes handicapées">MDPH</abbr>
          </a>.
        </span>
      </legend>
      <label
        v-for="tauxIncapacite in tauxIncapaciteOptions"
        v-bind:key="tauxIncapacite.value"
        class="d-block"
      >
        <input
          type="radio"
          name="tauxIncapacite"
          v-model="individu.taux_incapacite"
          v-bind:value=" tauxIncapacite.value"
        />
        {{ tauxIncapacite.label }}
      </label>
    </fieldset>

    <YesNoQuestion
      class="form-group"
      v-model="individu.aah_restriction_substantielle_durable_acces_emploi"
      v-if="captureRestrictionSubstantielleDurableAccesEmploi"
    >
      {{ individu.role == 'demandeur' ? 'Avez-vous' : 'A-t-il/elle' }}
      une restriction substantielle et durable d'accès à l'emploi reconnue par la
      <abbr
        title="Commission des droits et de l'autonomie des personnes handicapées"
      >CDAPH</abbr> ?
      <span>Attention, cette restriction est différente de la reconnaissance de la qualité de travailleur handicapé.</span>
    </YesNoQuestion>

    <YesNoQuestion
      class="form-group"
      v-model="individu.enfant_place"
      v-if="captureEnfantPlace"
    >Est-il/elle placé·e en structure spécialisée ou famille d'accueil ?</YesNoQuestion>

    <div class="form-group" v-if="individu.etudiant">
      <label>
        À quel échelon {{ individu.role == 'demandeur' ? 'êtes-vous' : 'est-il/elle' }} boursier ?
        {{ individu.echelon_bourse == -1 ? 'Non boursier': 'Boursier échelon ' + individu.echelon_bourse }}
      </label>
      <input
        id="echelon-bourse"
        v-model="individu.echelon_bourse"
        class="form-control"
        type="range"
        min="-1"
        max="7"
      />
    </div>

    <YesNoQuestion
      class="form-group"
      v-model="fiscalementIndependant"
      v-if="captureDemandeurACharge"
    >Remplirez-vous vous-même votre prochaine déclaration de revenus aux impôts ?</YesNoQuestion>

    <div class="form-group" v-if="captureScolarite">
      <label>Où sera-t-il/elle scolarisé·e à la rentrée prochaine ?</label>
      <select v-model="individu.scolarite" class="form-control">
        <option
          v-for="scolarite in scolariteOptions"
          v-bind:value="scolarite.value"
          v-bind:key="scolarite.value"
        >{{scolarite.label}}</option>
      </select>
    </div>

    <YesNoQuestion
      class="form-group"
      v-model="individu.enfant_a_charge[$store.state.dates.thisYear.id]"
      v-if="captureEnfantACharge"
    >Figure-t-il/elle sur votre dernière déclaration d'impôt sur le revenu ?</YesNoQuestion>

    <fieldset class="form-group" v-if="capturePerteAutonomie">
      <legend for="gir" id="girQuestion">Avez-vous besoin d’une aide à la personne ?</legend>
      <label v-for="gir in GIROptions" v-bind:key="gir.value">
        <input type="radio" name="gir" v-bind:value="gir.value" v-model="individu.gir" />
        {{ gir.label }}
      </label>
    </fieldset>

    <div class="text-right">
      <button type="submit" class="btn btn-lg btn-primary">Valider</button>
    </div>

    <button
      v-if="showCancelButton"
      class="btn btn-secondary"
      v-on:click.prevent="$emit('cancel')"
    >Annuler</button>
  </form>
</template>

<script>
import { required } from "vuelidate/lib/validators";

import InputDate from "@/components/InputDate";
import { specificSituations } from "@/constants/specificSituations";
import ASSQuestions from "@/components/ASSQuestions";
import Individu from "@/lib/Individu";
import Nationality from "@/lib/Nationality";
import NationalityChoice from "@/components/NationalityChoice";
import YesNoQuestion from "@/components/YesNoQuestion";

const tauxIncapaciteOptions = [
  {
    value: 0.3,
    label: "Moins de 50%",
  },
  {
    value: 0.7,
    label: "Entre 50% et 80%",
  },
  {
    value: 0.9,
    label: "Plus de 80%",
  },
];

const scolariteOptions = [
  {
    value: "inconnue",
    label: "Aucun des deux",
  },
  {
    value: "college",
    label: "Au collège",
  },
  {
    value: "lycee",
    label: "Au lycée / En CAP / En CPA",
  },
];

const GIROptions = [
  {
    value: "gir_6",
    label: "Jamais",
  },
  {
    value: "gir_5",
    label: "Ponctuellement",
  },
  {
    value: "gir_1",
    label: "Régulièrement",
  },
];

const residentialPermitLabel = {
  autre: "En possession d‘une carte de résident ou d‘un titre de séjour valide",
  ue:
    'En possession d‘un <a target="_blank" rel="noopener" href="https://www.service-public.fr/particuliers/vosdroits/F2651">droit au séjour</a> valide',
};

const situationsFamiliales = [
  {
    value: "marie", // Enum value 1 in OpenFisca
    label: "Marié·e",
  },
  {
    value: "pacse", // Enum value 5 in OpenFisca
    label: "Pacsé·e",
  },
  {
    value: "celibataire", // Enum value 2 in OpenFisca
    label: "En union libre",
  },
];

const mustBeTruthy = function (value) {
  return Boolean(value);
};

export default {
  name: "IndividuForm",
  components: {
    ASSQuestions,
    InputDate,
    NationalityChoice,
    YesNoQuestion,
  },
  props: {
    existingIndividu: Boolean,
    value: Object,
    withoutTitle: Boolean,
  },
  data: function () {
    let satisfyResidentialPermitPrerequisite = {};
    if (this.existingIndividu) {
      satisfyResidentialPermitPrerequisite = {
        [this.getZone(this.value && this.value.nationalite)]: true,
      };
    }

    let individu = Object.assign({}, this.value);

    return {
      individu,
      no_specific_situation: null,
      GIROptions,
      residentialPermitLabel,
      satisfyResidentialDurationPrerequisite: this.existingIndividu,
      satisfyResidentialPermitPrerequisite,
      scolariteOptions,
      situationsFamiliales,
      specificSituations,
      tauxIncapaciteOptions,
    };
  },
  computed: {
    captureDemandeurACharge: function () {
      let age = Individu.age(
        this.individu,
        this.$store.state.dates.today.value
      );
      return this.individu.role == "demandeur" && age >= 18 && age < 25;
    },
    captureEligibiliteAss: function () {
      return this.isIndividuParent && this.individu.chomeur;
    },
    captureEnfantACharge: function () {
      return (
        !this.isIndividuParent &&
        Individu.age(this.individu, this.$store.state.dates.today.value) >= 1
      );
    },
    captureEnfantPlace: function () {
      return !this.isIndividuParent && this.individu.handicap;
    },
    captureGardeAlternee: function () {
      return !this.isIndividuParent;
    },
    captureOutOfFranceQuestions: function () {
      return (
        this.individu.role == "demandeur" && this.individu.nationalite != "FR"
      );
    },
    capturePerteAutonomie: function () {
      return (
        Individu.age(this.individu, this.$store.state.dates.today.value) >= 60
      );
    },
    captureFirstName: function () {
      return !this.isIndividuParent;
    },
    captureRestrictionSubstantielleDurableAccesEmploi: function () {
      return (
        this.captureTauxIncapacite &&
        this.isIndividuParent &&
        this.individu.taux_incapacite == 0.7
      );
    },
    captureScolarite: function () {
      if (!this.isIndividuParent) {
        let age = Individu.age(
          this.individu,
          this.$store.state.dates.today.value
        );
        return age <= 25 && age > 8;
      }

      return false;
    },
    captureTauxIncapacite: function () {
      return this.individu.handicap;
    },
    fiscalementIndependant: {
      get: function () {
        return !this.individu.enfant_a_charge[
          this.$store.state.dates.thisYear.id
        ];
      },
      set: function (value) {
        this.individu.enfant_a_charge[
          this.$store.state.dates.thisYear.id
        ] = !value;
      },
    },
    isNaissanceValid: function () {
      return !this.$v.individu.date_naissance.$invalid;
    },
    isDemandeurMineur: function () {
      return (
        this.individu.role === "demandeur" &&
        this.isNaissanceValid &&
        Individu.age(this.individu, this.date) < 18
      );
    },
    isIndividuParent: function () {
      return Individu.isRoleParent(this.individu.role);
    },
    showCancelButton: function () {
      return this.individu.role === "enfant" && !this.existingIndividu;
    },
    title: function () {
      return this.individu.role === "enfant" && !this.existingIndividu
        ? "Nouvel enfant"
        : Individu.label(this.individu);
    },
  },
  methods: {
    getZone: function (nationalite) {
      return Nationality.getZone(
        nationalite || (this.individu && this.individu.nationalite)
      );
    },
    submit: function () {
      if (!this.captureDureePossessionTitreSejour) {
        delete this.individu.duree_possession_titre_sejour;
      }

      if (!this.captureEligibiliteAss) {
        delete this.individu.ass_precondition_remplie;
        delete this.individu.date_debut_chomage;
      }

      if (!this.captureTauxIncapacite) {
        delete this.individu.taux_incapacite;
      }

      if (!this.captureRestrictionSubstantielleDurableAccesEmploi) {
        delete this.individu.aah_restriction_substantielle_durable_acces_emploi;
      }

      if (!this.captureScolarite) {
        delete this.individu.scolarite;
      }

      this.$v.$touch();
      if (!this.$v.$invalid) {
        this.$emit("input", this.individu);
      }
    },
  },
  watch: {
    existingIndividu: function () {
      this.satisfyResidentialDurationPrerequisite = this.existingIndividu;
    },
    value: function () {
      this.individu = Object.assign({}, this.value);
    },
  },
  validations: function () {
    let validations = {
      individu: {
        date_naissance: { required },
      },
    };

    if (this.captureFirstName) {
      validations.individu.firstName = { required };
    }

    if (this.captureOutOfFranceQuestions) {
      validations.satisfyResidentialDurationPrerequisite = { mustBeTruthy };
      validations.satisfyResidentialPermitPrerequisite = {
        [this.getZone()]: { mustBeTruthy },
      };
    }

    return validations;
  },
};
</script>
