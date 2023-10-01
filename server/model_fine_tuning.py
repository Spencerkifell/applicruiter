import csv
from sentence_transformers import SentenceTransformer, InputExample, losses, evaluation
import torch
from torch.utils.data import DataLoader

if torch.cuda.is_available():
    device = torch.device("cuda:0")
else:
    device = torch.device("cpu")
print("Using device:", device)

category_resume_dict = {}
with open('ResumeDataSet.csv', 'r', newline='', encoding='utf-8') as file:
    csv_reader = csv.reader(file)
    next(csv_reader, None)
    for row in csv_reader:
        category, resume = row[0], row[1]
        if category not in category_resume_dict:
            category_resume_dict[category] = []
        category_resume_dict[category].append(resume)

similarity_amount = 0.8
train_examples = []
train_examples_print = []
for category in category_resume_dict:
    for i in range(0, len(category_resume_dict[category]) - 1, 2):
        if len(category_resume_dict[category]) <= 1:
            break
        train_examples.append(InputExample(texts=[category_resume_dict[category][i], category_resume_dict[category][i + 1]], label=0.6))
        train_examples_print.append((category_resume_dict[category][i], category_resume_dict[category][i + 1], similarity_amount))
print()
print(train_examples_print)

model_save_path = "model"

model = SentenceTransformer('all-mpnet-base-v2')

train_dataloader = DataLoader(train_examples, shuffle=True, batch_size=8)
train_loss = losses.CosineSimilarityLoss(model=model)

evaluator = evaluation.EmbeddingSimilarityEvaluator.from_input_examples(train_examples, name='sts-eval')

model.fit(train_objectives=[(train_dataloader, train_loss)],
          # evaluator=evaluator,
          epochs=5,
          # evaluation_steps=5,
          warmup_steps=100,
          steps_per_epoch=5,
          output_path=model_save_path)