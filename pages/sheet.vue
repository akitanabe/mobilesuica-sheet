<script lang="ts" setup>
  const { setSheetsData, sheetsdata, cols, months, selected } = useSheet();

  await setSheetsData();
</script>
<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-tabs
          v-model="selected"
          color="deep-purple-accent-4"
          align-tabs="center"
        >
          <v-tab v-for="month in months" :key="month" :value="month">
            {{ month }}
          </v-tab>
        </v-tabs>
        <v-table>
          <thead>
            <tr>
              <th v-for="(name, i) in cols" :key="i">{{ name }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in sheetsdata[selected]" :key="i">
              <td v-for="(cell, j) in row" :key="j">{{ cell }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-col>
    </v-row>
  </v-container>
</template>
