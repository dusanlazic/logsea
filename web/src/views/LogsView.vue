<script setup>
import TerminalComponent from '@/components/Terminal.vue';
import { useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'

const route = useRoute();
const containerId = ref(route.params.id);
const terminalRef = ref(null);

function fetchAndDisplayLogs() {
  const logsUrl = `http://localhost:8000/containers/${containerId.value}/logs`;
  fetch(logsUrl).then(response => {
    const reader = response.body.getReader();
    function push() {
      reader.read().then(({ done, value }) => {
        if (!done) {
          terminalRef.value.writeData(new TextDecoder().decode(value));
          push();
        }
      }).catch(error => {
        console.error('Error reading data: ', error);
      });
    }
    push();
  }).catch(error => {
    console.error('Error fetching logs: ', error);
  });
}

onMounted(() => {
  fetchAndDisplayLogs();
});

</script>

<template>
  <div id="terminal-container">
    <TerminalComponent ref="terminalRef" />
  </div>
</template>

<style scoped>
#terminal-container {
  width: 100%;
  height: 100vh;
}
</style>