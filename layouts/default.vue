<template>
  <v-app>
    <the-header></the-header>
    <v-main class="bg-grey-lighten-3">
      <v-container>
        <v-row>
          <v-col cols="12" sm="3" />
          <v-col cols="12" sm="6"><slot /></v-col>
          <v-col cols="12" sm="3" />
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>
