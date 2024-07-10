<template>
    <div ref="term" class="terminal"></div>
</template>
  
<script setup>
import { ref, onMounted, onUnmounted, onUpdated } from 'vue';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '../../node_modules/@xterm/xterm/css/xterm.css';

function useTerminal(containerRef) {
    const terminal = ref(null);
    const fitAddon = new FitAddon();

    onMounted(() => {
        const terminalProps = {
            disableStdin: true,
            cursorStyle: 'underline',
            fontSize: 16,
            fontFamily: 'Fira Code, Consolas, monospace',
            allowProposedApi: true,
        };

        terminal.value = new Terminal(terminalProps);

        terminal.value.loadAddon(fitAddon);
        terminal.value.open(containerRef.value);
        fitAddon.fit();

        window.addEventListener('resize', fitTerminal);
    });

    onUnmounted(() => {
        if (terminal.value) {
            terminal.value.dispose();
        }

        window.removeEventListener('resize', fitTerminal);
    });

    onUpdated(() => {
        fitAddon.fit();
    });

    const writeData = (data) => {
        if (terminal.value) {
            terminal.value.write(data);
        }
    };

    const zoomIn = () => adjustFontSize(3);

    const zoomOut = () => adjustFontSize(-3);

    const adjustFontSize = (change) => {
        const newFontSize = terminal.value.options.fontSize + change;
        terminal.value.options.fontSize = Math.min(Math.max(newFontSize, 12), 46);
        fitTerminal();
    };

    const fitTerminal = () => {
        fitAddon.fit();
    };

    return { writeData, zoomIn, zoomOut };
}

const term = ref(null);
const { writeData, zoomIn, zoomOut } = useTerminal(term);


defineExpose({ writeData, zoomIn, zoomOut });
</script>
  
<style scoped>
.terminal {
    width: 100%;
    height: 100%;
}
</style>
  