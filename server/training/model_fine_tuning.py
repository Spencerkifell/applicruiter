import csv
from sentence_transformers import SentenceTransformer, InputExample, losses, evaluation
import torch
from torch.utils.data import DataLoader

if torch.cuda.is_available():
    device = torch.device("cuda:0")
else:
    device = torch.device("cpu")
print("Using device:", device)

# Initialize an empty dictionary to store resume data categorized by the 'category' label
category_resume_dict = {}

# Open the 'ResumeDataSet.csv' file for reading
with open('ResumeDataSet.csv', 'r', newline='', encoding='utf-8') as file:
    csv_reader = csv.reader(file)
    
    # Skip the header row in the CSV file
    next(csv_reader, None)
    
    # Iterate through each row in the CSV file
    for row in csv_reader:
        category, resume = row[0], row[1]
        # Check if the 'category' label is not already in the dictionary
        if category not in category_resume_dict:
            category_resume_dict[category] = []  # Create an empty list for this category
        # Append the 'resume' text to the list associated with the 'category' label
        category_resume_dict[category].append(resume)

# The 'category_resume_dict' now contains resume data categorized by 'category'

# Set a similarity threshold for training examples
similarity_amount = 0.8

# Initialize lists to store training examples and their details for printing
train_examples = []
train_examples_print = []

# Create pairs of resumes for training examples
for category in category_resume_dict:
    # Iterate through each 'category'
    for i in range(0, len(category_resume_dict[category]) - 1, 2):
        # Pair resumes within the same 'category'
        if len(category_resume_dict[category]) <= 1:
            break  # If there's only one resume in the category, skip pairing
        
        # Create an InputExample with a label of 0.6 for the pair
        train_examples.append(InputExample(texts=[category_resume_dict[category][i], category_resume_dict[category][i + 1]], label=0.6))
        
        # Store the resume pair and similarity amount for printing
        train_examples_print.append((category_resume_dict[category][i], category_resume_dict[category][i + 1], similarity_amount))

# 'train_examples' now contains pairs of resumes for training semantic similarity
# 'train_examples_print' contains details of the pairs for printing

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