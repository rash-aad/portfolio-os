---
title: Fine-Tuning LLMs for Security: What Actually Works
date: 2025-11-18
tags: [LLMs, Fine-tuning, Security, NLP]
excerpt: A practitioner's notes on fine-tuning LLMs for vulnerability classification — dataset curation, prompt engineering, and reducing false positives by 30%.
---

# Fine-Tuning LLMs for Security: What Actually Works

During my freelance ML engineering work, I had to fine-tune LLMs to classify web vulnerabilities. Here's what actually moved the needle — and what didn't.

## The Problem

Off-the-shelf LLMs are decent at talking *about* security concepts, but they're bad at making precise, consistent classifications on structured vulnerability data. We needed a model that could take raw HTTP request/response pairs and output a structured vulnerability label with confidence.

## Dataset Curation (Most Important Step)

This took 60% of the total time. Good fine-tuning data needs to be:

- **Diverse** — cover all vulnerability classes (SQLi, XSS, IDOR, SSRF, etc.)
- **Balanced** — equal representation of positive and negative examples
- **Clean** — mislabeled samples destroy fine-tuning

We ended up with ~8,000 labeled examples. Anything less and the model wouldn't generalize.

## The Training Setup

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import LoraConfig, get_peft_model

lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)
```

We used **LoRA** — full fine-tuning was too expensive and LoRA gave comparable results at a fraction of the compute.

## What Actually Improved Performance

1. **Prompt structure mattered more than model size** — a carefully structured prompt with few-shot examples outperformed a larger model with a naive prompt
2. **Chain-of-thought for borderline cases** — asking the model to "think step by step" before classifying reduced false positives significantly
3. **Confidence calibration** — adding a confidence score to the output format helped downstream triage prioritization

## Results

- **18% improvement** in classification accuracy vs baseline
- **30% reduction** in false positives
- Inference time stayed under 200ms per sample with 4-bit quantization

## What Didn't Work

- **Over-fitting on rare vulnerability classes** — we had to artificially oversample them
- **Very long context inputs** — truncating to the most relevant 512 tokens worked better than passing the full 4k context

The biggest lesson: fine-tuning is mostly a data problem, not a model problem.
