<script lang="ts" setup>
  const {
    loginType,
    email,
    loading,
    captcha,
    captchaImage,
    password,
    setCaptchaImage,
    login,
  } = useLogin();

  onMounted(() => {
    setCaptchaImage();
  });
</script>

<template>
  <v-container>
    <v-row justify="center">
      <v-col
        cols="12"
        xl="6"
        lg="8"
        md="10"
        sm="12"
        xs="12"
        class="bg-grey-lighten-4 login-form-container"
      >
        <v-form class="login-form">
          <h2>モバイルSuica ログイン</h2>
          <div>
            <v-radio-group v-model="loginType" inline>
              <v-radio label="モバイルSuica" value="MobileSuica"></v-radio>
              <v-radio label="My JR-EAST" value="MyJR-EAST"></v-radio>
            </v-radio-group>
          </div>
          <div>
            <v-text-field
              v-model="email"
              required
              variant="underlined"
              label="メールアドレス"
            />
          </div>
          <div>
            <v-text-field
              v-model="password"
              type="password"
              required
              label="パスワード"
              variant="underlined"
            />
          </div>
          <div class="captcha-wrapper">
            <div class="flex">
              <span class="captcha-image">
                <v-progress-circular
                  v-if="captchaImage == ''"
                  model-value="10"
                  :size="40"
                  :width="4"
                  indeterminate
                  color="blue"
                ></v-progress-circular>
                <img v-else :src="captchaImage" />
              </span>
              <span class="captcha-image-reload-wrapper">
                <v-btn
                  class="captcha-image-reload"
                  icon="mdi-reload"
                  color="success"
                  :disabled="loading"
                  @click="setCaptchaImage"
                ></v-btn>
              </span>
            </div>
            <div class="captcha-input-wrapper">
              <v-text-field
                v-model="captcha"
                required
                label="表示されている文字の入力"
              />
            </div>
          </div>
          <div class="center">
            <v-btn
              variant="tonal"
              color="info"
              size="large"
              :disabled="loading"
              @click="login"
            >
              ログイン
            </v-btn>
          </div>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="scss" scoped>
  .center {
    text-align: center;
  }
  .login-form {
    padding: 1.5rem;
  }

  .login-form-container {
    border-radius: 12px;
  }

  .captcha-wrapper {
    width: 60%;

    .flex {
      display: flex;
      align-items: center;
      column-gap: 1rem;

      .captcha-image {
        width: 175px;
        min-width: 175px;
        height: 68px;
        min-height: 68px;
        display: grid;
        place-items: center;
      }
    }
  }

  .captcha-input-wrapper {
    padding: 0.5rem 0;
  }
</style>
