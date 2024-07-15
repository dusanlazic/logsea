<template>
    <div ref="term" class="terminal"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, onBeforeUnmount, onUpdated } from 'vue';
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
            convertEol: true,
        };

        terminal.value = new Terminal(terminalProps);

        terminal.value.loadAddon(fitAddon);
        terminal.value.open(containerRef.value);
        fitAddon.fit();

        window.addEventListener('resize', fitTerminal);
    });

    onBeforeUnmount(() => {
        try {
            terminal.value.dispose();
        } catch (error) {

        }
        window.removeEventListener('resize', fitTerminal);
    });

    onUpdated(() => {
        fitAddon.fit();
    });

    const writeData = (data) => {
        terminal.value.write(data);
    };

    const clear = () => {
        terminal.value.clear();
    };

    const zoomIn = () => adjustFontSize(3);

    const zoomOut = () => adjustFontSize(-3);

    const adjustFontSize = (change) => {
        const newFontSize = terminal.value.options.fontSize + change;
        terminal.value.options.fontSize = Math.min(Math.max(newFontSize, 12), 36);
        fitTerminal();
    };

    const fitTerminal = () => {
        fitAddon.fit();
    };

    return { writeData, zoomIn, zoomOut, clear };
}

const term = ref(null);
const { writeData, zoomIn, zoomOut, clear } = useTerminal(term);


defineExpose({ writeData, zoomIn, zoomOut, clear });
</script>

<style scoped>
.terminal {
    width: 100%;
    height: 100%;
}
</style>