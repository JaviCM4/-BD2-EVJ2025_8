<template>
    <v-app-bar height="80" color="teal-darken-4" image="https://revistaiiqb.usac.edu.gt/g/gal_uploaded/2018_imagen_superior_396.jpg">

        <template v-slot:prepend>
            <v-btn icon @click.stop="drawer = !drawer">
                <v-icon>mdi-view-headline</v-icon>
            </v-btn>
        </template>

        <v-app-bar-title>Usac</v-app-bar-title>
        <v-spacer></v-spacer>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" temporary>
        <v-divider></v-divider>

        <v-list>
            <v-list-item to="/" title="Inicio" prepend-icon="mdi-home" router></v-list-item>
            <v-list-item to="/general" title="Estadísticas Generales" prepend-icon="mdi-chart-bar" route></v-list-item>
            <v-list-item to="/historial" title="Historial Aspirante" prepend-icon="mdi-history" route></v-list-item>
            <v-list-item to="/ajustes" title="Ajustes" prepend-icon="mdi-wrench" route></v-list-item>
        </v-list>

    </v-navigation-drawer>
</template>

<script>
    export default {
        data () {
            return {
                drawer: null,
            }
        },
    }
</script>