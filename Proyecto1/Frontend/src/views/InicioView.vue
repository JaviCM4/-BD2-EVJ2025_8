<script setup lang="ts">
</script>

<template>
  <v-main>
    <v-container>
      <!-- Encabezado -->
      <v-card color="teal-darken-3" theme="dark">
        <v-card-title class="text-h4 text-center">UNIVERSIDAD DE SAN CARLOS DE GUATEMALA</v-card-title>
        <v-card-subtitle class="text-center">¡La Tricentenaria al servicio del pueblo!</v-card-subtitle>
      </v-card>
      <br>
      <!-- Descripción -->
      <v-card class="mb-6" outlined>
        <v-card-title>Descripción</v-card-title>
        <v-card-text>
          La Universidad de San Carlos de Guatemala es la institución pública de educación superior más importante del país, con una trayectoria histórica que la posiciona como un pilar del desarrollo académico, científico y cultural. Su compromiso con la formación integral de sus estudiantes se refleja en la oferta educativa innovadora y en la generación de conocimiento a través de la investigación. Además, promueve activamente la proyección social, asegurando que su impacto trascienda las aulas y contribuya al bienestar de la sociedad guatemalteca.
        </v-card-text>
      </v-card>

      <!-- Misión y Visión -->
      <v-row class="mb-6" dense>
        <v-col cols="12" md="6">
          <v-card outlined>
            <v-card-title>Misión</v-card-title>
            <v-card-text>
              Formar profesionales críticos, éticos y comprometidos con la transformación social, capacitados para enfrentar los retos del mundo moderno y aportar soluciones innovadoras a las problemáticas de la sociedad. A través de la investigación científica de alto nivel y la promoción del desarrollo humano sostenible, la universidad impulsa la educación como motor de cambio, fortaleciendo valores de equidad, justicia y autonomía para garantizar el acceso al conocimiento y la construcción de una sociedad más inclusiva.  
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card outlined>
            <v-card-title>Visión</v-card-title>
            <v-card-text>
              Ser una universidad líder en Latinoamérica, reconocida por su excelencia académica, su impacto en el desarrollo social y económico, y su contribución a la producción de conocimiento científico y tecnológico. Su compromiso con la sociedad se traduce en la defensa del pensamiento libre y democrático, la promoción de los derechos humanos y la consolidación de una comunidad universitaria diversa e inclusiva, que trabaje en conjunto por el progreso de Guatemala y de la región.
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
          <p>
            <v-icon class="me-2" color="teal">mdi-map-marker</v-icon>
            <strong>Dirección:</strong> Ciudad Universitaria, Zona 12, Guatemala
          </p>
          <p>
            <v-icon class="me-2" color="teal">mdi-phone</v-icon>
            <strong>Teléfono:</strong> (502) 2418-8000
          </p>
          <p>
            <v-icon class="me-2" color="teal">mdi-email</v-icon>
            <strong>Correo electrónico:</strong> info@usac.edu.gt
          </p>
          <p>
            <v-icon class="me-2" color="teal">mdi-web</v-icon>
            <strong>Sitio web:</strong>
            <a href="https://www.usac.edu.gt" target="_blank">www.usac.edu.gt</a>
          </p>
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
