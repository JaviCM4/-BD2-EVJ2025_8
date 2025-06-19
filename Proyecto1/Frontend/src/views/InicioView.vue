<script setup lang="ts">
const valores = [
  { nombre: 'Ética', icono: 'mdi-account-heart', descripcion: 'Compromiso con la integridad y rectitud moral' },
  { nombre: 'Solidaridad', icono: 'mdi-hand-heart', descripcion: 'Apoyo mutuo y colaboración comunitaria' },
  { nombre: 'Responsabilidad', icono: 'mdi-shield-check', descripcion: 'Cumplimiento de deberes y compromisos' },
  { nombre: 'Autonomía', icono: 'mdi-flag', descripcion: 'Independencia en decisiones académicas' },
  { nombre: 'Inclusión', icono: 'mdi-account-group', descripcion: 'Diversidad y equidad para todos' }
]

const estadisticas = [
  { titulo: 'Estudiantes', numero: '200,000+', icono: 'mdi-school' },
  { titulo: 'Facultades', numero: '10', icono: 'mdi-domain' },
  { titulo: 'Años de Historia', numero: '350+', icono: 'mdi-history' },
  { titulo: 'Programas', numero: '100+', icono: 'mdi-book-open-variant' }
]
</script>

<template>
  <v-main class="main-background">
    <!-- Header Section simplificado -->
    <v-container class="py-8">
      <div class="text-center mb-8">
        <v-avatar size="120" class="mb-4">
          <v-img
            src="https://upload.wikimedia.org/wikipedia/commons/4/47/Coat_of_arms_of_University_of_San_Carlos_of_Guatemala.svg"
            alt="Escudo USAC"
          ></v-img>
        </v-avatar>
        <h1 class="text-h3 font-weight-bold text-teal mb-2">
          UNIVERSIDAD DE SAN CARLOS DE GUATEMALA
        </h1>
        <h2 class="text-h6 text-grey-darken-1">
          ¡La Tricentenaria al servicio del pueblo!
        </h2>
      </div>

      <!-- Estadísticas -->
      <v-row class="mb-8">
        <v-col v-for="(stat, i) in estadisticas" :key="i" cols="12" sm="6" md="3">
          <v-card class="text-center pa-4" elevation="3" hover>
            <v-icon size="48" color="teal" class="mb-2">{{ stat.icono }}</v-icon>
            <div class="text-h4 font-weight-bold text-teal">{{ stat.numero }}</div>
            <div class="text-subtitle-1">{{ stat.titulo }}</div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Descripción con imagen -->
      <v-card class="mb-8" elevation="4">
        <v-row no-gutters>
          <v-col cols="12" md="8">
            <v-card-title class="text-h5 teal--text">
              <v-icon class="me-2" color="teal">mdi-information</v-icon>
              Descripción
            </v-card-title>
            <v-card-text class="text-body-1 pa-6">
              La Universidad de San Carlos de Guatemala es la institución pública de educación superior más importante del país, con una trayectoria histórica que la posiciona como un pilar del desarrollo académico, científico y cultural. Su compromiso con la formación integral de sus estudiantes se refleja en la oferta educativa innovadora y en la generación de conocimiento a través de la investigación. Además, promueve activamente la proyección social, asegurando que su impacto trascienda las aulas y contribuya al bienestar de la sociedad guatemalteca.
            </v-card-text>
          </v-col>
          <v-col cols="12" md="4">
            <v-img
              src="https://images.unsplash.com/photo-1523050854058-8df90110c9d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
              height="300"
              cover
              class="rounded-r"
            >
              <div class="d-flex align-end fill-height pa-4">
                <v-chip color="teal" text-color="white" size="small">
                  Campus Universitario
                </v-chip>
              </div>
            </v-img>
          </v-col>
        </v-row>
      </v-card>

      <!-- Misión y Visión mejoradas -->
      <v-row class="mb-8" dense>
        <v-col cols="12" md="6">
          <v-card elevation="4" class="h-100">
            <v-img
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
              height="200"
              cover
            >
              <div class="d-flex align-end fill-height">
                <v-card-title class="text-white bg-gradient-overlay pa-4">
                  <v-icon class="me-2" color="white">mdi-target</v-icon>
                  Misión
                </v-card-title>
              </div>
            </v-img>
            <v-card-text class="pa-4">
              Formar profesionales críticos, éticos y comprometidos con la transformación social, capacitados para enfrentar los retos del mundo moderno y aportar soluciones innovadoras a las problemáticas de la sociedad. A través de la investigación científica de alto nivel y la promoción del desarrollo humano sostenible, la universidad impulsa la educación como motor de cambio, fortaleciendo valores de equidad, justicia y autonomía para garantizar el acceso al conocimiento y la construcción de una sociedad más inclusiva.
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card elevation="4" class="h-100">
            <v-img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
              height="200"
              cover
            >
              <div class="d-flex align-end fill-height">
                <v-card-title class="text-white bg-gradient-overlay pa-4">
                  <v-icon class="me-2" color="white">mdi-eye</v-icon>
                  Visión
                </v-card-title>
              </div>
            </v-img>
            <v-card-text class="pa-4">
              Ser una universidad líder en Latinoamérica, reconocida por su excelencia académica, su impacto en el desarrollo social y económico, y su contribución a la producción de conocimiento científico y tecnológico. Su compromiso con la sociedad se traduce en la defensa del pensamiento libre y democrático, la promoción de los derechos humanos y la consolidación de una comunidad universitaria diversa e inclusiva, que trabaje en conjunto por el progreso de Guatemala y de la región.
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Valores mejorados -->
      <v-card class="mb-8" elevation="4">
        <v-img
          src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
          height="200"
          cover
        >
          <div class="d-flex align-end fill-height">
            <v-card-title class="text-white bg-gradient-overlay pa-4 text-h4">
              <v-icon class="me-3" color="white" size="large">mdi-heart</v-icon>
              Nuestros Valores
            </v-card-title>
          </div>
        </v-img>
        <v-card-text class="pa-6">
          <v-row>
            <v-col v-for="(valor, i) in valores" :key="i" cols="12" sm="6" md="4">
              <v-card class="text-center pa-4" elevation="2" hover>
                <v-avatar size="60" color="teal" class="mb-3">
                  <v-icon size="30" color="white">{{ valor.icono }}</v-icon>
                </v-avatar>
                <v-card-title class="text-h6 mb-2">{{ valor.nombre }}</v-card-title>
                <v-card-text class="text-caption">{{ valor.descripcion }}</v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Contacto mejorado -->
      <v-card elevation="4">
        <v-row no-gutters>
          <v-col cols="12" md="6">
            <v-img
              src="https://images.unsplash.com/photo-1486312338219-ce68e2c6b696?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
              height="400"
              cover
            >
              <div class="d-flex align-end fill-height">
                <div class="bg-gradient-overlay pa-4 w-100">
                  <v-card-title class="text-white text-h4 mb-2">
                    <v-icon class="me-3" color="white" size="large">mdi-contact-mail</v-icon>
                    Contacto
                  </v-card-title>
                </div>
              </div>
            </v-img>
          </v-col>
          <v-col cols="12" md="6">
            <v-card-text class="pa-6">
              <v-list class="transparent">
                <v-list-item class="mb-3">
                  <template v-slot:prepend>
                    <v-avatar color="teal" size="40">
                      <v-icon color="white">mdi-map-marker</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-bold">Dirección</v-list-item-title>
                  <v-list-item-subtitle>Ciudad Universitaria, Zona 12, Guatemala</v-list-item-subtitle>
                </v-list-item>

                <v-list-item class="mb-3">
                  <template v-slot:prepend>
                    <v-avatar color="teal" size="40">
                      <v-icon color="white">mdi-phone</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-bold">Teléfono</v-list-item-title>
                  <v-list-item-subtitle>(502) 2418-8000</v-list-item-subtitle>
                </v-list-item>

                <v-list-item class="mb-3">
                  <template v-slot:prepend>
                    <v-avatar color="teal" size="40">
                      <v-icon color="white">mdi-email</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-bold">Correo electrónico</v-list-item-title>
                  <v-list-item-subtitle>info@usac.edu.gt</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-avatar color="teal" size="40">
                      <v-icon color="white">mdi-web</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-bold">Sitio web</v-list-item-title>
                  <v-list-item-subtitle>
                    <a href="https://www.usac.edu.gt" target="_blank" class="text-teal text-decoration-none">
                      www.usac.edu.gt
                    </a>
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>

              <v-divider class="my-4"></v-divider>
              
              <div class="text-center">
                <v-btn color="teal" variant="flat" size="large" class="me-2">
                  <v-icon start>mdi-phone</v-icon>
                  Llamar
                </v-btn>
                <v-btn color="teal" variant="outlined" size="large">
                  <v-icon start>mdi-email</v-icon>
                  Escribir
                </v-btn>
              </div>
            </v-card-text>
          </v-col>
        </v-row>
      </v-card>
    </v-container>
  </v-main>
</template>

<style scoped>
.main-background {
  margin: 0 auto;
  padding: 40px;
  background-image: url("https://i0.wp.com/i.pinimg.com/originals/98/eb/cb/98ebcbc2ca2cec8fdce270c00482da5a.jpg");
  background-size: cover;
  background-position: center;
}

.v-card-title {
  font-weight: bold;
}

.bg-gradient-overlay {
  background: linear-gradient(45deg, rgba(0,77,64,0.8) 0%, rgba(0,77,64,0.6) 100%);
}

.text-teal {
  color: #00695c !important;
}

.h-100 {
  height: 100%;
}
</style>