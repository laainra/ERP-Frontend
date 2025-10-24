import { defineStore } from "pinia";
import { ref, watch } from "vue";

export const useSidebarStore = defineStore("sidebar", () => {
  const isMinimized = ref(localStorage.getItem("sidebar") === "true");

  function toggleSidebar() {
    isMinimized.value = !isMinimized.value;
  }

  watch(isMinimized, (val) => {
    localStorage.setItem("sidebar", val);
  });

  return { isMinimized, toggleSidebar };
});
