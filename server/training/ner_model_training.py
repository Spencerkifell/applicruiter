# Documentation: 
# https://github.com/SohierDane/BigQuery_Helper/tree/master
# https://www.kaggle.com/code/sohier/introduction-to-the-bq-helper-package

# References for the datasets:
# https://www.kaggle.com/datasets/jojo1000/facebook-last-names-with-count
# https://www.kaggle.com/datasets/datagov/usa-names/data

# Summary:
# We'll create a custom NER model using spaCy to extract names from candidates' resumes. For this task, we'll leverage two datasets from Kaggle—one containing first names and the other containing last names. The dataset of last names, obtained from a Facebook dataset, will undergo processing using text and pandas. Meanwhile, the dataset of first names, sourced from a Kaggle dataset, will be queried using BigQuery_Helper, a library that facilitates SQL-syntax-based querying of BigQuery datasets.

# cupy-cuda12x==12.2.0

import spacy
import csv
import os
import pandas as pd
from spacy.training.example import Example
from sklearn.metrics import precision_score, recall_score, f1_score


# Train using GPU since cuda cores are more efficient that the CPU
# Make sure to have a c++ compiler installed (Usually built into Visual Studio) and Nivdia Cuda
spacy.require_gpu()

nlp = spacy.load("en_core_web_md")

print("Training Starting")

# Define two NER components for first names and last names
ner_first_name = nlp.add_pipe("ner", name="FIRST_NAME")
ner_last_name = nlp.add_pipe("ner", name="LAST_NAME")

ner_first_name.add_label("FIRST_NAME")
ner_last_name.add_label("LAST_NAME")

train_examples = []

# Load data from the CSV file (First Names)
print("Adding first name data")
with open('data/source/output_first_names.csv', 'r', newline='') as csv_file:
    reader = csv.DictReader(csv_file)

    # Iterate through the rows in the CSV
    for row in reader:
        first_name = row['name']
        first_name_annotations = {"text": first_name, "entities": [(0, len(first_name), "FIRST_NAME")]}
        doc = nlp.make_doc(first_name)
        example = Example.from_dict(doc, first_name_annotations)
        train_examples.append(example)
    
# Load data from the CSV file (Last Names)
print("Adding last name data")
df = pd.read_csv('data/source/output_last_names.csv')

# Limit the DataFrame to the first 1000 rows
df = df.head(1000)

# Iterate through the limited DataFrame and classify last names to be trained
for index, row in df.iterrows():
    last_name = row['Name']
    last_name_annotations = {"text": last_name, "entities": [(0, len(last_name), "LAST_NAME")]}
    doc = nlp.make_doc(last_name)
    example = Example.from_dict(doc, last_name_annotations)
    train_examples.append(example)

# Seperate data into training and validation sets
split_ratio = 0.8
train_split = int(len(train_examples) * split_ratio)
# Takes the 80% an assigns it to the training data
train_data = train_examples[:train_split]
# From the index where the 80% would roughly overlap it takes the remaining 20%
validation_data = train_examples[:train_split]

# Train the NER model
nlp.begin_training()

# Train for 2 iterations of the training data (Since the data is very simple we don't need that many iterations, even 1 would suffice)
for iteration in range(2):
    print(f"Starting iteration {iteration + 1}")

    example_count = 0

    # Iterate through the training data and update the model accordingly
    for example in train_data:
        # Increment the example count
        example_count += 1

        # Update the model's weight and parameters using the given example
        losses = nlp.update([example], drop=0.5)
        fn_loss = losses["FIRST_NAME"]
        ln_loss = losses["LAST_NAME"]

        # Log the current example's progress
        print(f"Iteration {iteration + 1} - Example {example_count} / {len(train_data)}: Processing example - Loss: (First Name: {fn_loss:.4f}) (Last Name: {ln_loss:.4f})")
    
    # Calculate and log precision, recall, and F1-score on the validation data
    validation_precisions = []
    validation_recalls = []
    validation_f1_scores = []

    # Iterate through the validation data (Compares the truth to the predicted values from the model)
    for example in validation_data:
        # Process the reference text using the NLP pipeline
        doc = nlp(example.reference)
        
        true_entities = [((ent.start, ent.end), ent.label_) for ent in example.reference.ents]
        true_labels = [label for _, label in true_entities]
        
        predicted_entities = [((ent.start_char, ent.end_char), ent.label_) for ent in doc.ents]
        predicted_labels = [label for _, label in predicted_entities]
        
        # Calculate precision, recall, and F1-score for the validation example
        precision = precision_score(true_labels, predicted_labels, average="weighted")
        recall = recall_score(true_labels, predicted_labels, average="weighted")
        f1 = f1_score(true_labels, predicted_labels, average="weighted")
        
        # Append the calculated metrics to their respective lists for tracking
        validation_precisions.append(precision)
        validation_recalls.append(recall)
        validation_f1_scores.append(f1)

    avg_precision = sum(validation_precisions) / len(validation_precisions)
    avg_recall = sum(validation_recalls) / len(validation_recalls)
    # Considers precision and recall which encapsulates both false positives and negatives
    avg_f1_score = sum(validation_f1_scores) / len(validation_f1_scores)

    print(f"Avg. Precision: {avg_precision:.4f}, Avg. Recall: {avg_recall:.4f}, Avg. F1-score: {avg_f1_score:.4f}")

abs_path = os.path.abspath(".") 
nlp.to_disk(f"{abs_path}/model/ner_names_model")