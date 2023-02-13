<script lang="ts" setup>
  const { loginType, email, captcha, captchaImage, password, setCaptchaImage } =
    useLogin();

  onMounted(() => {
    setCaptchaImage();
  });
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12" sm="2" />
      <v-col cols="12" sm="8" class="bg-grey-lighten-4">
        <v-form>
          <v-row>
            <v-col cols="12">
              <h2>モバイルSuica ログイン</h2>
              <v-radio-group v-model="loginType" inline>
                <v-radio label="モバイルSuica" value="MobileSuica"></v-radio>
                <v-radio label="My JR-EAST" value="MyJR-EAST"></v-radio>
              </v-radio-group>
              <v-text-field v-model="email" required label="メールアドレス" />
              <v-text-field
                v-model="password"
                type="password"
                required
                label="パスワード"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="4">
              <div class="captcha-image">
                <img :src="captchaImage" />
              </div>
            </v-col>
            <v-col cols="3">
              <v-btn
                icon="mdi-reload"
                color="success"
                @click="setCaptchaImage"
              ></v-btn>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model="captcha"
                required
                label="表示されている文字の入力"
              />
            </v-col>
          </v-row>
          <v-row></v-row>
        </v-form>
      </v-col>
      <v-col cols="12" sm="2" />
    </v-row>
  </v-container>
</template>

<style scoped></style>
