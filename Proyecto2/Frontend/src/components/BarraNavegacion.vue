<template>
    <v-app-bar height="80" color="teal-darken-4" image="https://www.awd-it.co.uk/media/.renditions/wysiwyg/8BidBv6.jpeg">

        <template v-slot:prepend>
            <v-btn icon @click.stop="drawer = !drawer">
                <v-icon>mdi-view-headline</v-icon>
            </v-btn>
        </template>

        <v-app-bar-title>Xela-Gamer</v-app-bar-title>
        <v-spacer></v-spacer>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" temporary>
        <v-divider></v-divider>

        <v-list>
            <v-list-item to="/" title="Inicio" prepend-icon="mdi-home" router></v-list-item>
            <v-list-item to="/registro-usuario" title="Registro Usuario" prepend-icon="mdi-account-plus" route></v-list-item>
            <v-list-item to="/usuarios" title="Lista de Usuarios" prepend-icon="mdi-account-multiple" route></v-list-item>
            <v-list-item to="/Registro-videojuego" title="Registro Videojuego" prepend-icon="mdi-gamepad-variant" route></v-list-item>
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