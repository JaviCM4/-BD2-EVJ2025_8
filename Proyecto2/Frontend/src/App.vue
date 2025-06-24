<script setup>
  import BarraNavegacion from './components/BarraNavegacion.vue'
</script>

<template>
  <v-app>
    <BarraNavegacion/>
    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>