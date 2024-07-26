<script setup>
import { useRouter } from 'vue-router';
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { Icon } from '@iconify/vue';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api';
const version = import.meta.env.VITE_LOGSEA_VERSION || '0.1.0';

const containers = ref([]);
const searchQuery = ref('')
const router = useRouter();
const containerEventSource = ref(null);

const loaded = ref(false);

const getStatusColor = (status) => {
  switch (status) {
    case 'created':
      return 'SlateBlue';
    case 'restarting':
      return 'DarkOrange';
    case 'unhealthy':
      return 'Tomato';
    case 'healthy':
    case 'running':
      return 'OliveDrab';
    case 'removing':
      return 'DarkGray';
    case 'paused':
      return 'Gold';
    case 'exited':
      return 'Crimson';
    case 'dead':
      return 'DimGray';
    case 'starting':
      return 'MediumOrchid';
    case 'destroyed':
      return 'Black';
    default:
      return '#1B1B1B';
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
    loaded.value = true;
  } catch (error) {
    console.error('Failed to fetch containers.');
  }
};

const fetchContainerEvents = async () => {
  containerEventSource.value = new EventSource(`${apiUrl}/events`);
  containerEventSource.value.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log(data)
    const index = containers.value.findIndex(c => c.id === data.id);
    if (index !== -1) {
      containers.value[index] = {...containers.value[index], ...data};
    } else {
      containers.value.push(data);
    }
  };
  containerEventSource.value.onerror = (error) => {
    containerEventSource.value.close();
  };
};

const handleItemClick = (container, event) => {
  if (container.status === 'destroyed') return;

  const url = `/logs/${container.id.slice(0, 8)}`;
  if (event.button === 1 || (event.button === 0 && event.ctrlKey)) {
    window.open(`${url}#${container.name}`, '_blank');
  } else if (event.button === 0) {
    router.push(url);
    document.title = `docker logs ${container.name}`;
  }
};

const filteredContainers = computed(() => {
  if (!searchQuery.value) {
    return containers.value;
  }
  const query = searchQuery.value.toLowerCase();
  console.log(query);
  return containers.value.filter(container =>
    container.name.toLowerCase().includes(query) ||
    container.image.toLowerCase().includes(query)
  );
});

onMounted(() => {
  document.title = `Logsea`
  fetchContainers();
  fetchContainerEvents();
});

onUnmounted(() => {
  if (containerEventSource.value) containerEventSource.value.close();
});
</script>

<template>
  <div class="search-container fade-in">
    <input type="text" v-model="searchQuery" :placeholder="`Search containers...`" />
    <Icon icon="iconoir:binocular" />
  </div>

  <div v-if="loaded && filteredContainers.length === 0">
    <div class="not-found fade-in">
      <Icon icon="iconoir:sea-waves" />
      <p>No containers in sight</p>
    </div>
  </div>

  <div class="grid-container">
    <div v-if="!loaded" v-for="i in 12" :key="i" class="grid-item-skeleton">
      <div class="container-details">
        <p class="container-id">&nbsp;</p>
        <p class="container-status">&nbsp;</p>
      </div>
      <h3>● ● ● ●</h3>
      <p class="container-image">&nbsp;</p>
    </div>

    <div v-for="container in filteredContainers" :key="container.id" class="grid-item fade-in" :class="{ destroyed: container.status === 'destroyed'}"
      @mouseup="event => handleItemClick(container, event)">

      <div class="container-details">
        <p class="container-id">{{ container.id.slice(0, 8) }}</p>
        <p class="container-status" :style="{ background: getStatusColor(getAppropriateStatus(container)) }">{{
          getAppropriateStatus(container) }}</p>
      </div>

      <h3>{{ container.name }}</h3>

      <p class="container-image">{{ container.image }}</p>
    </div>
  </div>

  <a href="https://github.com/dusanlazic/logsea" target="_blank" class="version-number">Logsea v{{ version }}</a>
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

@keyframes pulse {
  0% {
    background-color: #1b1b1b;
  }

  50% {
    background-color: #111111;
  }

  100% {
    background-color: #1b1b1b;
  }
}

.fade-in {
  animation: fadeIn 0.15s;
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
  border: 1px solid #1b1b1b;

  transition: background 0.1s ease, border-color 0.1s ease;
}

.grid-item:hover {
  background: #2b2b2b;
  cursor: pointer;
  border-color: #3a3a3a;
}

.grid-item.destroyed {
  opacity: 0.5;
  background: #1b1b1b;
  border-color: #1b1b1b;
  cursor: not-allowed;
}

h3 {
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
  transition: background 0.5s ease;
}

.grid-item-skeleton {
  background: #1b1b1b;
  animation: pulse 1.5s infinite, fadeIn 3s;
  color: #464646;
  padding: 20px;
  font-family: 'Fira Code', monospace;
  border-radius: 8px;
  -moz-user-select: -moz-none;
  -khtml-user-select: none;
  -webkit-user-select: none;
  -o-user-select: none;
  user-select: none;
}

.search-container {
  padding: 20px 20px 0 20px;
  width: 100%;
  box-sizing: border-box;
}

.search-container input {
  width: 100%;
  height: 40px;
  padding: 0px 40px;
  border-radius: 8px;
  border: 1px solid #1b1b1b00;
  background: transparent;
  color: #cfcfcf;
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  box-sizing: border-box;
  transition: background 0.1s ease, border-color 0.1s ease;
  position: relative;
}

.search-container input:focus {
  outline: none;
  border: 1px solid #1b1b1b;
}

.search-container input:hover {
  border-color: #1b1b1b;
}

.search-container .iconify {
  position: absolute;
  left: 30px;
  top: 30px;
  color: #7a7a7a;
  font-size: 20px;
}

.not-found {
  color: #7a7a7a;
  text-align: center;
  margin-top: 60px;
  font-family: 'Fira Code', monospace;
  font-size: x-large;
}

.not-found p {
  margin: 0;
}

.not-found .iconify {
  font-size: 90px;
}

.version-number {
  position: fixed;
  right: 20px;
  bottom: 20px;
  color: #464646;
  font-family: 'Fira Code', monospace;
  font-size: 12px;
  text-decoration: none;
  transition: color 0.1s ease;
}

.version-number:hover {
  color: #7a7a7a;
}
</style>
