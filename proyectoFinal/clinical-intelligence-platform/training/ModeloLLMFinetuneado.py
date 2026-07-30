"""
Fine-tuning de Qwen2.5-1.5B con LoRA para generar notas SOAP en inglés a partir
de un diálogo clínico en inglés (TFG "Clinical Intelligence Platform").

La traducción español<->inglés la hace la aplicación, no el modelo, así que aquí
se entrena y evalúa siempre en inglés.

Requiere GPU NVIDIA. Instalación:
    pip install torch --index-url https://download.pytorch.org/whl/cu121
    pip install transformers datasets peft trl bitsandbytes accelerate
"""

import torch
from datasets import load_dataset
from transformers import AutoTokenizer, BitsAndBytesConfig
from peft import LoraConfig
from trl import SFTConfig, SFTTrainer


# Configuración
MODELO_BASE = "Qwen/Qwen2.5-1.5B-Instruct"
DATASET = "omi-health/medical-dialogue-to-soap-summary"
SALIDA = "./modelo_soap_qwen_lora"

MAX_LENGTH = 1600  # longitud máxima de secuencia (cubre el máximo del dataset con margen)

# LoRA: entrena unos adaptadores pequeños y deja congelado el resto del modelo
LORA_R = 16
LORA_ALPHA = 32
LORA_DROPOUT = 0.05
LORA_TARGET_MODULES = ["q_proj", "k_proj", "v_proj", "o_proj"]

NUM_EPOCHS = 3
BATCH_SIZE = 2
GRAD_ACCUM = 8  # batch efectivo = 2 * 8 = 16
LEARNING_RATE = 2e-4
WARMUP_RATIO = 0.03
WEIGHT_DECAY = 0.01


# Cargar dataset (ya viene dividido en train / validation / test)
dataset = load_dataset(DATASET)
train = dataset["train"]
validation = dataset["validation"]
test = dataset["test"]

# Nos quedamos solo con la columna "messages" (el formato de chat que usa SFTTrainer)
train = train.select_columns(["messages"])
validation = validation.select_columns(["messages"])


# Tokenizer, cuantización y LoRA
tokenizer = AutoTokenizer.from_pretrained(MODELO_BASE)
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token  # Qwen no trae pad_token, usamos el eos

# Cuantización a 4 bits (QLoRA) para que el modelo quepa en la GPU
config_4bit = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16,
    bnb_4bit_use_double_quant=True,
)

config_lora = LoraConfig(
    r=LORA_R,
    lora_alpha=LORA_ALPHA,
    lora_dropout=LORA_DROPOUT,
    target_modules=LORA_TARGET_MODULES,
    bias="none",
    task_type="CAUSAL_LM",
)


# Entrenamiento
args = SFTConfig(
    output_dir=SALIDA,
    num_train_epochs=NUM_EPOCHS,
    per_device_train_batch_size=BATCH_SIZE,
    gradient_accumulation_steps=GRAD_ACCUM,
    learning_rate=LEARNING_RATE,
    lr_scheduler_type="cosine",
    warmup_ratio=WARMUP_RATIO,
    weight_decay=WEIGHT_DECAY,
    bf16=True,
    logging_steps=25,
    save_strategy="epoch",
    eval_strategy="epoch",
    max_length=MAX_LENGTH,
    packing=False,
    assistant_only_loss=True,  # la loss se calcula solo sobre la respuesta (la nota SOAP)
    report_to="none",
)

entrenador = SFTTrainer(
    model=MODELO_BASE,
    args=args,
    train_dataset=train,
    eval_dataset=validation,
    processing_class=tokenizer,
    quantization_config=config_4bit,
    peft_config=config_lora,
)

print("\nIniciando entrenamiento...")
resultado = entrenador.train()


# Guardar adaptador
entrenador.save_model(SALIDA)
tokenizer.save_pretrained(SALIDA)
print(f"\nAdaptador LoRA guardado en: {SALIDA}")

evaluacion = entrenador.evaluate()

# Resumen
print("\n" + "=" * 60)
print("RESUMEN DEL ENTRENAMIENTO")
print(f"Loss de entrenamiento: {resultado.metrics['train_loss']:.4f}")
print(f"Loss de validación:    {evaluacion['eval_loss']:.4f}")
print(f"Tiempo:                {resultado.metrics['train_runtime'] / 60:.1f} min")
print("=" * 60)


# Generar ejemplos sobre el test y compararlos con la referencia
modelo = entrenador.model


def generar_soap(entrada):
    prompt = tokenizer.apply_chat_template(entrada, tokenize=False, add_generation_prompt=True)
    entradas = tokenizer(prompt, return_tensors="pt").to(modelo.device)
    salida = modelo.generate(**entradas, max_new_tokens=400, do_sample=False)
    return tokenizer.decode(salida[0][entradas["input_ids"].shape[1]:], skip_special_tokens=True)



print("EJEMPLOS GENERADOS SOBRE EL TEST ------------------")


N_EJEMPLOS = 5
for i, ejemplo in enumerate(test.select(range(N_EJEMPLOS)), start=1):
    entrada = ejemplo["messages"][:-1]
    real = ejemplo["messages"][-1]["content"]
    generado = generar_soap(entrada)
    print(f"\n--- Ejemplo #{i} ---")
    print("SOAP de referencia:")
    print(real)
    print("\nSOAP generado:")
    print(generado)
