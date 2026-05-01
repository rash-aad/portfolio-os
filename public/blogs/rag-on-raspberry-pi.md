---
title: Building a RAG System on a Raspberry Pi with 2GB RAM
date: 2025-12-10
tags: [RAG, Edge AI, Raspberry Pi, LLM]
excerpt: How I built a voice-interactive AI assistant with persistent memory that runs on edge hardware under 2GB RAM using quantization and GGUF models.
---

# Building a RAG System on a Raspberry Pi with 2GB RAM

Running a RAG pipeline on a device with under 2GB RAM sounds impossible — but with the right combination of quantization, efficient vector search, and a lightweight inference engine, it's very much doable.

## The Hardware

I used a **Raspberry Pi 4 (2GB variant)** as the target platform. The constraints were tight:
- Under 2GB total RAM (shared with OS)
- No GPU
- ARM architecture

## The Stack

After a lot of experimentation, I landed on this stack:

- **Ollama** with a GGUF quantized model (Q4_K_M) for inference
- **ChromaDB** with in-memory mode for vector search
- **Whisper (tiny)** for speech-to-text
- **pyttsx3** for text-to-speech
- **LangChain** for the RAG pipeline

## Quantization Was the Key

The biggest win came from using Q4_K_M quantization on a 7B parameter model. This brought it down from ~14GB to under **1.5GB** — small enough to run on the Pi with room to spare for the OS and other processes.

```bash
ollama pull llama3:8b-instruct-q4_K_M
```

## The RAG Pipeline

The pipeline worked like this:

1. User speaks → Whisper transcribes to text
2. Text is embedded using `nomic-embed-text`
3. ChromaDB retrieves the top-k relevant chunks
4. Retrieved context + question is sent to the LLM
5. Response is spoken aloud via TTS

## Results

- **Sub-800ms** response latency end-to-end
- **90% recall accuracy** on user-taught facts
- **1,000+ interactions** per session with stable memory

The hardest part was keeping the embedding model and the generative model from competing for RAM. The solution was to run them sequentially and aggressively unload the embedding model after retrieval.

## Key Takeaways

- Quantization is non-negotiable for edge deployment
- Use streaming responses to hide latency
- ChromaDB's in-memory mode is faster but loses state on restart — switch to persistent if you need memory across reboots

Happy to answer questions — reach me at rashaadnmohammed@gmail.com.
