<script setup>
import TerminalComponent from '@/components/Terminal.vue';
import { useRoute } from 'vue-router'
import { ref, onMounted, onUnmounted } from 'vue'

const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api';

const route = useRoute();
const containerId = ref(route.params.id);
const terminalRef = ref(null);
const logSource = ref(null);

async function fetchAndDisplayLogs() {
  logSource.value = new EventSource(`${apiUrl}/containers/${containerId.value}/logs`);

  terminalRef.value.clear();

  logSource.value.onmessage = (event) => {
    terminalRef.value.writeData(decodeURIComponent(event.data));
  };

  logSource.value.onerror = (error) => {
    console.error('Failed to fetch logs.');
    logSource.value.close();
  };
}

function handleZoom(event) {
  if (event.ctrlKey) {
    event.preventDefault();
    if (event.deltaY < 0) {
      terminalRef.value.zoomIn();
    } else {
      terminalRef.value.zoomOut();
    }
  }
}

onMounted(() => {
  if (document.title === "Logsea" && window.location.hash) {
    document.title = `docker logs ${window.location.hash.substring(1)}`;
  }

  fetchAndDisplayLogs();
});

onUnmounted(() => {
  if (logSource.value) logSource.value.close();
});
</script>

<template>
  <div id="terminal-container" @wheel.prevent="handleZoom">
    <TerminalComponent ref="terminalRef" />
  </div>
</template>

<style scoped>
#terminal-container {
  width: 100vw;
  height: 100vh;
}
</style>