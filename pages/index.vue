<script lang="ts" setup>
  import { Ref } from 'vue';

  const loginType: Ref<'MobileSuica' | 'MyJR-EAST'> = ref('MobileSuica');
  const password = ref('');
  const email = ref('');

  const captcha = ref('');

  onMounted(() => {
    $fetch('/api/captcha').then((base64) => {
      captcha.value = `data:image/gif;base64,${base64}`;
    });
  });
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12" sm="2" />
      <v-col cols="12" sm="8">
        <h2>モバイルSuica ログイン</h2>
        <v-form>
          <v-radio-group v-model="loginType" inline>
            <v-radio label="モバイルSuica" value="MobileSuica"></v-radio>
            <v-radio label="My JR-EAST" value="MyJR-EAST"></v-radio>
          </v-radio-group>
          <v-text-field v-model="email" required label="メールアドレス" />
          <v-text-field v-model="password" required label="パスワード" />
          <div><img :src="captcha" /></div>
        </v-form>
      </v-col>
      <v-col cols="12" sm="2" />
    </v-row>
  </v-container>
</template>

<style scoped></style>
