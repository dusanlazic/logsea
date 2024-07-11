<script setup>
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
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
    case 'running':
      return '#9ACD32'; // YellowGreen
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

const getHealthIcon = (health) => {
  switch (health) {
    case 'starting':
      return 'ri:progress-0-fill';
    case 'healthy':
      return 'ri:heart-pulse-fill';
    case 'unhealthy':
      return 'ri:alert-fill';
    default:
      return null;
  }
}

const fetchContainers = async () => {
  try {
    const response = await axios.get(`${apiUrl}/containers`);
    containers.value = response.data;
  } catch (error) {
    console.error('Failed to fetch containers:', error);
  }
};

const openLogs = (containerId, event) => {
  const url = `/logs/${containerId}`;
  if (event.button === 0) {
    router.push(url);
  } else if (event.button === 1) {
    window.open(url, '_blank');
  }
};

onMounted(fetchContainers);
</script>

<template>
  <div class="grid-container">
    <div v-for="container in containers" :key="container.id" class="grid-item fade-in"
      :style="{ borderTopColor: getStatusColor(container.status) }"
      @mousedown="event => openLogs(container.id.slice(0, 8), event)">

      <p class="container-id">{{ container.id.slice(0, 8) }}</p>

      <h3>{{ container.name }}
        <Icon :icon="getHealthIcon(container.health)" inline="true" style="font-size: 24px;" />
      </h3>

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
  animation: fadeIn 0.3s;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
}

.grid-item {
  background: #1b1b1b;
  border-top: 5px solid;
  color: #cfcfcf;
  padding: 20px;
  font-family: 'Fira Code', monospace;
  border-radius: 8px;
}

.grid-item:hover {
  background: #242424;
  cursor: pointer;
}

.grid-item h3 {
  margin: 0px;
}

.container-id {
  color: #7a7a7a;
  margin: 0px
}

.container-image {
  color: #7a7a7a;
  margin: 10px 0px 0px 0px;
}
</style>
