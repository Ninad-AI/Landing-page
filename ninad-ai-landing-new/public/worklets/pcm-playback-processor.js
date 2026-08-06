class PcmPlaybackProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.ringBuffer = new Int16Array(8192);
    this.writeIndex = 0;
    this.readIndex = 0;
    this.chunksBuffered = 0;
    this.playbackStarted = false;
    this.chunkSize = 320;
    this.jitterBufferSize = 2;

    this.port.onmessage = (event) => {
      if (event.data instanceof Int16Array) {
        this.enqueueChunk(event.data);
      } else if (event.data instanceof ArrayBuffer) {
        this.enqueueChunk(new Int16Array(event.data));
      }
    };
  }

  enqueueChunk(chunk) {
    const availableSpace = this.ringBuffer.length - this.getBufferedSamples();
    if (chunk.length > availableSpace) {
      return;
    }

    const firstPart = Math.min(chunk.length, this.ringBuffer.length - this.writeIndex);
    this.ringBuffer.set(chunk.subarray(0, firstPart), this.writeIndex);
    if (firstPart < chunk.length) {
      this.ringBuffer.set(chunk.subarray(firstPart), 0);
    }
    this.writeIndex = (this.writeIndex + chunk.length) % this.ringBuffer.length;
    this.chunksBuffered += 1;
  }

  getBufferedSamples() {
    if (this.writeIndex >= this.readIndex) {
      return this.writeIndex - this.readIndex;
    }
    return this.ringBuffer.length - this.readIndex + this.writeIndex;
  }

  getBufferedChunks() {
    return Math.floor(this.getBufferedSamples() / this.chunkSize);
  }

  process(inputs, outputs) {
    const output = outputs[0];
    const channel = output[0];

    if (!this.playbackStarted) {
      if (this.getBufferedChunks() >= this.jitterBufferSize) {
        this.playbackStarted = true;
      }
    }

    if (this.playbackStarted) {
      const availableChunks = this.getBufferedChunks();
      if (availableChunks > 0) {
        const samplesToRead = Math.min(channel.length, availableChunks * this.chunkSize);
        const samplesRead = this.dequeueSamples(channel, samplesToRead);
        if (samplesRead < channel.length) {
          channel.fill(0, samplesRead);
        }
      } else {
        channel.fill(0);
      }
    } else {
      channel.fill(0);
    }

    return true;
  }

  dequeueSamples(output, numSamples) {
    let samplesRead = 0;
    while (samplesRead < numSamples && this.getBufferedSamples() > 0) {
      const firstPart = Math.min(numSamples - samplesRead, this.ringBuffer.length - this.readIndex);
      for (let i = 0; i < firstPart; i++) {
        output[samplesRead + i] = this.ringBuffer[this.readIndex + i] / 32768;
      }
      this.readIndex = (this.readIndex + firstPart) % this.ringBuffer.length;
      samplesRead += firstPart;
    }
    this.chunksBuffered = Math.floor(this.getBufferedSamples() / this.chunkSize);
    return samplesRead;
  }
}

registerProcessor("pcm-playback-processor", PcmPlaybackProcessor);