<script setup>
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api';

const containers = ref([]);
const router = useRouter();

const getStatusColor = (status) => {
  switch (status) {
    case 'created':
      return '#6A5ACD'; // SlateBlue
    case 'restarting':
      return '#FF8C00'; // DarkOrange
    case 'unhealthy':
      return '#FF6347'; // Tomato
    case 'healthy':
    case 'running':
      return '#6B8E23'; // OliveDrab
    case 'removing':
      return '#A9A9A9'; // DarkGray
    case 'paused':
      return '#FFD700'; // Gold
    case 'exited':
      return '#DC143C'; // Crimson
    case 'dead':
      return '#808080'; // DimGray
    default:
      return '#1B1B1B'; // Default gray for other statuses
  }
};

const getAppropriateStatus = (container) => {
  if (container.health && container.status === 'running') {
    return container.health;
  }
  return container.status;
};

const fetchContainers = async () => {
  try {
    const response = await axios.get(`${apiUrl}/containers`);
    containers.value = response.data;
  } catch (error) {
    console.error('Failed to fetch containers:', error);
  }
};

const openLogs = (containerId, containerName, event) => {
  const url = `/logs/${containerId}`;
  if (event.button === 0) {
    router.push(url);
    document.title = `docker logs ${containerName}`;
  } else if (event.button === 1) {
    window.open(`${url}#${containerName}`, '_blank');
  }
};

onMounted(() => {
  document.title = `Logsea`
  fetchContainers();
});
</script>

<template>
  <div class="grid-container">
    <div v-for="container in containers" :key="container.id" class="grid-item fade-in"
      :style="{ borderTopColor: getStatusColor(getAppropriateStatus(container)) }"
      @mousedown="event => openLogs(container.id.slice(0, 8), container.name, event)">

      <div class="container-details">
        <p class="container-id">{{ container.id.slice(0, 8) }}</p>
        <p class="container-status" :style="{ background: getStatusColor(getAppropriateStatus(container)) }">{{
          getAppropriateStatus(container) }}</p>
      </div>

      <h3>{{ container.name }}</h3>

      <p class="container-image">{{ container.image }}</p>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

.fade-in {
  animation: fadeIn 0.1s;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
}

.grid-item {
  background: #1b1b1b;

  color: #cfcfcf;
  padding: 20px;
  font-family: 'Fira Code', monospace;
  border-radius: 8px;

  transition: background 0.1s ease, box-shadow 0.1s ease;
}

.grid-item:hover {
  background: #2b2b2b;
  cursor: pointer;
  -webkit-box-shadow: inset 0px 0px 0px 1px #3a3a3a;
  -moz-box-shadow: inset 0px 0px 0px 1px #3a3a3a;
  box-shadow: inset 0px 0px 0px 1px #3a3a3a;
}

.grid-item h3 {
  margin: 0px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.container-image {
  color: #7a7a7a;
  margin: 8px 0px 0px 0px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.container-details {
  display: flex;
  justify-content: space-between;
  padding-bottom: 4px;
}

.container-id {
  color: #7a7a7a;
  margin: 0px;
}

.container-status {
  color: white;
  padding: 3px 8px 3px 8px;
  margin: 0px -4px 0px 0px;
  border-radius: 8px;
  font-size: 9pt;
  font-weight: bold;
}
</style>
