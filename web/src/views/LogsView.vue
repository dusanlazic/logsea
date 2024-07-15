<script setup>
import TerminalComponent from '@/components/Terminal.vue';
import { useRoute } from 'vue-router'
import { ref, onMounted, onBeforeUnmount } from 'vue'

const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api';

const route = useRoute();
const containerId = ref(route.params.id);
const terminalRef = ref(null);
const aborter = new AbortController();

async function fetchAndDisplayLogs() {
  const logsUrl = `${apiUrl}/containers/${containerId.value}/logs`;

  try {
    const response = await fetch(logsUrl, { signal: aborter.signal });

    terminalRef.value.clear();

    for await (const chunk of response.body) {
      if (aborter.aborted) break;
      terminalRef.value.writeData(chunk);
    }
  } catch (error) {
    if (error.name === 'AbortError') {

    } else {
      console.error('Error fetching logs: ', error);
    }
  }
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

  terminalRef.value.writeData('Fetching logs...\n');

  fetchAndDisplayLogs();
});

onBeforeUnmount(() => {
  aborter.abort();
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