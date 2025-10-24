import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: 'white' // white | red | navy
  }),
  actions: {
    setTheme(color) {
      this.theme = color
    }
  }
})
