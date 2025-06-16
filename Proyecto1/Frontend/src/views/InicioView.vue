<script setup lang="ts">
</script>

<template>
  <v-main>
    <v-container class="mb-6">
      <!-- Encabezado -->
      <v-card color="teal-darken-3" theme="dark">
        <v-card-title class="text-h4 text-center">UNIVERSIDAD DE SAN CARLOS DE GUATEMALA</v-card-title>
        <v-card-subtitle class="text-center">¡La Tricentenaria al servicio del pueblo!</v-card-subtitle>
      </v-card>

      <!-- Descripción -->
      <v-card class="mb-6" outlined>
        <v-card-title>Descripción</v-card-title>
        <v-card-text>
          La Universidad de San Carlos de Guatemala es la institución pública de educación superior más importante del país, comprometida con la formación integral, la investigación y la proyección social.
        </v-card-text>
      </v-card>

      <!-- Misión y Visión -->
      <v-row class="mb-6" dense>
        <v-col cols="12" md="6">
          <v-card outlined>
            <v-card-title>Misión</v-card-title>
            <v-card-text>
              Formar profesionales críticos, éticos y comprometidos con la transformación social, promoviendo la investigación científica y el desarrollo humano sostenible.
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card outlined>
            <v-card-title>Visión</v-card-title>
            <v-card-text>
              Ser una universidad líder en Latinoamérica por su excelencia académica, compromiso con la sociedad y defensa del pensamiento libre y democrático.
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Valores -->
      <v-card class="mb-6" outlined>
        <v-card-title>Valores</v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item v-for="(valor, i) in ['Ética', 'Solidaridad', 'Responsabilidad', 'Autonomía', 'Inclusión']" :key="i">
              <v-list-item-icon>
                <v-icon color="teal">mdi-check-circle</v-icon>
              </v-list-item-icon>
              <v-list-item-title>{{ valor }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>

      <!-- Contacto -->
      <v-card outlined>
        <v-card-title>Contacto</v-card-title>
        <v-card-text>
          <p><strong>Dirección:</strong> Ciudad Universitaria, Zona 12, Guatemala</p>
          <p><strong>Teléfono:</strong> (502) 2418-8000</p>
          <p><strong>Correo electrónico:</strong> info@usac.edu.gt</p>
          <p><strong>Sitio web:</strong> <a href="https://www.usac.edu.gt" target="_blank">www.usac.edu.gt</a></p>
        </v-card-text>
      </v-card>
    </v-container>
  </v-main>
</template>

<style scoped>
.v-card-title {
  font-weight: bold;
}
</style>
