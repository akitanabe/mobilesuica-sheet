<template>
  <v-app>
    <the-header></the-header>
    <v-main class="bg-grey-lighten-3">
      <v-container>
        <v-row>
          <v-col cols="2" />
          <v-col cols="8"><slot /></v-col>
          <v-col cols="2" />
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>
