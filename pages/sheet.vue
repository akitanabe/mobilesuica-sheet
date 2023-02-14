<script lang="ts" setup>
  const suicadata = reactive<{ data: string[][] }>({ data: [] });
  type Result = { ok: boolean; data: string[][] };

  const cols = [
    '月日',
    '種別',
    '利用場所',
    '種別',
    '利用場所',
    '残高',
    '入金・利用額',
  ];

  $fetch<Result>('/api/data').then((res) => {
    console.log(res);
    if (res.ok) {
      suicadata.data = res.data;
    } else {
      navigateTo('/');
    }
  });
</script>
<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-table>
          <thead>
            <th v-for="(name, i) in cols" :key="i">{{ name }}</th>
          </thead>
          <tbody>
            <tr v-for="(row, i) in suicadata.data" :key="i">
              <td v-for="(cell, j) in row" :key="j">{{ cell }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-col>
    </v-row>
  </v-container>
</template>
