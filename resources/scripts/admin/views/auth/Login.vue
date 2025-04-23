<template>
  <div>
    <form id="loginForm" class="mt-12 text-left" @submit.prevent="onSubmit">
      <BaseInputGroup :error="v$.email.$error && v$.email.$errors[0].$message" :label="$t('login.email')" class="mb-4"
        required>
        <BaseInput v-model="authStore.loginData.email" :invalid="v$.email.$error" focus type="email" name="email"
          @input="v$.email.$touch()" />
      </BaseInputGroup>

      <BaseInputGroup :error="v$.password.$error && v$.password.$errors[0].$message" :label="$t('login.password')"
        class="mb-4" required>
        <BaseInput v-model="authStore.loginData.password" :invalid="v$.password.$error" :type="getInputType"
          name="password" @input="v$.password.$touch()">
          <template #right>
            <BaseIcon :name="isShowPassword ? 'EyeIcon' : 'EyeSlashIcon'" class="mr-1 text-gray-500 cursor-pointer"
              @click="isShowPassword = !isShowPassword" />
          </template>
        </BaseInput>
      </BaseInputGroup>

      <div class="mt-5 mb-8">
        <div class="mb-4">
          <router-link to="forgot-password" class="text-sm text-primary-400 hover:text-gray-700">
            {{ $t('login.forgot_password') }}
          </router-link>
        </div>
      </div>
      <BaseButton :loading="isLoading" type="submit" class="w-full">
        {{ $t('login.login') }}
      </BaseButton>

      <div v-if="config.oidc_enabled" class="mt-4">
        <BaseButton class="w-full" type="button" @click="loginWithOIDC">
          {{ $t('login.login_with_oidc') }}
        </BaseButton>
      </div>
    </form>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref, computed, onMounted } from 'vue'
import { useNotificationStore } from '@/scripts/stores/notification'
import { useRouter } from 'vue-router'
import { required, email, helpers } from '@vuelidate/validators'
import { useVuelidate } from '@vuelidate/core'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/scripts/admin/stores/auth'
import { handleError } from '@/scripts/helpers/error-handling'

const notificationStore = useNotificationStore()
const authStore = useAuthStore()
const { t } = useI18n()
const router = useRouter()
const isLoading = ref(false)
let isShowPassword = ref(false)
const debug = ref(false)
const config = ref({
  oidc_enabled: true
})

const rules = {
  email: {
    required: helpers.withMessage(t('validation.required'), required),
    email: helpers.withMessage(t('validation.email_incorrect'), email),
  },
  password: {
    required: helpers.withMessage(t('validation.required'), required),
  },
}

const v$ = useVuelidate(
  rules,
  computed(() => authStore.loginData)
)

const getInputType = computed(() => {
  if (isShowPassword.value) {
    return 'text'
  }
  return 'password'
})

async function onSubmit() {
  axios.defaults.withCredentials = true

  v$.value.$touch()

  if (v$.value.$invalid) {
    return true
  }

  isLoading.value = true

  try {
    isLoading.value = true
    await authStore.login(authStore.loginData)

    router.push('/admin/dashboard')

    notificationStore.showNotification({
      type: 'success',
      message: 'Logged in successfully.',
    })
  } catch (error) {
    isLoading.value = false
  }
}

async function loginWithOIDC() {
  console.log('Redirecting to OIDC login...')
  window.location.href = '/auth/oidc'
}

async function checkOIDCConfig() {
  try {
    console.log('Checking OIDC configuration...')
    const response = await axios.get('/api/v1/settings/oidc')
    console.log('OIDC config response:', response.data)
    config.value.oidc_enabled = !!response.data.oidc_enabled
    console.log('OIDC enabled:', config.value.oidc_enabled)
  } catch (error) {
    console.error('Failed to check OIDC configuration:', error)
    config.value.oidc_enabled = false
  }
}

// Check OIDC configuration when component mounts
onMounted(async () => {
  console.log('Login component mounted')
  if (window.demo_mode) {
    authStore.loginData.email = 'demo@invoiceshelf.com'
    authStore.loginData.password = 'demo'
  }
  await checkOIDCConfig()
})
</script>
