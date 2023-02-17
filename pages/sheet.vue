<script lang="ts" setup>
  const {
    setSheetsData,
    displaydata,
    cols,
    months,
    selected,
    filterWords,
    addFilterWords,
    removeFilterWords,
    setFilterWords,
  } = useSheet();

  try {
    await setSheetsData();
  } catch (e) {
    navigateTo('/');
  }
  console.log('SSR');
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
        <v-form>
          <div>
            <v-text-field
              v-for="(word, i) in filterWords"
              :key="i"
              append-inner-icon="mdi-close-circle"
              @click:append-inner="removeFilterWords(i)"
              @update:model-value="setFilterWords($event, i)"
            ></v-text-field>
          </div>
          <div>
            <v-btn @click="addFilterWords">追加</v-btn>
          </div>
        </v-form>
        <v-table>
          <thead>
            <tr>
              <th v-for="(name, i) in cols" :key="i">{{ name }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in displaydata" :key="i">
              <td v-for="(name, j) in cols" :key="j">{{ row[j] }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-col>
    </v-row>
  </v-container>
</template>
