<template>
  <fieldset>
    <legend><slot></slot><slot name="help"></slot></legend>
    <div class="form-check">
      <label
        ><input
          type="radio"
          v-bind:value="true"
          v-bind:name="uniqueFieldName"
          v-model="model"
        />Oui</label
      >
    </div>
    <div class="form-check">
      <label
        ><input
          type="radio"
          v-bind:value="false"
          v-bind:name="uniqueFieldName"
          v-model="model"
        />Non</label
      >
    </div>
  </fieldset>
</template>

<script>
export default {
  name: "YesNoQuestion",
  props: {
    value: [Boolean, Number],
  },
  data: function () {
    const uniqueFieldName = "field." + Math.random().toString(36).slice(2);
    return {
      uniqueFieldName,
    };
  },
  computed: {
    model: {
      get: function () {
        return this.value;
      },
      set: function (value) {
        this.$emit("input", value);
      },
    },
  },
};
</script>
